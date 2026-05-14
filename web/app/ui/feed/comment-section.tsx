"use client";
import "./posts.css";
import CommentCard from "./comment-card";
import { useEffect, useRef, useState } from "react";
import { CommentErrors, CommentSectionProps, CommentState, CommentType } from "@/app/lib/types/feed";
import { validateCommentForm } from "@/app/lib/utils/validate";
import { showToast } from "../layout/toast-store";
import { CreateComment, GetPostComments } from "@/app/lib/services/feed";
import { ImageIcon } from "../icons";

export default function CommentSection({ postId, onCommentCreated }: CommentSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<CommentErrors | null>(null);

  const [inputForm, setInputForm] = useState<CommentState>({
    content: "",
    postId: postId,
    image: null,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInputForm((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setInputForm((prev) => ({ ...prev, image: null }));
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    const errors = validateCommentForm(inputForm);
    if (errors) {
      setFormErrors(errors);
      return;
    }
    setFormErrors(null);

    try {
      const CommentFormData = new FormData();
      CommentFormData.append("content", inputForm.content);
      CommentFormData.append("postId", inputForm.postId.toString());

      if (inputForm.image) {
        CommentFormData.append("image", inputForm.image);
      }

      const response = await CreateComment(CommentFormData);

      if (response) {
        
        if (response.fields) {         
          const backendErrors: any = {};
          Object.keys(response.fields).forEach((key) => {
            if (key === "coverImage" || key === "image") {
              backendErrors[key] = response.fields[key]; 
            } else {
              backendErrors[key] = response.fields[key][0];
            }
          });
          setFormErrors(backendErrors);
          return;
        }
        
        setInputForm({ content: "", postId: postId, image: null });
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchComments(postId, 0, true);
        onCommentCreated();
      }
    } catch (error) {
      showToast("Network error. Please check your connection.");
    }
  };

  const [comments, setComments] = useState<CommentType[]>([]);
  const [cursor, setCursor] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

    const observerTarget = useRef<HTMLDivElement>(null);

  const fetchComments = async (
    postId: number,
    currentCursor: number,
    isReset: boolean = false,
  ) => {
    if (isLoading || (!hasMore && !isReset)) return;
    setIsLoading(true);

    try {
      const response = await GetPostComments(postId, currentCursor);
      if (response) {
        const newComments: CommentType[] = response.comments || response || [];

        setComments((prev) => {
          if (isReset) return newComments;
          const existingIds = new Set(prev.map((p) => p.id));
          const uniqueNewComments = newComments.filter(
            (p) => !existingIds.has(p.id),
          );
          return [...prev, ...uniqueNewComments];
        });

        if (newComments.length < 20) {
          setHasMore(false);
        } else {
          const lastPostId = newComments[newComments.length - 1].id;
          setCursor(lastPostId);
        }
      } else {
        if (isReset) setHasMore(false);
      }
    } catch (error) {
      showToast("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setHasMore(true);
    setCursor(0);
    fetchComments(postId, 0, true);
  }, []);

  useEffect( () => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          fetchComments(postId, cursor, false);
        }
      },
      { threshold: 1.0 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current)
      }
    };

  }, [cursor, hasMore, isLoading] );

  return (
    <div className="comment-section-container">
      <div className="comment-input-wrapper">
        
        <div className="comment-section">
          <input
            type="text"
            placeholder="Write a comment..."
            className={`comment-input ${formErrors?.content ? "input-error" : ""}`}
            style={{ width: "100%" }}
            value={inputForm.content}
            onChange={(e) => {
              setInputForm((prev) => ({ ...prev, content: e.target.value }));
              if (formErrors?.content)
                setFormErrors({ ...formErrors, content: undefined });
            }}
          />
          {formErrors?.content && <p className="error-text">{formErrors.content}</p>}
        </div>

        <div>
          <input
            type="file"
            accept="image/*"
            hidden
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <button
            type="button"
            className="tool-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon size={20} />
            <span>Image</span>
          </button>
        </div>

        <button
          className="btn-send-comment"
          type="button"
          onClick={handleSubmit}
        >
          Send
        </button>
      </div>

      {
        (formErrors?.coverImage && Array.isArray(formErrors.coverImage)) && (
          <div>
            {formErrors.coverImage.map((el: string, index: number) => (
              <p key={index} className="error-text"> {el} </p>
            ))}
          </div>
        )
      }

      {preview && (
        <div className="image-preview-container">
          <img src={preview} alt="Preview" className="image-preview" />
          <button className="remove-image-btn" onClick={removeImage}>
            ✕
          </button>
        </div>
      )}

      <div className="comments-list">
        {comments.length === 0 && !isLoading ? (
          <p className="no-comments-message">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => <CommentCard key={comment.id} comment={comment} />)
        )}

        {isLoading && (
          <div className="loading-spinner">Loading more comments...</div>
        )}

        <div ref={observerTarget} style={{ height: "20px", width: "100%" }}></div>
      </div>
    </div>
  );
}
