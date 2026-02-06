export type Product = {
    id: string;
    name: string;
    slug: string;
    price: number;
    description: string;
    image: string;
    category: string;
    stock: number;
    specifications?: Record<string, string>;
};

export type CartItem = {
    productId: string;
    product: Product;
    quantity: number;
};
