import { useState, useEffect } from "react";

function ProductForm({
    onAdd,
    categories,
    editingProduct
}) {
    const today = new Date().toISOString().slice(0, 10);

    const [selectedFile, setSelectedFile] = useState(null);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        TenSP: "",
        MaDM: "",
        GiaGoc: "",          
        GiamToiDa: 30,       
        TuDongGiamGia: true, 
        LoaiHang: "Dài hạn", // Thêm mới
        NgayNhap: today,     // Thêm mới
        HanSuDung: "",       // Thêm mới
        MoTa: "",
        HinhAnh: "",
        SoLuongTon: "",
        DonViTinh: "",
        TrangThai: true
    });
    const [preview, setPreview] = useState("");

    useEffect(() => {
        if (editingProduct) {
            setFormData({
                ...editingProduct,
                // Đảm bảo định dạng YYYY-MM-DD cho input type="date"
                NgayNhap: editingProduct.NgayNhap ? editingProduct.NgayNhap.slice(0, 10) : today,
                HanSuDung: editingProduct.HanSuDung ? editingProduct.HanSuDung.slice(0, 10) : "",
                LoaiHang: editingProduct.LoaiHang || "Dài hạn"
            });
            setSelectedFile(null);
            setPreview(`${import.meta.env.VITE_API_URL}/uploads/${editingProduct.HinhAnh}`);
        } else {
            resetForm();
        }
    }, [editingProduct]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allow = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!allow.includes(file.type)) {
            setErrors({ ...errors, image: "Chỉ được chọn JPG, JPEG, PNG hoặc WEBP" });
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setErrors({ ...errors, image: "Ảnh tối đa 2MB" });
            return;
        }
        setErrors({ ...errors, image: "" });
        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let error = "";

        switch (name) {
            case "TenSP":
                if (!value.trim()) error = "Tên sản phẩm không được để trống";
                else if (value.trim().length < 2) error = "Tên sản phẩm phải có ít nhất 2 ký tự";
                else if (value.trim().length > 100) error = "Tên sản phẩm tối đa 100 ký tự";
                break;
            case "MaDM":
                if (!value) error = "Vui lòng chọn danh mục";
                break;
            case "GiaGoc":
                if (!value) error = "Giá không được để trống";
                else if (!/^\d+(\.\d+)?$/.test(value)) error = "Giá chỉ được nhập số";
                break;
            case "SoLuongTon":
                if (!value) error = "Số lượng không được để trống";
                else if (!/^\d+$/.test(value)) error = "Số lượng phải là số nguyên";
                break;
            case "DonViTinh":
                if (!value.trim()) error = "Đơn vị tính không được để trống";
                else if (value.trim().length > 30) error = "Đơn vị tính tối đa 30 ký tự";
                break;
            case "MoTa":
                if (!value.trim()) error = "Mô tả không được để trống";
                else if (value.trim().length > 1000) error = "Mô tả tối đa 1000 ký tự";
                break;
            default:
                break;
        }

        setErrors({ ...errors, [name]: error });
        
        // Cập nhật formData. Nếu đổi Loại Hàng sang "Trong ngày", reset HSD.
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === "LoaiHang" && value === "Trong ngày" ? { HanSuDung: "" } : {})
        }));
    };

    const validate = () => {
        let newErrors = {};

        if (!formData.TenSP.trim()) newErrors.TenSP = "Tên sản phẩm không được để trống";
        else if (formData.TenSP.trim().length < 2) newErrors.TenSP = "Tên sản phẩm phải có ít nhất 2 ký tự";
        else if (formData.TenSP.trim().length > 100) newErrors.TenSP = "Tên sản phẩm tối đa 100 ký tự";

        if (!formData.MaDM) newErrors.MaDM = "Vui lòng chọn danh mục";
        if (!formData.GiaGoc || Number(formData.GiaGoc) <= 0) newErrors.GiaGoc = "Giá phải lớn hơn 0";
        if (formData.SoLuongTon === "" || Number(formData.SoLuongTon) < 0) newErrors.SoLuongTon = "Số lượng tồn phải ≥ 0";
        if (!formData.DonViTinh.trim()) newErrors.DonViTinh = "Đơn vị tính không được để trống";
        else if (formData.DonViTinh.trim().length > 30) newErrors.DonViTinh = "Đơn vị tính tối đa 30 ký tự";
        if (!formData.MoTa.trim()) newErrors.MoTa = "Mô tả không được để trống";

        if (!formData.NgayNhap) newErrors.NgayNhap = "Vui lòng chọn ngày nhập";
        
        if (formData.LoaiHang === "Dài hạn" && !formData.HanSuDung) {
            newErrors.HanSuDung = "Hàng dài hạn bắt buộc phải có HSD";
        }

        if (formData.NgayNhap && formData.HanSuDung) {
            if (new Date(formData.HanSuDung) < new Date(formData.NgayNhap)) {
                newErrors.HanSuDung = "HSD phải sau ngày nhập";
            }
        }

        if (!editingProduct && !selectedFile) {
            newErrors.HinhAnh = "Vui lòng chọn hình ảnh";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        
        const data = new FormData();
        data.append("TenSP", formData.TenSP);
        data.append("MaDM", formData.MaDM);
        data.append("GiaGoc", formData.GiaGoc); 
        data.append("GiamToiDa", formData.GiamToiDa);
        data.append("TuDongGiamGia", formData.TuDongGiamGia);
        
        data.append("LoaiHang", formData.LoaiHang);
        data.append("NgayNhap", formData.NgayNhap);
        if (formData.HanSuDung) data.append("HanSuDung", formData.HanSuDung);

        data.append("MoTa", formData.MoTa);
        data.append("SoLuongTon", formData.SoLuongTon);
        data.append("DonViTinh", formData.DonViTinh);
        data.append("TrangThai", formData.TrangThai);
        data.append("HinhAnh", formData.HinhAnh);

        if (selectedFile) {
            data.append("image", selectedFile);
        }

        onAdd(data);    
        resetForm();      
    };

    const resetForm = () => {
        setFormData({
            TenSP: "",
            MaDM: "",
            GiaGoc: "",          
            GiamToiDa: 30,       
            TuDongGiamGia: true, 
            LoaiHang: "Dài hạn",
            NgayNhap: today,
            HanSuDung: "",
            MoTa: "",
            HinhAnh: "",
            SoLuongTon: "",
            DonViTinh: "",
            TrangThai: true
        });
        setSelectedFile(null);
        setPreview("");
        setErrors({});
    };

    return (
        <div className="card mb-4">
            <div className="card-body">
                <h4>{editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h4>
                <form onSubmit={handleSubmit}>
                    <input
                        className={`form-control mb-1 ${errors.TenSP ? "is-invalid" : formData.TenSP ? "is-valid" : ""}`}
                        placeholder="Nhập tên sản phẩm"
                        name="TenSP"
                        value={formData.TenSP}
                        onChange={handleChange}
                    />
                    <div className="invalid-feedback">{errors.TenSP}</div>

                    <select
                        className={`form-control mb-1 ${errors.MaDM ? "is-invalid" : formData.MaDM ? "is-valid" : ""}`}
                        name="MaDM"
                        value={formData.MaDM}
                        onChange={handleChange}
                    >
                        <option value="">Chọn danh mục</option>
                        {categories.map(category => (
                            <option key={category.MaDM} value={category.MaDM}>{category.TenDM}</option>
                        ))}
                    </select>
                    <div className="invalid-feedback">{errors.MaDM}</div>

                    <input
                        className={`form-control mb-1 ${errors.GiaGoc ? "is-invalid" : formData.GiaGoc ? "is-valid" : ""}`}
                        placeholder="Giá gốc (VNĐ)"
                        name="GiaGoc"
                        value={formData.GiaGoc}
                        onChange={handleChange}
                    />
                    <div className="invalid-feedback">{errors.GiaGoc}</div>

                    <div className="row mt-2 mb-2">
                        <div className="col-md-6">
                            <label className="form-label text-muted small mb-0">Loại hàng hóa</label>
                            <select
                                className="form-control"
                                name="LoaiHang"
                                value={formData.LoaiHang}
                                onChange={handleChange}
                            >
                                <option value="Dài hạn">Dài hạn (Nông sản khô, đồ hộp...)</option>
                                <option value="Trong ngày">Trong ngày (Rau củ, thịt tươi...)</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label text-muted small mb-0">Ngày nhập</label>
                            <input
                                type="date"
                                className={`form-control ${errors.NgayNhap ? "is-invalid" : ""}`}
                                name="NgayNhap"
                                value={formData.NgayNhap}
                                onChange={handleChange}
                            />
                            <div className="invalid-feedback">{errors.NgayNhap}</div>
                        </div>
                        {formData.LoaiHang === "Dài hạn" && (
                            <div className="col-md-3">
                                <label className="form-label text-muted small mb-0 text-danger">Hạn sử dụng *</label>
                                <input
                                    type="date"
                                    className={`form-control ${errors.HanSuDung ? "is-invalid" : ""}`}
                                    name="HanSuDung"
                                    value={formData.HanSuDung}
                                    onChange={handleChange}
                                />
                                <div className="invalid-feedback">{errors.HanSuDung}</div>
                            </div>
                        )}
                    </div>

                    <div className="row mt-2 mb-2">
                        <div className="col-md-4">
                            <label className="form-label text-muted small mb-0">% Giảm tối đa (Khi cận Date / Cuối giờ)</label>
                            <input
                                type="number"
                                className="form-control"
                                placeholder="% Giảm"
                                name="GiamToiDa"
                                value={formData.GiamToiDa}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-md-8">
                            <label className="form-label text-muted small mb-0">Trạng thái tự động giảm giá</label>
                            <select
                                className="form-control"
                                name="TuDongGiamGia"
                                value={formData.TuDongGiamGia}
                                onChange={(e) => setFormData({...formData, TuDongGiamGia: e.target.value === 'true'})}
                            >
                                <option value={true}>Bật (Giảm theo giờ / Giảm xả kho 7 ngày cuối)</option>
                                <option value={false}>Tắt (Luôn bán đúng giá gốc)</option>
                            </select>
                        </div>
                    </div>

                    <input
                        className={`form-control mb-1 ${errors.SoLuongTon ? "is-invalid" : formData.SoLuongTon ? "is-valid" : ""}`}
                        placeholder="Số lượng tồn"
                        name="SoLuongTon"
                        value={formData.SoLuongTon}
                        onChange={handleChange}
                    />
                    <div className="invalid-feedback">{errors.SoLuongTon}</div>
                    
                    <input
                        className={`form-control mb-1 ${errors.DonViTinh? "is-invalid" : formData.DonViTinh ? "is-valid" : ""}`}
                        placeholder="Đơn vị tính"
                        name="DonViTinh"
                        value={formData.DonViTinh}
                        onChange={handleChange}
                    />
                    <div className="invalid-feedback">{errors.DonViTinh}</div>

                    <input
                        type="file"
                        className={`form-control ${errors.image ? "is-invalid" : ""}`}
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={handleImageChange}
                    />
                    <div className="invalid-feedback">{errors.image}</div>
                    
                    {errors.HinhAnh && <small className="text-danger">{errors.HinhAnh}</small>}
                    
                    {!selectedFile && formData.HinhAnh && (
                        <div className="mb-3 mt-2">
                            <p><strong>Ảnh hiện tại:</strong> {formData.HinhAnh}</p>
                            <img src={`${import.meta.env.VITE_API_URL}/uploads/${formData.HinhAnh}`} width="120" style={{ borderRadius: 8 }} />
                        </div>
                    )}
                    
                    {selectedFile && (
                        <div className="mb-3 mt-2">
                            <p><strong>Ảnh mới:</strong> {selectedFile.name}</p>
                            <img src={preview} width="120" style={{ borderRadius: 8 }} />
                        </div>
                    )}
                    
                    <textarea
                        className={`form-control mb-1 mt-2 ${errors.MoTa ? "is-invalid" : formData.MoTa ? "is-valid" : ""}`}
                        placeholder="Mô tả"
                        name="MoTa"
                        value={formData.MoTa}
                        onChange={handleChange}
                    />
                    <div className="invalid-feedback">{errors.MoTa}</div>
                    
                    <select
                        className="form-control mb-3"
                        name="TrangThai"
                        value={formData.TrangThai}
                        onChange={handleChange}
                    >
                        <option value={0}>Đang bán</option>
                        <option value={1}>Đã ẩn</option>
                    </select>
                    
                    <button className="btn btn-success">
                        {editingProduct ? "Cập nhật" : "Thêm sản phẩm"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ProductForm;