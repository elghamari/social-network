export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}
