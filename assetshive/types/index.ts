export interface Asset {
  id: string;
  user_id: string;
  author_name?: string;
  title: string;
  description?: string;
  price: number;
  file_url: string;
  file_type: 'image' | 'animation';
  is_active: boolean;
  created_at?: string;
}