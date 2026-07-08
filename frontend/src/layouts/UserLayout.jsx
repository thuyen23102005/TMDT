import { Outlet } from "react-router-dom";
import HeaderUser from "../components/HeaderUser";
import Footer from "../components/Footer";

function UserLayout() {
    return (
        <>
            <HeaderUser />

            <main className="container mt-4">
                <Outlet />
            </main>

            <Footer />
        </>
    );
}

export default UserLayout;