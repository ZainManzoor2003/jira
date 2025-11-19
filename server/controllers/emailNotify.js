const nodemailer = require("nodemailer");

// Create transporter
const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "zainmanzoor2003@gmail.com",
        pass: "dkxn wkli ucds ovjl",
    },
});

// Function to generate 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to send OTP email
async function sendEmailOtp(toEmail) {
    const otp = generateOTP();

    const mailOptions = {
        from: "zainmanzoor2003@gmail.com",
        to: toEmail,
        subject: "Your Verification Code",
        html: `
      <div style="font-family: Arial; padding: 20px;">
        <h2>Your Verification Code</h2>
        <p>Your 6-digit OTP is:</p>
        <h1 style="color:#4CAF50;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `,
    };

    try {
        await transport.sendMail(mailOptions);
        console.log("OTP email sent!");
        return otp; // return OTP so you can store/verify it
    } catch (err) {
        console.error("Error sending OTP:", err);
        throw err;
    }
}

module.exports = {
    sendEmailOtp,
};
