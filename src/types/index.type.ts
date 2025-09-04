import type { Icons } from "@/components/icons";

export interface NavItem {
  title: string;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  external?: boolean;
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
}

export interface NavItemWithChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export type MainNavItem = NavItemWithChildren;

export type TError<TData> = {
  data: null;
  errors: Record<keyof TData, string>;
  message: string;
  status: string;
  total?: number;
};

export type TSuccess<TData> = {
  data: TData;
  total?: number;
  message: string;
  status: number | string;
};
