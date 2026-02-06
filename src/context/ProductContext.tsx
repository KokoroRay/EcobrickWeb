import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types/cart';

// Initial Mock Data
const initialProducts: Product[] = [
    {
        id: 'p1',
        name: 'Gạch Sinh Thái Mini',
        slug: 'gach-xanh',
        price: 15000,
        description: 'Gạch Ecobrick kích thước nhỏ, phù hợp trang trí nội thất, làm bàn ghế nhỏ.',
        image: '/assets/ecobrick-mini.jpg',
        category: 'Standard',
        stock: 100,
        specifications: {
            'Kích thước': '10x10x20cm',
            'Trọng lượng': '0.5kg nhựa',
            'Màu sắc': 'Xanh, Đa sắc'
        }
    },
    {
        id: 'p2',
        name: 'Gạch Sinh Thái Tiêu Chuẩn',
        slug: 'gach-vang',
        price: 35000,
        description: 'Gạch tiêu chuẩn dùng cho xây dựng bồn hoa, ghế công viên, tường rào.',
        image: '/assets/ecobrick-std.jpg',
        category: 'Standard',
        stock: 50,
        specifications: {
            'Kích thước': '15x15x30cm',
            'Trọng lượng': '1.5kg nhựa',
            'Màu sắc': 'Vàng, Đỏ'
        }
    },
    {
        id: 'p3',
        name: 'Gạch Sinh Thái Cao Cấp',
        slug: 'gach-do',
        price: 120000,
        description: 'Gạch nén mật độ cao, chịu lực tốt, dùng cho các công trình lớn.',
        image: '/assets/ecobrick-premium.jpg',
        category: 'Premium',
        stock: 20,
        specifications: {
            'Kích thước': '20x20x40cm',
            'Trọng lượng': '3kg nhựa',
            'Màu sắc': 'Tùy chọn'
        }
    }
];

type ProductContextType = {
    products: Product[];
    addProduct: (product: Omit<Product, 'id'>) => void;
    updateProduct: (product: Product) => void;
    deleteProduct: (id: string) => void;
    getProductBySlug: (slug: string) => Product | undefined;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>(() => {
        const stored = localStorage.getItem('ecobrick_products');
        return stored ? JSON.parse(stored) : initialProducts;
    });

    useEffect(() => {
        localStorage.setItem('ecobrick_products', JSON.stringify(products));
    }, [products]);

    const addProduct = (product: Omit<Product, 'id'>) => {
        const newProduct = { ...product, id: `prod-${Date.now()}` };
        setProducts(prev => [...prev, newProduct]);
    };

    const updateProduct = (product: Product) => {
        setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    };

    const deleteProduct = (id: string) => {
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    const getProductBySlug = (slug: string) => {
        return products.find(p => p.slug === slug);
    };

    return (
        <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, getProductBySlug }}>
            {children}
        </ProductContext.Provider>
    );
}

export function useProducts() {
    const context = useContext(ProductContext);
    if (!context) throw new Error('useProducts must be used within ProductProvider');
    return context;
}
