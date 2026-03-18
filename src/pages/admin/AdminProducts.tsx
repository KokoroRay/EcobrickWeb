import { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import { Product } from '../../types/cart';
import { uploadImageToCloudinary } from '../../services/cloudinary';

export default function AdminProducts() {
    const { products, addProduct, updateProduct, deleteProduct } = useProducts();

    const [isEditing, setIsEditing] = useState(false);
    const [id, setId] = useState<string | null>(null);

    // Form
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Standard');
    const [stock, setStock] = useState('');
    const [desc, setDesc] = useState('');
    const [image, setImage] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    // New Fields
    const [sizesInput, setSizesInput] = useState(''); // Comma separated
    const [specKey, setSpecKey] = useState('');
    const [specVal, setSpecVal] = useState('');
    const [specs, setSpecs] = useState<Record<string, string>>({});

    const resetForm = () => {
        setIsEditing(false);
        setId(null);
        setName('');
        setSlug('');
        setPrice('');
        setCategory('Standard');
        setStock('');
        setDesc('');
        setImage('');
        setImageFile(null);
        setSizesInput('');
        setSpecs({});
        setSpecKey('');
        setSpecVal('');
    };

    const handleStartEdit = (p: Product) => {
        setIsEditing(true);
        setId(p.id);
        setName(p.name);
        setSlug(p.slug);
        setPrice(p.price.toString());
        setCategory(p.category);
        setStock(p.stock.toString());
        setDesc(p.description);
        setImage(p.image);
        setImageFile(null);
        setSizesInput(p.sizes ? p.sizes.join(', ') : '');
        setSpecs(p.specifications || {});
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleUploadImage = async () => {
        if (!imageFile) {
            alert('Vui lòng chọn ảnh trước khi upload.');
            return;
        }

        setIsUploadingImage(true);
        try {
            const uploadedUrl = await uploadImageToCloudinary(imageFile);
            setImage(uploadedUrl);
            alert('Upload ảnh thành công lên Cloudinary!');
        } catch (error: any) {
            alert(error?.message || 'Upload ảnh thất bại.');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleAddSpec = () => {
        if (specKey && specVal) {
            setSpecs(prev => ({ ...prev, [specKey]: specVal }));
            setSpecKey('');
            setSpecVal('');
        }
    };

    const handleRemoveSpec = (key: string) => {
        setSpecs(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    const handleSubmit = () => {
        if (!name || !slug || !price) {
            alert("Tên, Slug và Giá là bắt buộc.");
            return;
        }

        const productData: any = {
            name,
            slug,
            price: parseFloat(price),
            category,
            stock: parseInt(stock) || 0,
            description: desc,
            image: image,
            sizes: sizesInput.split(',').map(s => s.trim()).filter(s => s),
            specifications: specs
        };

        if (isEditing && id) {
            updateProduct({ ...productData, id });
            alert("Cập nhật thành công!");
        } else {
            addProduct(productData);
            alert("Thêm mới thành công!");
        }
        resetForm();
    };

    return (
        <div>
            <div className="admin-page-header">
                <h2 className="admin-page-title">Quản lý Sản phẩm</h2>
                <button className="btn primary" onClick={() => { resetForm(); setIsEditing(!isEditing); }}>
                    <i className={`fa-solid ${isEditing ? 'fa-xmark' : 'fa-plus'}`}></i> {isEditing ? 'Đóng form' : 'Thêm sản phẩm'}
                </button>
            </div>

            {isEditing && (
                <div className="card" style={{ padding: '2rem', marginBottom: '2rem', borderLeft: '4px solid #20803F' }}>
                    <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', fontWeight: 700, color: '#1e293b' }}>
                        {id ? 'Chỉnh sửa sản phẩm' : 'Tạo sản phẩm mới'}
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>

                        {/* Left Column: Basic Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-input-group">
                                <label>Tên sản phẩm *</label>
                                <input className="form-field" value={name} onChange={e => { setName(e.target.value); if (!id) setSlug(e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '')); }} placeholder="Ví dụ: Gạch Mosaic Xanh" />
                            </div>
                            <div className="form-input-group">
                                <label>Mã URL (Slug) *</label>
                                <input className="form-field" value={slug} onChange={e => setSlug(e.target.value)} placeholder="gach-mosaic-xanh" />
                            </div>
                            <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-input-group">
                                    <label>Giá niêm yết (VNĐ) *</label>
                                    <input className="form-field" type="number" value={price} onChange={e => setPrice(e.target.value)} />
                                </div>
                                <div className="form-input-group">
                                    <label>Tồn kho</label>
                                    <input className="form-field" type="number" value={stock} onChange={e => setStock(e.target.value)} />
                                </div>
                            </div>
                            <div className="form-input-group">
                                <label>Danh mục</label>
                                <select className="form-field" value={category} onChange={e => setCategory(e.target.value)}>
                                    <option value="Standard">Standard</option>
                                    <option value="Premium">Premium</option>
                                    <option value="Material">Vật liệu thô</option>
                                    <option value="Mini">Mini</option>
                                </select>
                            </div>
                            <div className="form-input-group">
                                <label>Hình ảnh (Cloudinary)</label>
                                <input
                                    className="form-field"
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setImageFile(e.target.files?.[0] || null)}
                                />
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    <button
                                        type="button"
                                        className="btn outline sm"
                                        onClick={handleUploadImage}
                                        disabled={!imageFile || isUploadingImage}
                                    >
                                        {isUploadingImage ? 'Đang upload...' : 'Upload lên Cloudinary'}
                                    </button>
                                </div>
                                {image && (
                                    <div style={{ marginTop: '0.75rem' }}>
                                        <img src={image} alt="Preview" style={{ height: '60px', borderRadius: '4px', objectFit: 'cover' }} />
                                        <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#64748b', wordBreak: 'break-all' }}>
                                            {image}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Details */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-input-group">
                                <label>Mô tả chi tiết</label>
                                <textarea className="form-field" rows={4} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Mô tả đặc điểm, công dụng..."></textarea>
                            </div>

                            <div className="form-input-group">
                                <label>Kích thước (phân cách bằng dấu phẩy)</label>
                                <input className="form-field" value={sizesInput} onChange={e => setSizesInput(e.target.value)} placeholder="15x15cm, 30x30cm" />
                            </div>

                            <div className="form-input-group" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                                <label style={{ marginBottom: '0.5rem', display: 'block' }}>Thông số kỹ thuật</label>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <input className="form-field" placeholder="Tên (VD: Độ dày)" value={specKey} onChange={e => setSpecKey(e.target.value)} style={{ flex: 1 }} />
                                    <input className="form-field" placeholder="Giá trị (VD: 2cm)" value={specVal} onChange={e => setSpecVal(e.target.value)} style={{ flex: 1 }} />
                                    <button className="btn outline sm" onClick={handleAddSpec} type="button"><i className="fa-solid fa-plus"></i></button>
                                </div>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {Object.entries(specs).map(([k, v]) => (
                                        <li key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0', padding: '4px 0' }}>
                                            <span><strong>{k}:</strong> {v}</span>
                                            <button onClick={() => handleRemoveSpec(k)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><i className="fa-solid fa-times"></i></button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'right', marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                        <button className="btn outline" onClick={resetForm} style={{ marginRight: '1rem' }}>Hủy bỏ</button>
                        <button className="btn primary" onClick={handleSubmit}>
                            <i className="fa-solid fa-save"></i> {id ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
                        </button>
                    </div>
                </div>
            )}

            {/* Product Table (Responsive Wrapper) */}
            <div className="table-card" style={{ overflowX: 'auto' }}>
                <table className="pro-table" style={{ minWidth: '600px' }}>
                    <thead>
                        <tr>
                            <th style={{ width: '60px' }}>Ảnh</th>
                            <th>Thông tin sản phẩm</th>
                            <th>Giá bán</th>
                            <th>Kho</th>
                            <th style={{ textAlign: 'center' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id}>
                                <td>
                                    <img src={p.image || 'images/hdpe.jpg'} alt="" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', background: '#f1f5f9' }} />
                                </td>
                                <td>
                                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{p.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{p.slug} • {p.category}</div>
                                </td>
                                <td style={{ fontWeight: 600, color: '#20803F' }}>{p.price.toLocaleString()} ₫</td>
                                <td>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '20px',
                                        background: p.stock > 0 ? '#dcfce7' : '#fee2e2',
                                        color: p.stock > 0 ? '#166534' : '#991b1b',
                                        fontSize: '0.85rem',
                                        fontWeight: 600
                                    }}>
                                        {p.stock}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                        <button className="btn outline sm" onClick={() => handleStartEdit(p)} title="Sửa">
                                            <i className="fa-solid fa-pen"></i>
                                        </button>
                                        <button className="btn outline sm" onClick={() => { if (window.confirm('Bạn có chắc chắn muốn xóa?')) deleteProduct(p.id); }} style={{ color: '#ef4444', borderColor: '#ef4444' }} title="Xóa">
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {products.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Chưa có sản phẩm nào.</div>}
            </div>
        </div>
    );
}
