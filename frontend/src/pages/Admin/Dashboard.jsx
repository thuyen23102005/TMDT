import { useEffect, useState } from "react";
import { getDashboard } from "../../services/Admin/dashboardApi";
import {
    getDashboardReport,
    getRevenueChart,
    getTopProducts
} from "../../services/Admin/reportApi";

import DashboardFilter from "../../components/Dashboard/DashboardFilter";
import RevenueChart from "../../components/Dashboard/RevenueChart";
import TopProducts from "../../components/Dashboard/TopProducts";

import {
    FaMoneyBillWave,
    FaShoppingCart,
    FaUsers,
    FaLeaf,
    FaTicketAlt,
    FaExclamationTriangle // Bổ sung icon cảnh báo
} from "react-icons/fa";

function Dashboard() {
    const today = new Date().toISOString().slice(0, 10);
    const firstDay = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
    ).toISOString().slice(0, 10);

    const [from, setFrom] = useState(firstDay);
    const [to, setTo] = useState(today);
    const [dashboard, setDashboard] = useState({});
    const [report, setReport] = useState({});
    const [chartData, setChartData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    
    // State lưu trữ danh sách sản phẩm sắp hết hạn
    const [expiringProducts, setExpiringProducts] = useState([]);

    useEffect(() => {
        loadDashboard();
        loadReport();
    }, []);

    const loadDashboard = async () => {
        const res = await getDashboard();
        setDashboard(res.data);
        
        // Cập nhật state nếu backend trả về danh sách hàng cận date
        if (res.data.SanPhamCanDate) {
            setExpiringProducts(res.data.SanPhamCanDate);
        }
    };

    const loadReport = async () => {
        const summary = await getDashboardReport(from, to);
        const chart = await getRevenueChart(from, to);
        const top = await getTopProducts(from, to);

        setReport(summary.data);
        setChartData(chart.data);
        setTopProducts(top.data);
    };

    return (
        <div className="container-fluid pb-4">
            <h2 className="fw-bold mb-3">Dashboard</h2>

            <DashboardFilter
                from={from}
                to={to}
                onFromChange={setFrom}
                onToChange={setTo}
                onSearch={loadReport}
            />

            {/* HÀNG 1: 5 Thẻ Thống Kê (Dàn ngang thành 5 cột trên màn hình lớn) */}
            <div className="row g-3 mb-3">
                <div className="col-xl col-md-4 col-sm-6">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body d-flex align-items-center p-3">
                            <FaLeaf size={32} className="text-success me-3" />
                            <div>
                                <h6 className="mb-1 text-muted" style={{ fontSize: '13px' }}>Tổng sản phẩm</h6>
                                <h4 className="mb-0 fw-bold">{dashboard.TongSanPham || 0}</h4>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl col-md-4 col-sm-6">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body d-flex align-items-center p-3">
                            <FaUsers size={32} className="text-primary me-3" />
                            <div>
                                <h6 className="mb-1 text-muted" style={{ fontSize: '13px' }}>Khách hàng</h6>
                                <h4 className="mb-0 fw-bold">{dashboard.TongKhachHang || 0}</h4>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl col-md-4 col-sm-6">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body d-flex align-items-center p-3">
                            <FaShoppingCart size={32} className="text-warning me-3" />
                            <div>
                                <h6 className="mb-1 text-muted" style={{ fontSize: '13px' }}>Đơn hàng</h6>
                                <h4 className="mb-0 fw-bold">{report.TongDonHang || 0}</h4>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl col-md-6 col-sm-6">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body d-flex align-items-center p-3">
                            <FaMoneyBillWave size={32} className="text-danger me-3" />
                            <div>
                                <h6 className="mb-1 text-muted" style={{ fontSize: '13px' }}>Doanh thu</h6>
                                <h4 className="mb-0 fw-bold">{Number(report.TongDoanhThu || 0).toLocaleString()} đ</h4>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl col-md-6 col-sm-12">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body d-flex align-items-center p-3">
                            <FaTicketAlt size={32} className="text-info me-3" />
                            <div>
                                <h6 className="mb-1 text-muted" style={{ fontSize: '13px' }}>Voucher hoạt động</h6>
                                <h4 className="mb-0 fw-bold">{dashboard.TongMaGiamGia || 0}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* HÀNG 2: Biểu đồ doanh thu (Trái) & Top Sản phẩm (Phải) */}
            <div className="row g-3 mb-3">
                <div className="col-lg-8">
                    <RevenueChart chartData={chartData} />
                </div>
                <div className="col-lg-4">
                    <TopProducts data={topProducts} />
                </div>
            </div>

            {/* HÀNG 3: Bảng Cảnh Báo Hàng Hóa Sắp Hết Hạn */}
            <div className="row g-3">
                <div className="col-12">
                    <div className="card shadow-sm border-danger">
                        <div className="card-header bg-danger text-white fw-bold d-flex justify-content-between align-items-center">
                            <span>
                                <FaExclamationTriangle className="me-2 mb-1" />
                                Cảnh báo xả kho: Sản phẩm sắp hết hạn (≤ 7 ngày)
                            </span>
                            <span className="badge bg-light text-danger rounded-pill fs-6">
                                {expiringProducts.length} mặt hàng
                            </span>
                        </div>
                        
                        <div className="card-body p-0">
                            {/* Khung table có thanh cuộn mượt mà, chiều cao cố định để không làm dài trang */}
                            <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
                                <table className="table table-hover table-sm mb-0">
                                    <thead className="table-light sticky-top">
                                        <tr>
                                            <th className="ps-3">Mã SP</th>
                                            <th>Tên sản phẩm</th>
                                            <th>Tồn kho</th>
                                            <th>Hạn sử dụng</th>
                                            <th>Trạng thái giảm</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {expiringProducts.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="text-center text-muted py-4">
                                                    Tuyệt vời! Không có sản phẩm nào cận date trong kho.
                                                </td>
                                            </tr>
                                        ) : (
                                            expiringProducts.map(sp => {
                                                const daysLeft = Math.ceil((new Date(sp.HanSuDung) - new Date()) / (1000 * 60 * 60 * 24));
                                                return (
                                                    <tr key={sp.MaSP}>
                                                        <td className="ps-3">#{sp.MaSP}</td>
                                                        <td className="fw-bold">{sp.TenSP}</td>
                                                        <td>{sp.SoLuongTon}</td>
                                                        <td className={daysLeft <= 3 ? "text-danger fw-bold" : "text-warning fw-bold"}>
                                                            {new Date(sp.HanSuDung).toLocaleDateString('vi-VN')}
                                                            <span className="ms-1 small">({daysLeft} ngày nữa)</span>
                                                        </td>
                                                        <td>
                                                            <span className="badge bg-danger">Tự động giảm {sp.GiamToiDa}%</span>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default Dashboard;