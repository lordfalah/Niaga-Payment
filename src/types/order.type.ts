import { TPayment, TStatusOrder } from "@prisma/client";

// types/order.ts
export type LineItem = {
  id: string;
  quantity: number;
  price: number;
  subtotal: number;

  product: {
    id: string;
    name: string;
    category?: string | null;
  };
};

export type OrderWithLineItems = {
  id: string;
  customerName: string;
  payment: TPayment;
  status: TStatusOrder;
  totalAmount: number;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  lineItems: LineItem[];
};
