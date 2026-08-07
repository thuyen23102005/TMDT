import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import useScrollDirection from "../hooks/useScrollDirection";
import "./UserLayout.css";

function UserLayout() {
    const isVisible = useScrollDirection();

    return (
        <div className="d-flex flex-column min-vh-100">
            <div
                className="user-sticky-header"
                style={{
                    transform: isVisible ? "translateY(0)" : "translateY(-100%)",
                }}
            >
                <Header />
            </div>

            <main className="user-main-content" style={{ flex: 1 }}>
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}

export default UserLayout;