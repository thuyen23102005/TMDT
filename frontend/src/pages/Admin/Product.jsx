import { useEffect, useState } from "react";
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct
} from "../../services/Admin/productApi";

import { getCategories } from "../../services/Admin/categoryApi";
import ProductForm from "../../components/Product/ProductForm";
import Pagination from "../../components/Common/Pagination";

function Product() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchProducts(page);
        fetchCategories();
    }, [page]);

    async function fetchProducts(currentPage) {
        try {
            const res = await getProducts(currentPage);
            setProducts(res.data.products);
            setTotalPages(res.data.totalPages); 
        } catch (error) {
            console.log(error);
        }
    }

    async function fetchCategories() {
        try {
            const res = await getCategories();
            setCategories(res.data);
        } catch (error) {
            console.log(error);
        }
    }

    const handleSave = async (data) => {
        try {
            if (editingProduct) {
                await updateProduct(editingProduct.MaSP, data);
                alert("Cập nhật thành công");
            } else {
                await createProduct(data);
                alert("Thêm thành công");
            }
            await fetchProducts(page);
            setEditingProduct(null);
        } catch (error) {
            alert(error.response?.data?.message || "Có lỗi xảy ra.");
            console.log(error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
        try {
            await deleteProduct(id);
            alert("Đã xóa");
            await fetchProducts(page);
        } catch (err) {
            alert(err.response?.data?.message || "Không thể xóa sản phẩm.");
            console.log(err);
        }
    };

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between mb-3">
                <h2>Quản lý sản phẩm</h2>
                <button
                    className="btn btn-success"
                    onClick={() => setEditingProduct(null)}
                >
                    + Thêm sản phẩm
                </button>
            </div>

            <ProductForm
                onAdd={handleSave}
                categories={categories}
                editingProduct={editingProduct}
            />

            <table className="table table-bordered table-hover mt-3">
                <thead className="table-success">
                    <tr>
                        <th>Tên sản phẩm</th>
                        <th>Hình ảnh</th>
                        <th>Loại hàng</th>
                        <th>HSD</th>
                        <th>Giá gốc</th>
                        <th>Tồn kho</th>
                        <th>Trạng thái</th>
                        <th width="120">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => {
                        // Tính toán hiển thị HSD
                        let hsdDisplay = "-";
                        let isCanDate = false;
                        
                        if (product.LoaiHang === "Dài hạn" && product.HanSuDung) {
                            const dateObj = new Date(product.HanSuDung);
                            hsdDisplay = dateObj.toLocaleDateString('vi-VN');
                            
                            // Highlight màu đỏ nếu còn <= 7 ngày
                            const daysLeft = Math.ceil((dateObj - new Date()) / (1000 * 60 * 60 * 24));
                            if (daysLeft <= 7 && daysLeft >= 0) isCanDate = true;
                        }

                        return (
                            <tr key={product.MaSP}>
                                <td className="fw-bold">{product.TenSP}</td>
                                <td>
                                    <img
                                        src={`${import.meta.env.VITE_API_URL}/uploads/${product.HinhAnh}`}
                                        alt={product.TenSP}
                                        width="60"
                                        height="60"
                                        style={{ objectFit: "cover", borderRadius: "8px" }}
                                    />
                                </td>
                                <td>
                                    <span className={`badge ${product.LoaiHang === 'Trong ngày' ? 'bg-info text-dark' : 'bg-primary'}`}>
                                        {product.LoaiHang}
                                    </span>
                                </td>
                                <td className={isCanDate ? "text-danger fw-bold" : ""}>
                                    {hsdDisplay}
                                </td>
                                <td>{Number(product.GiaGoc).toLocaleString()} đ</td>
                                <td>{product.SoLuongTon} {product.DonViTinh}</td>
                                <td>
                                    {product.TrangThai === 0 ? (
                                        <span className="badge bg-secondary">Đã ẩn</span>
                                    ) : product.SoLuongTon === 0 ? (
                                        <span className="badge bg-danger">Hết hàng</span>
                                    ) : (
                                        <span className="badge bg-success">Đang bán</span>
                                    )}
                                </td>
                                <td>
                                    <button
                                        className="btn btn-warning btn-sm me-2 mb-1"
                                        onClick={() => setEditingProduct(product)}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm mb-1"
                                        onClick={() => handleDelete(product.MaSP)}
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            
            <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />
        </div>
    );
}

export default Product;