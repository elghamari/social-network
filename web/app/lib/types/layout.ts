export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
}

export type ApiResponse = {
  status: number;
  error?: string;
  [key: string]: unknown;
};
