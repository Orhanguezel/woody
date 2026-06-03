export type StoreProduct = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  image?: string;
  alt?: string;
  price: number;
  currency: string;
  stock_quantity?: number;
  product_code?: string;
  meta_title?: string;
  meta_description?: string;
};
