const sql = require("mssql");
require("dotenv").config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: Number(process.env.DB_PORT),
    options: {
        trustServerCertificate: true,
        encrypt: false,
        enableArithAbort: true
    }
};

let poolPromise = null;

function connectDB() {
    if (!poolPromise) {
        poolPromise = sql.connect(config)
            .then((pool) => {
                console.log("✅ Connected to SQL Server");
                return pool;
            })
            .catch((err) => {
                console.error("❌ Lỗi kết nối SQL:", err.message);
                poolPromise = null; // reset để lần sau thử connect lại
                throw err; // ném lỗi ra ngoài thay vì trả undefined
            });
    }
    return poolPromise;
}

module.exports = {
    sql,
    connectDB
};