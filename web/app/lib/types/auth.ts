
export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nickname?: string; 
  avatar?: string;
  about_me?: string;
}

export interface BaseResponse {
  status: number;
  error?: string;
}

export interface RegisterResponse extends BaseResponse {}

export interface LoginResponse extends BaseResponse {
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    is_public: boolean;
  };
}
