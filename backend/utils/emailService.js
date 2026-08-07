const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Hàm gửi Email
const sendEmail = async (to, subject, htmlContent) => {
    try {
        const mailOptions = {
            from: `"Nông Sản Shop 🌿" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log("Email gửi thành công ID:", info.messageId);
        return true;

    } catch (error) {
        console.error("Lỗi khi gửi email:", error);
        return false;
    }
};

module.exports = { sendEmail };