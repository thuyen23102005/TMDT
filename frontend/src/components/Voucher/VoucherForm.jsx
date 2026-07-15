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
    const [errors, setErrors] = useState({});

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

        let { name, value } = e.target;

        if (name === "Code") {

            value = value.toUpperCase();

            value = value.replace(/\s/g, "");

        }

        setFormData({
            ...formData,
            [name]: value
        });

        setErrors(prev => ({
            ...prev,
            [name]: ""
        }));

    };
    const validate = () => {

        const newErrors = {};

        // Code
        if (!formData.Code.trim()) {
            newErrors.Code = "Vui lòng nhập mã giảm giá";
        }
        else if (!/^[A-Za-z0-9]+$/.test(formData.Code)) {
            newErrors.Code = "Chỉ được nhập chữ và số";
        }
        else if (formData.Code.length < 3 || formData.Code.length > 20) {
            newErrors.Code = "Độ dài từ 3-20 ký tự";
        }

        // Loại giảm
        if (!formData.LoaiGiam) {
            newErrors.LoaiGiam = "Vui lòng chọn loại giảm";
        }

        // Giá trị giảm
        if (!formData.GiaTriGiam) {
            newErrors.GiaTriGiam = "Vui lòng nhập giá trị";
        }
        else if (isNaN(formData.GiaTriGiam)) {
            newErrors.GiaTriGiam = "Chỉ được nhập số";
        }
        else {

            const value = Number(formData.GiaTriGiam);

            if (value <= 0)
                newErrors.GiaTriGiam = "Giá trị phải lớn hơn 0";

            if (
                formData.LoaiGiam === "Phần trăm"
                && value > 100
            ) {
                newErrors.GiaTriGiam = "Không được vượt quá 100%";
            }

        }

        // Ngày bắt đầu
        if (!formData.NgayBD)
            newErrors.NgayBD = "Chọn ngày bắt đầu";

        // Ngày kết thúc
        if (!formData.NgayKT)
            newErrors.NgayKT = "Chọn ngày kết thúc";

        if (
            formData.NgayBD &&
            formData.NgayKT &&
            new Date(formData.NgayKT) < new Date(formData.NgayBD)
        ) {

            newErrors.NgayKT = "Ngày kết thúc phải sau ngày bắt đầu";

        }

        // Điều kiện áp dụng

        if (!formData.DieuKienApDung) {

            newErrors.DieuKienApDung = "Nhập điều kiện áp dụng";

        }
        else if (isNaN(formData.DieuKienApDung)) {

            newErrors.DieuKienApDung = "Chỉ nhập số";

        }
        else if (Number(formData.DieuKienApDung) < 0) {

            newErrors.DieuKienApDung = "Không được nhỏ hơn 0";

        }

        // Số lượng

        if (!formData.SoLuong) {

            newErrors.SoLuong = "Nhập số lượng";

        }
        else if (!Number.isInteger(Number(formData.SoLuong))) {

            newErrors.SoLuong = "Số lượng phải là số nguyên";

        }
        else if (Number(formData.SoLuong) <= 0) {

            newErrors.SoLuong = "Số lượng phải lớn hơn 0";

        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;

    };

const handleSubmit = async (e) => {

    e.preventDefault();

    if (!validate()) return;

    let result;

    if (editingVoucher) {

        result = await onUpdate(editingVoucher.MaGG, formData);

    } else {

        result = await onAdd(formData);

    }

    if (result?.codeError) {

        setErrors(prev => ({
            ...prev,
            Code: result.codeError
        }));

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
                        name="Code"
                        className={`form-control mb-1 ${
                            errors.Code
                                ? "is-invalid"
                                : formData.Code
                                ? "is-valid"
                                : ""
                        }`}
                        placeholder="Code"
                        value={formData.Code}
                        onChange={handleChange}
                    />

                    <div className="invalid-feedback">
                        {errors.Code}
                    </div>
                    
                    <select
                        className={`form-control ${
                            errors.LoaiGiam
                                ? "is-invalid"
                                : formData.LoaiGiam
                                    ? "is-valid"
                                    : ""
                        }`}
                        name="LoaiGiam"
                        value={formData.LoaiGiam}
                        onChange={handleChange}
                    >
                        <option value="">Loại giảm</option>
                        <option value="Phần trăm">Phần trăm</option>
                        <option value="Tiền">Tiền</option>
                    </select>
                    <div className="invalid-feedback">
                        {errors.LoaiGiam}
                    </div>

                    <input
                        className={`form-control ${
                            errors.GiaTriGiam
                                ? "is-invalid"
                                : formData.GiaTriGiam
                                    ? "is-valid"
                                    : ""
                        }`}
                        placeholder={
                            formData.LoaiGiam==="Phần trăm"
                                ? "Giá trị (%)"
                                : "Giá trị (VNĐ)"
                        }
                        name="GiaTriGiam"
                        value={formData.GiaTriGiam}
                        onChange={handleChange}
                    />
                    <div className="invalid-feedback">
                        {errors.GiaTriGiam}
                    </div>
                    
                    <input
                        type="date"
                        className={`form-control ${
                            errors.NgayBD
                                ? "is-invalid"
                                : formData.NgayBD
                                    ? "is-valid"
                                    : ""
                        }`}
                        name="NgayBD"
                        value={formData.NgayBD?.slice(0,10)}
                        onChange={handleChange}
                    />
                    <div className="invalid-feedback">
                        {errors.NgayBD}
                    </div>
                    <input
                        type="date"
                        className={`form-control ${
                            errors.NgayKT
                                ? "is-invalid"
                                : formData.NGayKT
                                    ? "is-valid"
                                    : ""
                        }`}
                        name="NgayKT"
                        value={formData.NgayKT?.slice(0,10)}
                        onChange={handleChange}
                    />
                    <div className="invalid-feedback">
                        {errors.NgayKT}
                    </div>
                    <input
                        className={`form-control ${
                            errors.DieuKienApDung
                                ? "is-invalid"
                                : formData.DieuKienApDung
                                    ? "is-valid"
                                    : ""
                        }`}
                        placeholder="Điều kiện áp dụng"
                        name="DieuKienApDung"
                        value={formData.DieuKienApDung}
                        onChange={handleChange}
                    />
                    <div className="invalid-feedback">
                        {errors.DieuKienApDung}
                    </div>
                    <input
                        className="form-control mb-3"
                        placeholder="Số lượng"
                        name="SoLuong"
                        value={formData.SoLuong}
                        onChange={handleChange}
                    />
                    <div className="invalid-feedback">
                        {errors.SoLuong}
                    </div>

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