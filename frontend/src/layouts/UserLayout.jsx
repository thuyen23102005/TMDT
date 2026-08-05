import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function UserLayout() {
    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <Header />

            <main
                style={{
                    paddingTop: "24px",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column"
                }}
            >
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}

export default UserLayout;