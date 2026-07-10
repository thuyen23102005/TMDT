import { useState } from "react";

function HoSoCaNhan() {
    const [formData, setFormData] = useState({
        ho: "",
        ten: "",
        soDienThoai: "",
        email: "",
        gioiTinh: "nam",
        ngaySinh: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Cập nhật hồ sơ:", formData);
    };

    return (
        <div className="shadow-sm rounded p-4">
            <h5 className="mb-4">Hồ sơ cá nhân</h5>

            <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label className="form-label">Họ*</label>
                        <input
                            type="text"
                            name="ho"
                            className="form-control"
                            placeholder="Họ"
                            value={formData.ho}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Tên*</label>
                        <input
                            type="text"
                            name="ten"
                            className="form-control"
                            placeholder="Tên"
                            value={formData.ten}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label">Số điện thoại*</label>
                    <input
                        type="tel"
                        name="soDienThoai"
                        className="form-control"
                        placeholder="Số điện thoại"
                        value={formData.soDienThoai}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        name="email"
                        className="form-control"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label d-block">Giới tính</label>
                    <div className="form-check form-check-inline">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="gioiTinh"
                            value="nam"
                            checked={formData.gioiTinh === "nam"}
                            onChange={handleChange}
                        />
                        <label className="form-check-label">Nam</label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="gioiTinh"
                            value="nu"
                            checked={formData.gioiTinh === "nu"}
                            onChange={handleChange}
                        />
                        <label className="form-check-label">Nữ</label>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="form-label">Ngày sinh</label>
                    <input
                        type="date"
                        name="ngaySinh"
                        className="form-control"
                        value={formData.ngaySinh}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit" className="btn btn-dark">
                    Lưu thay đổi
                </button>
            </form>
        </div>
    );
}

export default HoSoCaNhan;