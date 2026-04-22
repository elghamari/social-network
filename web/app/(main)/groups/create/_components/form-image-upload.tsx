import { ImageIcon, XCancelIcon } from "@/app/ui/icons";
import { useRef, useState } from "react";

type GroupImageUploadProps = {
  error: string;
};

export default function GroupImageUpload({ error }: GroupImageUploadProps) {
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
  };

  return (
    <div className="group-form__field">
      <label className="group-form__label">Cover Image (optional)</label>
      <div
        className={`group-form__upload ${imagePreview ? "group-form__upload--has-image" : ""}`}
        onClick={() => !imagePreview && fileInputRef.current?.click()}
      >
        {imagePreview ? (
          <div className="group-form__upload-preview">
            <img src={imagePreview} alt="Cover preview" />
            <button
              type="button"
              className="group-form__upload-remove"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                if (fileInputRef.current) fileInputRef.current.value = "";
                setImagePreview("");
              }}
              aria-label="Remove image"
            >
              <XCancelIcon size={16} />
            </button>
          </div>
        ) : (
          <div className="group-form__upload-placeholder">
            <ImageIcon size={25} />
            <span>Click to upload</span>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          name="coverImage"
          onChange={handleImageUpload}
          aria-label="Upload cover image"
        />
      </div>
      {error && <span className="group-form__error">{error}</span>}
    </div>
  );
}
