export interface FormState {
  title: string;
  description: string;
  privacy: string;
  image: File | null;
  privateUsers: string[];
}

export interface PostFormProps {
  onCancel: () => void;
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
  privateUsers?: string;
}

export interface PostType {
  id: string;
  author: {
    name: string;
    username: string;
    initials: string;
  };
  timeAgo: string;
  privacy: string;
  title: string;
  description: string;
  imageUrl?: string; 
  likesCount: number;
  commentsCount: number;
}