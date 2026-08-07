import React, { useState, useEffect } from 'react';

const IconPin = (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" />
        <circle cx="12" cy="10" r="2.5" />
    </svg>
);

function SoDiaChi() {
    const [addresses, setAddresses] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);

    const [formData, setFormData] = useState({
        hoTen: '',
        soDienThoai: '',
        soNha: '',       // số nhà, tên đường (nhập tay)
        maTinh: '',       // mã tỉnh/thành phố đã chọn
        maPhuong: '',     // mã phường/xã đã chọn
        macDinh: false,
    });

    // Dữ liệu tỉnh/thành và phường/xã lấy từ API hành chính VN (2 cấp, sau sáp nhập 07/2025)
    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);
    const [loadingWards, setLoadingWards] = useState(false);
    const [addressError, setAddressError] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const addressesPerPage = 4;

    const user = JSON.parse(localStorage.getItem('user'));

    const fetchAddresses = () => {
        if (user) {
            fetch(`${import.meta.env.VITE_API_URL}/api/addresses/${user.maTK}`)
                .then(res => res.json())
                .then(data => setAddresses(data))
                .catch(err => console.error(err));
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    // Lấy danh sách tỉnh/thành phố khi mở form
    useEffect(() => {
        if (showAddForm && provinces.length === 0) {
            fetch('https://provinces.open-api.vn/api/v2/p/')
                .then(res => res.json())
                .then(data => setProvinces(data))
                .catch(() => setAddressError('Không tải được danh sách tỉnh/thành phố.'));
        }
    }, [showAddForm]);

    // Lấy danh sách phường/xã mỗi khi đổi tỉnh
    useEffect(() => {
        if (!formData.maTinh) {
            setWards([]);
            return;
        }
        setLoadingWards(true);
        fetch(`https://provinces.open-api.vn/api/v2/p/${formData.maTinh}?depth=2`)
            .then(res => res.json())
            .then(data => setWards(data.wards || []))
            .catch(() => setAddressError('Không tải được danh sách phường/xã.'))
            .finally(() => setLoadingWards(false));
    }, [formData.maTinh]);

    const handleProvinceChange = (e) => {
        setFormData({ ...formData, maTinh: e.target.value, maPhuong: '' });
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setAddressError('');

        if (!formData.maTinh || !formData.maPhuong) {
            setAddressError('Vui lòng chọn đầy đủ Tỉnh/Thành phố và Phường/Xã.');
            return;
        }

        const tenTinh = provinces.find(p => String(p.code) === String(formData.maTinh))?.name || '';
        const tenPhuong = wards.find(w => String(w.code) === String(formData.maPhuong))?.name || '';
        const diaChiChiTiet = [formData.soNha, tenPhuong, tenTinh].filter(Boolean).join(', ');

        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/addresses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hoTen: formData.hoTen,
                    soDienThoai: formData.soDienThoai,
                    diaChiChiTiet,
                    macDinh: formData.macDinh,
                    maTK: user.maTK,
                })
            });
            alert("Thêm địa chỉ thành công!");
            setShowAddForm(false);
            setFormData({ hoTen: '', soDienThoai: '', soNha: '', maTinh: '', maPhuong: '', macDinh: false });
            setWards([]);
            fetchAddresses();
        } catch (error) {
            alert("Lỗi khi thêm địa chỉ");
        }
    };

    const handleSetDefault = async (maDC) => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/addresses/set-default`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ maTK: user.maTK, maDC })
            });
            fetchAddresses();
        } catch (error) {
            alert("Lỗi cập nhật");
        }
    };

    // Logic Phân trang
    const indexOfLastAddress = currentPage * addressesPerPage;
    const indexOfFirstAddress = indexOfLastAddress - addressesPerPage;
    const currentAddresses = addresses.slice(indexOfFirstAddress, indexOfLastAddress);
    const totalPages = Math.ceil(addresses.length / addressesPerPage);

    return (
        <div className="shadow-sm rounded-4 p-4 p-md-5 bg-white w-100" style={{ maxWidth: 1100 }}>
            <div className="d-flex justify-content-between align-items-center mb-4 pb-4 border-bottom">
                <div>
                    <h5 className="mb-1 fw-semibold">Sổ địa chỉ</h5>
                    <p className="text-muted small mb-0">Quản lý các địa chỉ nhận hàng của bạn</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="btn btn-sm btn-outline-success fw-medium"
                >
                    {showAddForm ? 'Hủy thêm' : '+ Thêm địa chỉ mới'}
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleAddSubmit} className="mb-4 p-3 p-md-4 bg-light border rounded-4">
                    {addressError && (
                        <div className="alert alert-danger py-2 small">{addressError}</div>
                    )}

                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label small text-muted">Họ tên</label>
                            <input
                                type="text"
                                className="form-control"
                                required
                                value={formData.hoTen}
                                onChange={e => setFormData({ ...formData, hoTen: e.target.value })}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small text-muted">Số điện thoại</label>
                            <input
                                type="text"
                                className="form-control"
                                required
                                value={formData.soDienThoai}
                                onChange={e => setFormData({ ...formData, soDienThoai: e.target.value })}
                            />
                        </div>

                        <div className="col-12">
                            <label className="form-label small text-muted">Khu vực</label>
                            <div className="row g-2">
                                <div className="col-md-6">
                                    <select
                                        className="form-select"
                                        required
                                        value={formData.maTinh}
                                        onChange={handleProvinceChange}
                                    >
                                        <option value="">Chọn Tỉnh / Thành phố</option>
                                        {provinces.map(p => (
                                            <option key={p.code} value={p.code}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <select
                                        className="form-select"
                                        required
                                        value={formData.maPhuong}
                                        onChange={e => setFormData({ ...formData, maPhuong: e.target.value })}
                                        disabled={!formData.maTinh || loadingWards}
                                    >
                                        <option value="">
                                            {loadingWards ? 'Đang tải...' : 'Chọn Phường / Xã'}
                                        </option>
                                        {wards.map(w => (
                                            <option key={w.code} value={w.code}>{w.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="col-12">
                            <label className="form-label small text-muted">Số nhà, tên đường</label>
                            <input
                                type="text"
                                className="form-control"
                                required
                                placeholder="Ví dụ: 36/17 Chấn Hưng"
                                value={formData.soNha}
                                onChange={e => setFormData({ ...formData, soNha: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-check mt-3 mb-3">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="defaultCheck"
                            checked={formData.macDinh}
                            onChange={e => setFormData({ ...formData, macDinh: e.target.checked })}
                        />
                        <label className="form-check-label small" htmlFor="defaultCheck">
                            Đặt làm địa chỉ mặc định
                        </label>
                    </div>

                    <button type="submit" className="btn btn-success fw-medium px-4">Lưu địa chỉ</button>
                </form>
            )}

            {addresses.length === 0 ? (
                <p className="text-muted">Bạn chưa có địa chỉ nào. Hãy thêm mới!</p>
            ) : (
                <>
                    <div className="address-list">
                        {currentAddresses.map((addr) => (
                            <div key={addr.MaDC} className="address-item py-3 border-bottom position-relative">
                                <div className="d-flex align-items-start gap-2">
                                    <span className="text-success mt-1"><IconPin /></span>
                                    <div className="flex-grow-1">
                                        <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                                            <span className="fw-bold text-dark">{addr.HoTen}</span>
                                            <span className="text-secondary border-start ps-2">{addr.SoDienThoai}</span>
                                            {addr.MacDinh ? (
                                                <span
                                                    className="badge"
                                                    style={{ backgroundColor: '#eaf3de', color: '#3b6d11', fontWeight: 500, borderRadius: 4 }}
                                                >
                                                    Địa chỉ mặc định
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleSetDefault(addr.MaDC)}
                                                    className="btn btn-sm btn-outline-secondary"
                                                    style={{ fontSize: 12 }}
                                                >
                                                    Thiết lập mặc định
                                                </button>
                                            )}
                                        </div>
                                        <div className="text-muted small">
                                            {addr.DiaChiChiTiet}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-4">
                            <ul className="pagination mb-0">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>«</button>
                                </li>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                        <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                                    </li>
                                ))}
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>»</button>
                                </li>
                            </ul>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default SoDiaChi;