import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function UserLayout() {
    return (
        <>
            <Header />
            <main className="container mt-4">
                <Outlet />
            </main>
            <Footer />
        </>
    );
}

export default UserLayout;