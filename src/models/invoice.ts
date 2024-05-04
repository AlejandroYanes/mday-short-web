export interface Invoice {
  id: number;
  subscriptionId: number;
  customer: number;
  cardBrand: string;
  cardDigits: string;
  currency: string;
  currencyRate: number;
  total: number;
  totalFormatted: string;
  discount: number;
  discountFormatted: string;
  includesTax: boolean;
  tax: number;
  taxFormatted: string;
  status: string;
  refunded: boolean;
  refundedAt?: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}
