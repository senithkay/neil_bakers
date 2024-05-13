"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_1 = require("../utils/http");
const constants_1 = require("../utils/constants");
const whiteList = [
    "/auth/login",
    "/auth/register",
    "/auth/"
];
const authorize = (req, res, next) => {
    var _a;
    const cookies = (_a = req.cookies) !== null && _a !== void 0 ? _a : {};
    const token = cookies.jwt;
    const requestedURL = req.originalUrl;
    if (token) {
        if (requestedURL.includes('auth')) {
            res.cookie('jwt', token, { httpOnly: true, maxAge: 1 });
        }
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err && !whiteList.includes(requestedURL)) {
                (0, http_1.sendResponse)({}, res, constants_1.ErrorMessages.UNAUTHENTICATED_USER, 401);
                return;
            }
            else {
                next();
            }
        });
        return;
    }
    if (!requestedURL.includes('auth')) {
        (0, http_1.sendResponse)({}, res, constants_1.ErrorMessages.UNAUTHENTICATED_USER, 401);
    }
    else {
        next();
    }
};
exports.default = authorize;
