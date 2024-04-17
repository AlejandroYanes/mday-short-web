export interface Subscription {
  id: number;
  customer: number;
  customerName: string;
  customerEmail: string;
  variant: number;
  cardBrand: string;
  cardDigits: string;
  status: string;
  price: number;
  createdAt: string;
  renewsAt: string;
  endsAt?: string;
  expiresAt?: string;
}

export interface BillingInfo {
  id: number;
  customerName: string;
  customerEmail: string;
  variant: number;
  cardBrand: string;
  cardDigits: string;
  price: number;
  status: string;
}
