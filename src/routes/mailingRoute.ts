import express from "express";
import nodemailer from 'nodemailer'
import * as crypto from "node:crypto";
import User from "../models/User";
import {sendResponse} from "../utils/http";

const router = express.Router();

router.get('/:email', async (req: express.Request, res: express.Response) => {
    const email = req.params.email;
    const user  = await User.findOne({ email });
    if (!user){
        sendResponse({}, res, 'Incorrect email');
        return
    }

    const date = new Date();
    const plaintext = {
        id: user._id,
        time: new Date(),
    };
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.MAIL_ENCRYPTION_KEY, 'hex');
    const iv = Buffer.from(process.env.MAIL_ENCRYPTION_IV, 'hex');


    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(JSON.stringify(plaintext), 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    const resetPasswordUrl =`http://localhost:3000/auth/reset-password/${encrypted}`
    const transporter = nodemailer.createTransport({
        service: "gmail",
        host:'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: "tivitytest101@gmail.com",
            pass: "kdbf rkxp ratz sspu",
        },
    });

    const info = await transporter.sendMail({
        from: 'tivitytest101@gmail.com',
        to: email,
        subject: "Password Reset Request",
        text: '',
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Request</title>
</head>
<body>
    <p>Dear Admin,</p>


    <p>We have received a request to reset your password for <strong>Your Neil's Bakery Admin Account</strong>.</p>

    <p>To proceed with the password reset, please click on the following link:</p>

    <p><a href="${resetPasswordUrl}">Reset Password</a></p>

    <p>If you did not request this password reset or believe this request to be in error, please disregard this email.</p>

    <p>Please note that the link above will expire in 10 minutes, so be sure to complete the password reset process promptly.</p>

    <p>Thank you.</p>

    <p>Best regards,<br>
    Super Admin<br>
</body>
</html>`,
    });

    res.redirect('http://localhost:5173/');
})

export default router