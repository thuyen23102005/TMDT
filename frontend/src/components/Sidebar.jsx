import { NavLink } from "react-router-dom";

function Sidebar() {
    return (
        <div
            className="bg-success text-white p-3"
            style={{
                width: "250px",
                minHeight: "100vh"
            }}
        >
            <h3 className="text-center mb-4">
                🌱 Nông Sản Shop
            </h3>

            <div className="d-flex flex-column">

                <NavLink
                    to="/"
                    className="btn btn-success text-start mb-2"
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/categories"
                    className="btn btn-success text-start mb-2"
                >
                    Quản lý danh mục
                </NavLink>

                <NavLink
                    to="/products"
                    className="btn btn-success text-start mb-2"
                >
                    Quản lý sản phẩm
                </NavLink>

                <NavLink
                    to="/orders"
                    className="btn btn-success text-start mb-2"
                >
                    Quản lý đơn hàng
                </NavLink>

                <NavLink
                    to="/customers"
                    className="btn btn-success text-start mb-2"
                >
                    Quản lý khách hàng
                </NavLink>

                <NavLink
                    to="/vouchers"
                    className="btn btn-success text-start mb-2"
                >
                    Quản lý mã giảm giá
                </NavLink>

                <NavLink
                    to="/revenue"
                    className="btn btn-success text-start"
                >
                    Doanh thu
                </NavLink>

            </div>
        </div>
    );
}

export default Sidebar;