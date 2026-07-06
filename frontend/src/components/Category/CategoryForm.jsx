import { useEffect, useState } from "react";

function CategoryForm({
    onAdd,
    onUpdate,
    editingCategory
}) {

    const [tenDM, setTenDM] = useState("");

    const [moTa, setMoTa] = useState("");

    const handleSubmit = (e) => {

        e.preventDefault();

        const data = {
            TenDM: tenDM,
            MoTa: moTa
        };

        if (editingCategory) {

            onUpdate(editingCategory.MaDM, data);

        } else {

            onAdd(data);

        }

        setTenDM("");
        setMoTa("");

    };
    useEffect(() => {

        if (editingCategory) {

            setTenDM(editingCategory.TenDM);
            setMoTa(editingCategory.MoTa);

        }else {

        setTenDM("");
        setMoTa("");

    }

    }, [editingCategory]);
    return (

        <div className="card mb-4">

            <div className="card-body">

                <h4>Thêm danh mục</h4>

                <form onSubmit={handleSubmit}>

                    <input
                        className="form-control mb-3"
                        placeholder="Tên danh mục"
                        value={tenDM}
                        onChange={(e) => setTenDM(e.target.value)}
                    />

                    <textarea
                        className="form-control mb-3"
                        placeholder="Mô tả"
                        value={moTa}
                        onChange={(e) => setMoTa(e.target.value)}
                    />

                    <button className="btn btn-success">

                        {
                            editingCategory
                                ? "Cập nhật"
                                : "Thêm danh mục"
                        }

                    </button>

                </form>

            </div>

        </div>

    );

}

export default CategoryForm;