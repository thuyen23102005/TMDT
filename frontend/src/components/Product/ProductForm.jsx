import { useState, useEffect } from "react";

function ProductForm({
    onAdd,
    categories,
    editingProduct
}) {

    const [selectedFile, setSelectedFile] = useState(null);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        TenSP: "",
        MaDM: "",
        DonGia: "",
        MoTa: "",
        HinhAnh: "",
        SoLuongTon: "",
        DonViTinh: "",
        TrangThai: true
    });
    const [preview, setPreview] = useState("");

    useEffect(() => {

        if (editingProduct) {

            setFormData(editingProduct);

            setSelectedFile(null);

            setPreview(
                `http://localhost:5000/uploads/${editingProduct.HinhAnh}`
            );

        } else {

            setFormData({
                TenSP: "",
                MaDM: "",
                DonGia: "",
                MoTa: "",
                HinhAnh: "",
                SoLuongTon: "",
                DonViTinh: "",
                TrangThai: true
            });

            setSelectedFile(null);
            setPreview("");

        }

    }, [editingProduct]);

const handleImageChange = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    const allow = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];

    if (!allow.includes(file.type)) {

        setErrors({
            ...errors,
            image: "Chỉ được chọn JPG, JPEG, PNG hoặc WEBP"
        });

        return;
    }

    setErrors({
        ...errors,
        image: ""
    });

    setSelectedFile(file);

    setPreview(URL.createObjectURL(file));

};


const handleChange = (e) => {

    const { name, value } = e.target;

    let error = "";

    switch (name) {

        case "TenSP":
            if (!value.trim())
                error = "Tên sản phẩm không được để trống";
            break;

        case "MaDM":
            if (!value)
                error = "Vui lòng chọn danh mục";
            break;

        case "DonGia":
            if (!value)
                error = "Giá không được để trống";
            else if (!/^\d+(\.\d+)?$/.test(value))
                error = "Giá chỉ được nhập số";
            break;

        case "SoLuongTon":
            if (!value)
                error = "Số lượng không được để trống";
            else if (!/^\d+$/.test(value))
                error = "Số lượng phải là số nguyên";
            break;

        case "DonViTinh":
            if (!value.trim())
                error = "Nhập đơn vị tính";
            break;

        default:
            break;
    }

    setErrors({
        ...errors,
        [name]: error
    });

    setFormData({
        ...formData,
        [name]: value
    });

};
const validate = () => {

    let newErrors = {};

    if (!formData.TenSP.trim()) {
        newErrors.TenSP = "Tên sản phẩm không được để trống";
    }

    if (!formData.MaDM) {
        newErrors.MaDM = "Vui lòng chọn danh mục";
    }

    if (!formData.DonGia || Number(formData.DonGia) <= 0) {
        newErrors.DonGia = "Giá phải lớn hơn 0";
    }

    if (
        formData.SoLuongTon === "" ||
        Number(formData.SoLuongTon) < 0
    ) {
        newErrors.SoLuongTon = "Số lượng tồn phải ≥ 0";
    }

    if (!formData.DonViTinh.trim()) {
        newErrors.DonViTinh = "Đơn vị tính không được để trống";
    }

    if (!formData.MoTa.trim()) {
        newErrors.MoTa = "Mô tả không được để trống";
    }

    // Chỉ bắt buộc ảnh khi thêm mới
    if (
        !editingProduct &&
        !selectedFile
    ) {
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
        data.append("DonGia", formData.DonGia);
        data.append("MoTa", formData.MoTa);
        data.append("SoLuongTon", formData.SoLuongTon);
        data.append("DonViTinh", formData.DonViTinh);
        data.append("TrangThai", formData.TrangThai);

        // lưu tên ảnh cũ
        data.append("HinhAnh", formData.HinhAnh);

        // chỉ upload nếu có chọn file mới
        if (selectedFile) {
            data.append("image", selectedFile);

            };
        console.log(formData);
        console.log(formData.MaDM);
        onAdd(data);    
        resetForm();      
};
const resetForm = () => {

    setFormData({
        TenSP: "",
        MaDM: "",
        DonGia: "",
        MoTa: "",
        HinhAnh: "",
        SoLuongTon: "",
        DonViTinh: "",
        TrangThai: true
    });

    setSelectedFile(null);

    setPreview("");

};

    return (

        <div className="card mb-4">

            <div className="card-body">

                <h4>

                    {
                        editingProduct
                            ? "Sửa sản phẩm"
                            : "Thêm sản phẩm"
                    }

                </h4>

                <form onSubmit={handleSubmit}>

                    <input
                        className={`form-control mb-1 ${
                            errors.TenSP
                                ? "is-invalid"
                                : formData.TenSP
                                    ? "is-valid"
                                    : ""
                        }`}
                        placeholder="Nhập tên sản phẩm"
                        name="TenSP"
                        value={formData.TenSP}
                        onChange={handleChange}
                    />

                    <div className="invalid-feedback">
                        {errors.TenSP}
                    </div>
                    <select
                        className={`form-control mb-1 ${
                            errors.MaDM
                                ? "is-invalid"
                                : formData.MaDM
                                ? "is-valid"
                                : ""
                        }`}
                        name="MaDM"
                        value={formData.MaDM}
                        onChange={handleChange}
                    >

                    <option value="">
                        Chọn danh mục
                    </option>

                    {
                        categories.map(category => (

                            <option
                                key={category.MaDM}
                                value={category.MaDM}
                            >
                                {category.TenDM}
                            </option>

                        ))
                    }

                    </select>

                    <div className="invalid-feedback">
                        {errors.MaDM}
                    </div>

                    <input
                        className={`form-control mb-1 ${
                            errors.DonGia
                                ? "is-invalid"
                                : formData.DonGia
                                    ? "is-valid"
                                    : ""
                        }`}
                        placeholder="Đơn giá"
                        name="DonGia"
                        value={formData.DonGia}
                        onChange={handleChange}
                    />

                    <div className="invalid-feedback">
                        {errors.DonGia}
                    </div>

                    <input
                        className={`form-control mb-1 ${
                            errors.SoLuongTon
                                ? "is-invalid"
                                : formData.SoLuongTon
                                    ? "is-valid"
                                    : ""
                        }`}
                        placeholder="Số lượng tồn"
                        name="SoLuongTon"
                        value={formData.SoLuongTon}
                        onChange={handleChange}
                    />

                    <div className="invalid-feedback">
                        {errors.SoLuongTon}
                    </div>
                    
                    <input
                        className={`form-control mb-1 ${
                            errors.DonViTinh? "is-invalid"
                            : formData.DonViTinh
                            ? "is-valid"
                            : ""}`}
                        placeholder="Đơn vị tính"
                        name="DonViTinh"
                        value={formData.DonViTinh}
                        onChange={handleChange}
                    />
                    <div className="invalid-feedback">
                    {errors.DonViTinh}
                    </div>

                    <input
                        type="file"
                        className={`form-control ${
                            errors.image ? "is-invalid" : ""
                        }`}
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={handleImageChange}
                    />

                    <div className="invalid-feedback">
                        {errors.image}
                    </div>
                    {
                        errors.HinhAnh &&
                        <small className="text-danger">
                            {errors.HinhAnh}
                        </small>
                    }
                    {!selectedFile && formData.HinhAnh && (
                        <div className="mb-3">
                            <p>
                                <strong>Ảnh hiện tại:</strong> {formData.HinhAnh}
                            </p>

                            <img
                                src={`http://localhost:5000/uploads/${formData.HinhAnh}`}
                                width="120"
                                style={{ borderRadius: 8 }}
                            />
                        </div>
                    )}
                    {selectedFile && (
                        <div className="mb-3">
                            <p>
                                <strong>Ảnh mới:</strong> {selectedFile.name}
                            </p>

                            <img
                                src={preview}
                                width="120"
                                style={{ borderRadius: 8 }}
                            />
                        </div>
                    )}
                    <textarea
                        className={`form-control mb-1 ${
                        errors.MoTa
                        ? "is-invalid"
                        : formData.MoTa
                        ? "is-valid"
                        : ""
                        }`}
                        placeholder="Mô tả"
                        name="MoTa"
                        value={formData.MoTa}
                        onChange={handleChange}
                    />
                    <div className="invalid-feedback">
                    {errors.MoTa}
                    </div>
                    <select
                        className="form-control mb-2"
                        name="TrangThai"
                        value={formData.TrangThai}
                        onChange={handleChange}
                    >
                        <option value={0}>Đang bán</option>
                        <option value={1}>Đã ẩn</option>
                    </select>
                    <button className="btn btn-success">
                        
                        {
                            editingProduct
                                ? "Cập nhật"
                                : "Thêm sản phẩm"
                        }

                    </button>

                </form>

            </div>

        </div>

    );

}

export default ProductForm;