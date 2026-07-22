import { useEffect, useState } from "react";

import {
    getDashboard,
} from "../../services/Admin/dashboardApi";

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
    FaTicketAlt
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

    const [topProducts,setTopProducts]=useState([]);

    useEffect(() => {

        loadDashboard();

        loadReport();

    }, []);

    const loadDashboard = async () => {

        const res = await getDashboard();

        setDashboard(res.data);

    };

    const loadReport = async () => {

        const summary = await getDashboardReport(from, to);

        const chart = await getRevenueChart(from, to);

        const top=await getTopProducts(from,to);

        setReport(summary.data);

        setChartData(chart.data);

        setTopProducts(top.data);

    };
    

    return (

        <div className="container-fluid">

            <h2 className="fw-bold mb-4">

                Dashboard

            </h2>

            <DashboardFilter

                from={from}

                to={to}

                onFromChange={setFrom}

                onToChange={setTo}

                onSearch={loadReport}

            />

            <div className="row mb-4">

                <div className="col-xl-2 col-lg-4 col-md-6 mb-3">

                    <div className="card shadow-sm border-0">

                        <div className="card-body d-flex">

                            <FaLeaf
                                size={40}
                                className="text-success me-3"
                            />

                            <div>

                                <h6>Tổng sản phẩm</h6>

                                <h3>

                                    {dashboard.TongSanPham}

                                </h3>

                            </div>

                        </div>

                    </div>

                </div>

                <div className="col-xl-2 col-lg-4 col-md-6 mb-3">

                    <div className="card shadow-sm border-0">

                        <div className="card-body d-flex">

                            <FaUsers
                                size={40}
                                className="text-primary me-3"
                            />

                            <div>

                                <h6>Khách hàng</h6>

                                <h3>

                                    {dashboard.TongKhachHang}

                                </h3>

                            </div>

                        </div>

                    </div>

                </div>

                <div className="col-xl-2 col-lg-4 col-md-6 mb-3">

                    <div className="card shadow-sm border-0">

                        <div className="card-body d-flex">

                            <FaShoppingCart
                                size={40}
                                className="text-warning me-3"
                            />

                            <div>

                                <h6>Đơn hàng</h6>

                                <h3>

                                    {report.TongDonHang}

                                </h3>

                            </div>

                        </div>

                    </div>

                </div>

                <div className="col-xl-2 col-lg-4 col-md-6 mb-3">

                    <div className="card shadow-sm border-0">

                        <div className="card-body d-flex">

                            <FaMoneyBillWave
                                size={40}
                                className="text-danger me-3"
                            />

                            <div>

                                <h6>Doanh thu</h6>

                                <h3>

                                    {Number(report.TongDoanhThu || 0).toLocaleString()} đ

                                </h3>

                            </div>

                        </div>

                    </div>

                </div>
                
                <div className="col-xl-2 col-lg-4 col-md-6 mb-3">

                    <div className="card shadow-sm border-0">

                        <div className="card-body d-flex">

                            <FaTicketAlt
                                size={40}
                                className="text-info me-3"
                            />

                            <div>

                                <h6>Voucher hoạt động</h6>

                                <h3>

                                    {dashboard.TongMaGiamGia}

                                </h3>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            <RevenueChart

                chartData={chartData}

            />

            <div className="row mt-4">

                <div className="col-lg-6">

                    <TopProducts

                        data={topProducts}

                    />

                </div>

            </div>
        </div>

    );

}

export default Dashboard;