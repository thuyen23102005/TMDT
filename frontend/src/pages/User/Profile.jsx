import { Link, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

function Profile() {

    const location = useLocation();

    const [orders, setOrders] = useState([]);
    const [user, setUser] = useState(null);

    const [avatarUrl, setAvatarUrl] = useState(null);
    const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);

    const fileInputRef = useRef(null);


    const fetchOrders = () => {

        const storedUser = JSON.parse(localStorage.getItem("user"));

        if(storedUser){
            fetch(`http://localhost:5000/api/orders/user/${storedUser.maTK}`)
                .then(res => res.json())
                .then(data => setOrders(data))
                .catch(err => console.log(err));
        }

    };


    useEffect(()=>{

        const storedUser = JSON.parse(localStorage.getItem("user"));

        setUser(storedUser);

        if(storedUser?.avatarUrl){
            setAvatarUrl(storedUser.avatarUrl);
        }


        fetchOrders();


    },[location.pathname]);



    const totalOrders = orders.length;


    const totalSpent = orders
        .filter(o=>o.TrangThaiThanhToan==="Đã thanh toán")
        .reduce((sum,o)=>sum + Number(o.TongTien),0);



    const displayName =
        user ? (user.HoTen || user.email) : "Họ và tên";


    const avatarLetter =
        displayName.charAt(0).toUpperCase();



    const handleAvatarChange=(e)=>{

        const file=e.target.files[0];

        if(!file) return;


        setAvatarUrl(
            URL.createObjectURL(file)
        );

    };



    const menuLinkStyle={
        display:"flex",
        alignItems:"center",
        gap:"10px",
        padding:"10px 12px",
        borderRadius:"10px",
        textDecoration:"none"
    };



    const getActiveStyle=(path)=>{

        const active =
            path==="/profile"
            ? location.pathname==="/profile"
            : location.pathname.includes(path);


        return {
            ...menuLinkStyle,
            color: active ? "#2e7d32":"#212529",
            fontWeight: active ? 700:400,
            backgroundColor:
                active
                ?"rgba(46,125,50,0.08)"
                :"transparent"
        };

    };



return (

<div className="row g-4 pb-5">


<div className="col-md-3">


<div
className="rounded-4 p-4 text-center mb-3"
style={{
background:"linear-gradient(135deg,#2e7d32,#66bb6a)",
color:"#fff"
}}
>


<div
onMouseEnter={()=>setIsHoveringAvatar(true)}
onMouseLeave={()=>setIsHoveringAvatar(false)}
onClick={()=>fileInputRef.current.click()}

className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center fw-bold position-relative"

style={{
width:"84px",
height:"84px",
background:avatarUrl
?`url(${avatarUrl}) center/cover`
:"rgba(255,255,255,.2)",
fontSize:"32px",
cursor:"pointer",
overflow:"hidden"
}}

>


{!avatarUrl && avatarLetter}


{
isHoveringAvatar &&
<div
className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
style={{
background:"rgba(0,0,0,.5)"
}}
>
📷
</div>
}


</div>



<input
type="file"
accept="image/*"
ref={fileInputRef}
onChange={handleAvatarChange}
style={{display:"none"}}
/>


<strong>{displayName}</strong>


</div>



<div className="rounded-4 p-3 bg-white">


<h6>Thông tin tài khoản</h6>


<Link to="/profile"
style={getActiveStyle("/profile")}>
👤 Hồ sơ cá nhân
</Link>


<Link to="/profile/dia-chi"
style={getActiveStyle("/profile/dia-chi")}>
📍 Sổ địa chỉ
</Link>



<Link to="/profile/doi-mat-khau"
style={getActiveStyle("/profile/doi-mat-khau")}>
🔒 Đổi mật khẩu
</Link>


<Link to="/profile/don-hang"
style={getActiveStyle("/profile/don-hang")}>
📄 Đơn hàng của tôi
</Link>


<Link to="/profile/danh-gia"
style={getActiveStyle("/profile/danh-gia")}>
★ Đánh giá của tôi
</Link>



</div>


</div>



<div className="col-md-9">


<div
className="rounded-4 mb-3 p-4"
style={{
background:"#2e7d32",
color:"#fff"
}}
>

<h4>
Xin chào {displayName}
</h4>

</div>



<div className="row g-3">


<div className="col-md-6">

<div className="bg-white rounded-4 p-4">

<h6>🎁 Ưu đãi</h6>


<h3>
{(totalSpent*0.1).toLocaleString()}
</h3>


</div>

</div>



<div className="col-md-6">

<div className="bg-white rounded-4 p-4">

<h6>🏆 Thành tích</h6>

<p>
{totalOrders} đơn hàng
</p>

<p>
{totalSpent.toLocaleString()} đ
</p>


</div>


</div>


</div>



<div className="mt-3">

<Outlet context={{
orders,
fetchOrders
}} />


</div>



</div>


</div>


);


}


export default Profile;