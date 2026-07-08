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

async function connectDB() {
    try {
        console.log("DEBUG PASSWORD:", JSON.stringify(config.password));
        const pool = await sql.connect(config);
        console.log("✅ Connected to SQL Server");
        return pool;
    } catch (err) {
    console.error("❌ Lỗi kết nối SQL:");
    console.error(err.message);
}
}

module.exports = {
    sql,
    connectDB
};