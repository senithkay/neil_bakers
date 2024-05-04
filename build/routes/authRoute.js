"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const User_1 = __importDefault(require("../models/User"));
const http_1 = require("../utils/http");
const logger_1 = require("../utils/logger");
const common_1 = require("../utils/common");
const bcrypt_1 = __importDefault(require("bcrypt"));
const constants_1 = require("../utils/constants");
const node_crypto_1 = __importDefault(require("node:crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const router = express.Router();
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let error = undefined;
        const user = yield User_1.default.findOne({ email: req.body.email });
        if (!user) {
            res.status(401);
            (0, http_1.sendResponse)({}, res, constants_1.ErrorMessages.INCORRECT_USERNAME_OR_PASSWORD);
            return;
        }
        else {
            const isAuth = yield bcrypt_1.default.compare(req.body.password, user.password);
            let data = {};
            if (!isAuth) {
                error = constants_1.ErrorMessages.INCORRECT_USERNAME_OR_PASSWORD;
                res.status(401);
            }
            data = { _id: user._id, username: user.username, uLocation: user.uLocation, isSuperAdmin: user.isSuperAdmin };
            const token = (0, common_1.createToken)(user._id, user.uLocation, user.isSuperAdmin);
            console.log(data);
            res.cookie('jwt', token, { httpOnly: false, maxAge: process.env.JWT_MAX_AGE, domain: 'localhost' });
            res.status(200);
            (0, http_1.sendResponse)(data, res, error);
        }
    }
    catch (err) {
        (0, logger_1.logger)(err);
    }
}));
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = new User_1.default({
        email: req.body.email,
        password: req.body.password,
        username: req.body.username,
    });
    let error = undefined;
    let data = {};
    try {
        const savedUser = yield user.save();
        const token = (0, common_1.createToken)(savedUser._id, savedUser.uLocation, savedUser.isSuperAdmin);
        res.cookie('jwt', token, {
            // httpOnly: true,
            maxAge: process.env.JWT_MAX_AGE,
        });
        data = { _id: savedUser._id, username: savedUser.username };
    }
    catch (err) {
        (0, logger_1.logger)(err);
        error = err;
    }
    (0, http_1.sendResponse)(data, res, error);
}));
router.post("/logout", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send('logout');
}));
router.get('/logout', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = (0, common_1.createFakeToken)();
    res.cookie('jwt', token, { httpOnly: false, maxAge: 0, domain: 'localhost' });
    res.send({});
}));
router.get('/reset-password/:id', (req, res) => {
    const id = req.params.id;
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.MAIL_ENCRYPTION_KEY, 'hex');
    const iv = Buffer.from(process.env.MAIL_ENCRYPTION_IV, 'hex');
    const decipher = node_crypto_1.default.createDecipheriv(algorithm, Buffer.from(key), iv);
    let decrypted = decipher.update(id, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    const decryptedData = JSON.parse(decrypted);
    const date = new Date();
    const initiatedTime = new Date(decryptedData.time);
    const currentTime = new Date();
    const timeDif = currentTime.getTime() - initiatedTime.getTime();
    if (timeDif > 300000) {
        (0, http_1.sendResponse)({}, res, 'Link expired');
    }
    res.redirect('http://localhost:5173/reset-password');
});
router.post('/pwd-reset', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body.password);
    let data = {};
    let error = undefined;
    try {
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(req.body.password, salt);
        data = yield User_1.default.findOneAndUpdate({ email: req.body.email }, { password: hashedPassword }, { new: true });
    }
    catch (err) {
        (0, logger_1.logger)(err);
        error = err;
    }
    (0, http_1.sendResponse)(data, res, error);
}));
router.get('/sendmail/:email', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.params.email;
    const user = yield User_1.default.findOne({ email });
    if (!user) {
        (0, http_1.sendResponse)({}, res, 'Incorrect email');
        return;
    }
    const date = new Date();
    const plaintext = {
        id: user._id,
        time: new Date(),
    };
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.MAIL_ENCRYPTION_KEY, 'hex');
    const iv = Buffer.from(process.env.MAIL_ENCRYPTION_IV, 'hex');
    const cipher = node_crypto_1.default.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(JSON.stringify(plaintext), 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    const resetPasswordUrl = `http://localhost:3000/auth/reset-password/${encrypted}`;
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: "tivitytest101@gmail.com",
            pass: "kdbf rkxp ratz sspu",
        },
    });
    const info = yield transporter.sendMail({
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
}));
exports.default = router;
