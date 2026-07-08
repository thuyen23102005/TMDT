import { useState, useEffect } from "react";

function ProductForm({
    onAdd,
    categories,
    editingProduct
}) {

    const [selectedFile, setSelectedFile] = useState(null);
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
    useEffect(() => {

        if (editingProduct) {

            setFormData(editingProduct);

            setSelectedFile(null);

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

        }

    }, [editingProduct]);

    const handleImageChange = (e) => {

    const file = e.target.files[0];

    
    setSelectedFile(file);

};


    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });

    };

    const handleSubmit = (e) => {

        e.preventDefault();

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
    }

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
                        className="form-control mb-2"
                        placeholder="Tên sản phẩm"
                        name="TenSP"
                        value={formData.TenSP}
                        onChange={handleChange}
                    />

                    <select
                        className="form-control mb-2"
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

                    <input
                        className="form-control mb-2"
                        placeholder="Giá"
                        name="DonGia"
                        value={formData.DonGia}
                        onChange={handleChange}
                    />

                    <input
                        className="form-control mb-2"
                        placeholder="Số lượng tồn"
                        name="SoLuongTon"
                        value={formData.SoLuongTon}
                        onChange={handleChange}
                    />

                    <input
                        className="form-control mb-2"
                        placeholder="Đơn vị tính"
                        name="DonViTinh"
                        value={formData.DonViTinh}
                        onChange={handleChange}
                    />

                    <input
                        type="file"
                        className="form-control mb-2"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    {
                        formData.HinhAnh && (
                            <div className="mb-3">

                                <p>Ảnh hiện tại:</p>

                                <img
                                    src={`http://localhost:5000/uploads/${formData.HinhAnh}`}
                                    width="120"
                                    style={{ borderRadius: 8 }}
                                />

                            </div>
                        )
                    }

                    <textarea
                        className="form-control mb-3"
                        placeholder="Mô tả"
                        name="MoTa"
                        value={formData.MoTa}
                        onChange={handleChange}
                    />

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