import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    service: "gmail", // or use SMTP
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendOtpMail = async (to: string, otp: number) => {
    await transporter.sendMail({
        from: `"TODO Task Manager " <${process.env.EMAIL_USER}>`,
        to,
        subject: "Email Verification OTP",
        text: `Your OTP code is: ${otp}. It will expire in 5 minutes.`,
        html: `<p>Your OTP code is: <b>${otp}</b></p><p>It will expire in 5 minutes.</p>`,
    });
};
