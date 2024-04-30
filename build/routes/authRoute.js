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
            res.cookie('jwt', token, { httpOnly: true, maxAge: process.env.JWT_MAX_AGE });
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
            httpOnly: true,
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
exports.default = router;
