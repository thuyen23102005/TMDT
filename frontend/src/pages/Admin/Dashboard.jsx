import { useEffect, useState } from "react";
import { getDashboard } from "../../services/Admin/dashboardApi";

function Dashboard() {

    const [data, setData] = useState({
        TongSanPham: 0,
        TongKhachHang: 0,
        TongDonHang: 0,
        TongMaGiamGia: 0,
        TongDoanhThu: 0
    });

    useEffect(() => {

        fetchDashboard();

    }, []);

    async function fetchDashboard() {

        try {

            const res = await getDashboard();

            setData(res.data);

        } catch (err) {

            console.log(err);

        }

    }

    return (

        <div className="container-fluid">

            <h2 className="mb-4">
                Dashboard
            </h2>

            <div className="row">

                <div className="col-md mb-3">
                    <div className="card text-white bg-success h-100">
                        <div className="card-body">
                            <h5>Tổng sản phẩm</h5>
                            <h2>{data.TongSanPham}</h2>
                        </div>
                    </div>
                </div>

                <div className="col-md mb-3">
                    <div className="card text-white bg-primary h-100">
                        <div className="card-body">
                            <h5>Tổng khách hàng</h5>
                            <h2>{data.TongKhachHang}</h2>
                        </div>
                    </div>
                </div>

                <div className="col-md mb-3">
                    <div className="card text-white bg-warning h-100">
                        <div className="card-body">
                            <h5>Tổng đơn hàng</h5>
                            <h2>{data.TongDonHang}</h2>
                        </div>
                    </div>
                </div>

                <div className="col-md mb-3">
                    <div className="card text-white bg-info h-100">
                        <div className="card-body">
                            <h5>Tổng mã giảm giá</h5>
                            <h2>{data.TongMaGiamGia}</h2>
                        </div>
                    </div>
                </div>

                <div className="col-md mb-3">
                    <div className="card text-white bg-danger h-100">
                        <div className="card-body">
                            <h5>Tổng doanh thu</h5>
                            <h2>
                                {Number(data.TongDoanhThu).toLocaleString()} đ
                            </h2>
                        </div>
                    </div>
                </div>

            </div>

        </div>

    );

}

export default Dashboard;