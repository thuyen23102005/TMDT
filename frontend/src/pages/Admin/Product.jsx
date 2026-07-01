import { useEffect, useState } from "react";
import { getProducts } from "../../services/productApi";

function Product() {

    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {

        try {

            const res = await getProducts();

            setProducts(res.data);

        } catch (error) {

            console.log(error);

        }

    }

    return (

        <div className="container-fluid">

            <div className="d-flex justify-content-between mb-3">

                <h2>Quản lý sản phẩm</h2>

                <button className="btn btn-success">

                    + Thêm sản phẩm

                </button>

            </div>

            <table className="table table-bordered table-hover">

                <thead className="table-success">

                    <tr>

                        <th>Mã</th>

                        <th>Tên sản phẩm</th>

                        <th>Danh mục</th>

                        <th>Giá</th>

                        <th>Tồn kho</th>

                        <th>Đơn vị</th>

                        <th>Trạng thái</th>

                    </tr>

                </thead>

                <tbody>

                    {
                        products.map(product => (

                            <tr key={product.MaSP}>

                                <td>{product.MaSP}</td>

                                <td>{product.TenSP}</td>

                                <td>{product.TenDM}</td>

                                <td>{Number(product.DonGia).toLocaleString()} đ</td>

                                <td>{product.SoLuongTon}</td>

                                <td>{product.DonViTinh}</td>

                                <td>{product.TrangThai}</td>

                            </tr>

                        ))
                    }

                </tbody>

            </table>

        </div>

    );

}

export default Product;