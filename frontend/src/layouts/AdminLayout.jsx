import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function AdminLayout() {

    return (

        <div className="d-flex">

            <Sidebar />

            <div className="flex-grow-1 bg-light">

                <Header />

                <div className="p-4">

                    <Outlet />

                </div>

            </div>

        </div>

    );

}

export default AdminLayout;