import { useEffect, useState } from "react";

function VoucherForm({
    editingVoucher,
    onAdd,
    onUpdate,
    onCancel
}) {

    const [formData, setFormData] = useState({
        Code: "",
        LoaiGiam: "",
        GiaTriGiam: "",
        NgayBD: "",
        NgayKT: "",
        DieuKienApDung: "",
        SoLuong: ""
    });

    useEffect(() => {

        if (editingVoucher) {

            setFormData(editingVoucher);

        } else {

            setFormData({
                Code: "",
                LoaiGiam: "",
                GiaTriGiam: "",
                NgayBD: "",
                NgayKT: "",
                DieuKienApDung: "",
                SoLuong: ""
            });

        }

    }, [editingVoucher]);

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = (e) => {

        e.preventDefault();

        if (editingVoucher) {

            onUpdate(editingVoucher.MaGG, formData);

        } else {

            onAdd(formData);

        }

    };

    return (

        <div className="card mb-4">

            <div className="card-body">

                <h4>
                    {editingVoucher ? "Sửa mã giảm giá" : "Thêm mã giảm giá"}
                </h4>

                <form onSubmit={handleSubmit}>

                    <input
                        className="form-control mb-2"
                        placeholder="Code"
                        name="Code"
                        value={formData.Code}
                        onChange={handleChange}
                    />

                    <select
                        className="form-control mb-2"
                        name="LoaiGiam"
                        value={formData.LoaiGiam}
                        onChange={handleChange}
                    >
                        <option value="">Loại giảm</option>
                        <option value="Phần trăm">Phần trăm</option>
                        <option value="Tiền">Tiền</option>
                    </select>

                    <input
                        className="form-control mb-2"
                        placeholder="Giá trị giảm"
                        name="GiaTriGiam"
                        value={formData.GiaTriGiam}
                        onChange={handleChange}
                    />

                    <input
                        type="date"
                        className="form-control mb-2"
                        name="NgayBD"
                        value={formData.NgayBD?.slice(0,10)}
                        onChange={handleChange}
                    />

                    <input
                        type="date"
                        className="form-control mb-2"
                        name="NgayKT"
                        value={formData.NgayKT?.slice(0,10)}
                        onChange={handleChange}
                    />

                    <input
                        className="form-control mb-2"
                        placeholder="Điều kiện áp dụng"
                        name="DieuKienApDung"
                        value={formData.DieuKienApDung}
                        onChange={handleChange}
                    />

                    <input
                        className="form-control mb-3"
                        placeholder="Số lượng"
                        name="SoLuong"
                        value={formData.SoLuong}
                        onChange={handleChange}
                    />

                    <button className="btn btn-success me-2">
                        {editingVoucher ? "Cập nhật" : "Thêm"}
                    </button>

                    {editingVoucher && (

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onCancel}
                        >
                            Hủy
                        </button>

                    )}

                </form>

            </div>

        </div>

    );

}

export default VoucherForm;