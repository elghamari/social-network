export interface FormState {
  title: string;
  description: string;
  privacy: string;
  image: File | null;
  privateUsers: string[];
}

export interface PostFormProps {
  onCancel: () => void;
  onPostCreated?: () => void;
  inGroup: boolean;
  groupId?: string;
}

export interface CreatePostFormProps {
  onPostCreated?: () => void;
}

export interface followingUsers {
  id: string;
  first_name: string;
  last_name: string;
}

export interface PrivateSectionProps {
  users: followingUsers[];
  privateUsers: string[];
  toggleUser: (userId: string) => void;
}

export type PostErrors = {
  title?: string;
  description?: string;
  privacy?: string;
  private?: string;
  duplicate?: string;
  coverImage?: [] | string;
};

export interface PostType {
  id: number;
  author: {
    id: string;
    nickname: string;
    fistname: string;
    lastname: string;
    avatar?: string;
  };
  group: {
    group_id?: number;
    group_title?: string;
  };
  title: string;
  description: string;
  privacy: string;
  image_url?: string;
  created_at: string;
  is_liked: boolean;
  total_likes: number;
  total_comments: number;
}

export interface CommentState {
  content: string;
  postId: number;
  image: File | null;
}

export type CommentErrors = {
  content?: string;
  coverImage?: string;
};

export interface CommentType {
  id: number;
  post_id: number;
  author: {
    id: string;
    nickname: string;
    fistname: string;
    lastname: string;
    avatar?: string;
  };
  content: string;
  image_url?: string;
  created_at: string;
}

export interface PostListProps {
  refreshKey?: number;
  fetchData: (cursor: number) => Promise<any>; 
}

export interface CommentSectionProps {
  postId: number;
  onCommentCreated: () => void;
}