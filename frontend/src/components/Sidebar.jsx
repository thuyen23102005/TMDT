import { NavLink } from "react-router-dom";

function Sidebar() {
    const getNavLinkClass = ({ isActive }) => {
        return isActive 
            ? "btn btn-success text-start mb-2 fw-bold border border-2 border-white" 
            : "btn btn-success text-start mb-2 opacity-75 border-0";
    };

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

            <div className="d-flex flex-column mt-4">

                <NavLink to="/admin" end className={getNavLinkClass}>
                    Dashboard
                </NavLink>

                <NavLink to="/admin/categories" className={getNavLinkClass}>
                    Quản lý danh mục
                </NavLink>

                <NavLink to="/admin/products" className={getNavLinkClass}>
                    Quản lý sản phẩm
                </NavLink>

                <NavLink to="/admin/orders" className={getNavLinkClass}>
                    Quản lý đơn hàng
                </NavLink>

                <NavLink to="/admin/customers" className={getNavLinkClass}>
                    Quản lý khách hàng
                </NavLink>

                <NavLink to="/admin/vouchers" className={getNavLinkClass}>
                    Quản lý mã giảm giá
                </NavLink>

                <NavLink to="/admin/revenue" className={getNavLinkClass}>
                    Doanh thu
                </NavLink>

            </div>
        </div>
    );
}

export default Sidebar;