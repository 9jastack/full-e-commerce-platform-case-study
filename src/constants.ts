import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Minimalist Desk Lamp',
    price: 49.99,
    category: 'Home Office',
    image: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&q=80&w=800&h=800',
    description: 'A sleek, modern desk lamp with adjustable brightness and color temperature. Perfect for any minimalist workspace.'
  },
  {
    id: 'p2',
    name: 'Ergonomic Office Chair',
    price: 299.99,
    category: 'Furniture',
    image: 'https://images.unsplash.com/photo-1505797149-43b007662c76?auto=format&fit=crop&q=80&w=800&h=800',
    description: 'Premium ergonomic chair designed for long hours of comfort. Features lumbar support and breathable mesh.'
  },
  {
    id: 'p3',
    name: 'Wireless Mechanical Keyboard',
    price: 129.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=800&h=800',
    description: 'Compact 75% layout mechanical keyboard with hot-swappable switches and RGB lighting.'
  },
  {
    id: 'p4',
    name: 'Noise Cancelling Headphones',
    price: 199.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800&h=800',
    description: 'Industry-leading noise cancellation with 40-hour battery life and high-fidelity audio.'
  },
  {
    id: 'p5',
    name: 'Leather Notebook Cover',
    price: 34.99,
    category: 'Stationery',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800&h=800',
    description: 'Handcrafted genuine leather cover for A5 notebooks. Includes pen loop and card slots.'
  },
  {
    id: 'p6',
    name: 'Ceramic Coffee Mug',
    price: 19.99,
    category: 'Kitchen',
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=800&h=800',
    description: 'Hand-thrown ceramic mug with a unique glaze finish. Microwave and dishwasher safe.'
  },
  {
    id: 'p7',
    name: 'Smart Table Clock',
    price: 59.99,
    category: 'Home Office',
    image: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ad5?auto=format&fit=crop&q=80&w=800&h=800',
    description: 'Minimalist digital clock with temperature display and wireless charging base.'
  },
  {
    id: 'p8',
    name: 'Oak Monitor Stand',
    price: 89.99,
    category: 'Furniture',
    image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&q=80&w=800&h=800',
    description: 'Solid oak monitor riser to improve posture and clear desk space.'
  }
];

export const CATEGORIES = ['All', 'Home Office', 'Furniture', 'Electronics', 'Stationery', 'Kitchen'];
