export interface PaymentMethod {
  id: string;
  name: string;
  type: "e_wallet" | "bank_transfer" | "credit_card" | "cash";
  icon?: string;
  description?: string;
  isActive: boolean;
}
