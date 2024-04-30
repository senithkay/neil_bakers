import express from "express";
import nodemailer from 'nodemailer'

const router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
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
        from: 'tivitytest101@gmail.com', // sender address
        to: "senithkarunarathneu@gmail.com", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>", // html body
    });

    res.send('email sent')
})

export default router