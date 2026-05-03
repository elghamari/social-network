export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
}

<<<<<<< HEAD
export type ApiResponse = {
  status: number;
  error?: string;
  [key: string]: unknown;
};
=======
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}
>>>>>>> origin/feed
