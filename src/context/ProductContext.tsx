import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types/cart';

// Initial Mock Data with CORRECT image paths
const initialProducts: Product[] = [
    {
        id: 'p1',
        name: 'Gạch Mosaic Xanh (Tiêu chuẩn)',
        slug: 'gach-mosaic-xanh',
        price: 45000,
        description: 'Gạch Mosaic được làm từ nhựa tái chế 100%, có độ bền cao, chống thấm nước, phù hợp trang trí nội ngoại thất. Màu xanh tự nhiên từ nhựa HDPE.',
        image: 'images/green-mosaic-tile.jpg',
        category: 'Standard',
        stock: 120,
        sizes: ['15x15cm', '30x30cm'],
        specifications: {
            'Kích thước': '15x15 cm',
            'Độ dày': '1.2 cm',
            'Trọng lượng': '0.3 kg',
            'Chất liệu': '100% HDPE tái chế',
            'Màu sắc': 'Xanh lá'
        }
    },
    {
        id: 'p2',
        name: 'Tấm Ốp EcoTerrazzo',
        slug: 'tam-op-ecoterrazzo',
        price: 250000,
        description: 'Tấm ốp tường phong cách Terrazzo hiện đại. Sản phẩm được ép nhiệt cao tần từ nhựa phế thải, tạo nên họa tiết độc bản cho mỗi tấm.',
        image: 'images/ecoterrazzo-panel.jpg',
        category: 'Premium',
        stock: 45,
        sizes: ['60x60cm', '120x60cm'],
        specifications: {
            'Kích thước': '60x60 cm',
            'Độ dày': '2.0 cm',
            'Trọng lượng': '2.5 kg',
            'Chất liệu': 'Nhựa hỗn hợp',
            'Bề mặt': 'Nhẵn bóng / Nhám mờ'
        }
    },
    {
        id: 'p3',
        name: 'Khối Nhựa HDPE Thô',
        slug: 'khoi-nhua-hdpe',
        price: 35000,
        description: 'Khối nhựa HDPE đã qua sơ chế và ép khối, thích hợp cho các đơn vị gia công, điêu khắc hoặc tái chế thứ cấp.',
        image: 'images/hdpe.jpg',
        category: 'Material',
        stock: 500,
        sizes: ['1kg', '5kg', '10kg'],
        specifications: {
            'Kích thước': 'Tùy chỉnh',
            'Độ tinh khiết': '>95%',
            'Nhiệt độ nóng chảy': '130°C',
            'Màu sắc': 'Đa dạng'
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
        // Force refresh from initialProducts to ensure image paths are up to date for this deployment
        // (Bypassing localStorage check for now to fix user's report without clearing cache manually)
        return initialProducts;
        /* 
        const stored = localStorage.getItem('ecobrick_products');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                return parsed.length > 0 ? parsed : initialProducts;
            } catch {
                return initialProducts;
            }
        }
        return initialProducts; 
        */
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
