import { FaBell, FaUserCircle } from "react-icons/fa";

function HeaderAdmin() {

    return (

        <header
            className="bg-white shadow-sm d-flex justify-content-between align-items-center px-4"
            style={{
                height: "70px",
                position: "sticky",
                top: 0,
                zIndex: 999,
                borderBottom: "1px solid #e5e5e5"
            }}
        >

            <div>

                <h4
                    className="mb-0 fw-bold text-success"
                >
                    🌱 Trang quản trị
                </h4>

                <small className="text-muted">
                    Hệ thống quản lý Nông Sản Shop
                </small>

            </div>

            <div className="d-flex align-items-center">


                <div className="dropdown">

                    <button
                        className="btn btn-light d-flex align-items-center"
                        
                    >

                        <FaUserCircle
                            size={28}
                            className="me-2 text-success"
                        />

                        <div className="text-start">

                            <div
                                className="fw-semibold"
                            >
                                Admin
                            </div>

                            <small className="text-muted">
                                Quản trị viên
                            </small>

                        </div>

                    </button>

                </div>

            </div>

        </header>

    );

}

export default HeaderAdmin;