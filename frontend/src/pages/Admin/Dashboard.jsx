function Dashboard() {
    return (

        <div>

            <h2 className="mb-4">
                Dashboard
            </h2>

            <div className="row">

                <div className="col-md-3">

                    <div className="card shadow">

                        <div className="card-body">

                            <h5>Tổng sản phẩm</h5>

                            <h2>0</h2>

                        </div>

                    </div>

                </div>

                <div className="col-md-3">

                    <div className="card shadow">

                        <div className="card-body">

                            <h5>Đơn hàng</h5>

                            <h2>0</h2>

                        </div>

                    </div>

                </div>

                <div className="col-md-3">

                    <div className="card shadow">

                        <div className="card-body">

                            <h5>Khách hàng</h5>

                            <h2>0</h2>

                        </div>

                    </div>

                </div>

                <div className="col-md-3">

                    <div className="card shadow">

                        <div className="card-body">

                            <h5>Doanh thu</h5>

                            <h2>0 đ</h2>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );
}

export default Dashboard;