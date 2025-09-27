export interface OrderItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
  image: string | null;
}

export interface Order {
  id: string;
  display_id?: string; // New column for the formatted order ID
  order_date: string;
  total_amount: number;
  items: OrderItem[];
  profiles: { email: string } | null;
}
