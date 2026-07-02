import { useEffect, useState } from "react";

import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from "../../services/categoryApi";

import CategoryForm from "../../components/Category/CategoryForm";
import CategoryTable from "../../components/Category/CategoryTable";

function Category() {

    const [categories, setCategories] = useState([]);
    const [editingCategory, setEditingCategory] = useState(null);

    const fetchCategories = async () => {
        try {

            const res = await getCategories();

            setCategories(res.data);

        } catch (error) {

            console.log(error);

        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAdd = async (data) => {

        try {

            await createCategory(data);

            alert("Thêm thành công!");

            fetchCategories();

        } catch (error) {

            console.log(error);

        }

        
    };
    const handleUpdate = async (id, data) => {

        try {

            await updateCategory(id, data);

            alert("Cập nhật thành công");

            fetchCategories();

            setEditingCategory(null);

        } catch (error) {

            console.log(error);

        }

    };
    const handleDelete = async (id) => {

        const confirmDelete = window.confirm(
            "Bạn có chắc muốn xóa danh mục này không?"
        );

        if (!confirmDelete) return;

        try {

            await deleteCategory(id);

            alert("Xóa thành công!");

            fetchCategories();

        } catch (error) {

            console.log(error);

        }

    };
    return (

        <div className="container">

            <h2 className="mb-4">
                Quản lý danh mục
            </h2>

            <CategoryForm
                onAdd={handleAdd}
                onUpdate={handleUpdate}
                editingCategory={editingCategory}
            />

            <CategoryTable
                categories={categories}
                onEdit={setEditingCategory}
                onDelete={handleDelete}
            />

        </div>

    );

}

export default Category;