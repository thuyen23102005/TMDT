import { useEffect, useState } from "react";
import { getCategories } from "../../services/categoryApi";

function Category() {

    const [categories, setCategories] = useState([]);



useEffect(() => {
    const fetchCategories = async () => {
        try {
            const response = await getCategories();
            setCategories(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    fetchCategories();
}, []);


    return (

        <div className="container">

            <div className="d-flex justify-content-between align-items-center mb-3">

                <h2>Quản lý danh mục</h2>

                <button className="btn btn-success">
                    Thêm danh mục
                </button>

            </div>

            <table className="table table-bordered table-hover">

                <thead className="table-success">

                    <tr>

                        <th>Mã</th>

                        <th>Tên danh mục</th>

                        <th>Mô tả</th>

                        <th width="150">
                            Thao tác
                        </th>

                    </tr>

                </thead>

                <tbody>

                    {
                        categories.map(category => (

                            <tr key={category.MaDM}>

                                <td>{category.MaDM}</td>

                                <td>{category.TenDM}</td>

                                <td>{category.MoTa}</td>

                                <td>

                                    <button className="btn btn-warning btn-sm me-2">
                                        Sửa
                                    </button>

                                    <button className="btn btn-danger btn-sm">
                                        Xóa
                                    </button>

                                </td>

                            </tr>

                        ))
                    }

                </tbody>

            </table>

        </div>

    );

}

export default Category;