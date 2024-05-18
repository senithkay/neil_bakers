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
const auth_1 = require("../utils/auth");
const bcrypt_1 = __importDefault(require("bcrypt"));
const common_1 = require("../utils/common");
const node_crypto_1 = __importDefault(require("node:crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express.Router();
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let responseCode = 401;
    try {
        let error = undefined;
        const user = yield User_1.default.findOne({ email: req.body.email });
        if (!user) {
            (0, http_1.sendResponse)({}, res, common_1.ErrorMessages.INCORRECT_USERNAME_OR_PASSWORD, 401);
            return;
        }
        else {
            const isAuth = yield bcrypt_1.default.compare(req.body.password, user.password);
            let data = {};
            if (!isAuth) {
                error = common_1.ErrorMessages.INCORRECT_USERNAME_OR_PASSWORD;
                responseCode = 401;
            }
            else {
                data = { _id: user._id, username: user.username, uLocation: user.uLocation, isSuperAdmin: user.isSuperAdmin, email: user.email };
                const token = (0, auth_1.createToken)(user._id, user.uLocation, user.isSuperAdmin);
                res.cookie('jwt', token, { httpOnly: false, maxAge: process.env.JWT_MAX_AGE, domain: process.env.CLIENT_DOMAIN, sameSite: false });
                responseCode = 200;
            }
            (0, http_1.sendResponse)(data, res, error, responseCode);
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
        const token = (0, auth_1.createToken)(savedUser._id, savedUser.uLocation, savedUser.isSuperAdmin);
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
    const token = (0, auth_1.createFakeToken)();
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
        (0, http_1.sendResponse)({}, res, 'Link expired', 400);
    }
    else {
        res.redirect(`${process.env.PROTOCOL}://${process.env.CLIENT_DOMAIN}:${process.env.CLIENT_PORT}/reset-password/${id}`);
    }
});
router.post('/pwd-reset', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = {};
    let error = undefined;
    let responseStatus = 200;
    try {
        const encrypted = req.body.key;
        const algorithm = 'aes-256-cbc';
        const key = Buffer.from(process.env.MAIL_ENCRYPTION_KEY, 'hex');
        const iv = Buffer.from(process.env.MAIL_ENCRYPTION_IV, 'hex');
        const decipher = node_crypto_1.default.createDecipheriv(algorithm, Buffer.from(key), iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
        decrypted += decipher.final('utf-8');
        const decryptedData = JSON.parse(decrypted);
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(req.body.password, salt);
        const updatedUser = yield User_1.default.findOneAndUpdate({ email: decryptedData.email }, { password: hashedPassword }, { new: true });
        if (updatedUser) {
            data = { _id: updatedUser._id };
        }
    }
    catch (err) {
        (0, logger_1.logger)(err);
        error = err;
        responseStatus = 500;
    }
    (0, http_1.sendResponse)(data, res, error, responseStatus);
}));
router.post('/change-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let data = {};
    let error = undefined;
    let responseStatus = 200;
    try {
        const cookies = (_a = req.cookies) !== null && _a !== void 0 ? _a : {};
        const token = cookies.jwt;
        if (token) {
            jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, decoded) => __awaiter(void 0, void 0, void 0, function* () {
                let foundUser = yield User_1.default.findById(decoded.id);
                if (foundUser === undefined || foundUser === null) {
                    error = "User not found";
                    responseStatus = 401;
                    (0, http_1.sendResponse)(data, res, error, responseStatus);
                }
                else {
                    const isAuth = yield bcrypt_1.default.compare(req.body.oldPassword, foundUser.password);
                    if (isAuth) {
                        const salt = yield bcrypt_1.default.genSalt(10);
                        const hashedPassword = yield bcrypt_1.default.hash(req.body.newPassword, salt);
                        const user = yield User_1.default.findOneAndUpdate({ _id: decoded.id }, { password: hashedPassword });
                        if (user === undefined || user === null) {
                            error = "Could not change the password";
                            responseStatus = 500;
                            (0, http_1.sendResponse)(data, res, error, responseStatus);
                        }
                        else {
                            data = { _id: user._id, username: user.username, uLocation: user.uLocation, isSuperAdmin: user.isSuperAdmin, email: user.email };
                            (0, http_1.sendResponse)(data, res, undefined, responseStatus);
                        }
                    }
                    else {
                        error = "Current password is incorrect";
                        responseStatus = 500;
                        (0, http_1.sendResponse)(data, res, error, responseStatus);
                    }
                }
            }));
        }
        else {
            error = "Unauthorized user";
            (0, logger_1.logger)(error);
            responseStatus = 401;
            (0, http_1.sendResponse)(data, res, error, responseStatus);
        }
    }
    catch (err) {
        (0, logger_1.logger)(err);
        error = err;
        responseStatus = 500;
        (0, http_1.sendResponse)(data, res, error, responseStatus);
    }
}));
router.get('/sendmail/:email', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.params.email;
    const user = yield User_1.default.findOne({ email });
    if (!user) {
        (0, http_1.sendResponse)({}, res, 'Incorrect email', 400);
        return;
    }
    const date = new Date();
    const plaintext = {
        id: user._id,
        time: new Date(),
        email: email
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
            user: process.env.APPLICATION_EMAIL_USER,
            pass: process.env.APPLICATION_EMAIL_PASSKEY,
        },
    });
    transporter.sendMail({
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
    }).then((info) => {
        res.redirect(`${process.env.PROTOCOL}://${process.env.CLIENT_DOMAIN}:${process.env.CLIENT_PORT}/`);
    });
}));
exports.default = router;
