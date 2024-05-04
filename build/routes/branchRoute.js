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
const express_1 = __importDefault(require("express"));
const Branch_1 = __importDefault(require("../models/Branch"));
const http_1 = require("../utils/http");
const logger_1 = require("../utils/logger");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let data = [];
    let error = undefined;
    try {
        const cookies = (_a = req.cookies) !== null && _a !== void 0 ? _a : {};
        const token = cookies.jwt;
        console.log(token);
        if (token) {
            jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, decoded) => __awaiter(void 0, void 0, void 0, function* () {
                if (decoded.isSuperAdmin) {
                    console.log('a');
                    data = yield Branch_1.default.find();
                }
                else {
                    data.push(yield Branch_1.default.findOne({ _id: decoded.uLocation }));
                }
                (0, http_1.sendResponse)(data, res, undefined);
            }));
        }
        else {
            (0, http_1.sendResponse)(data, res, undefined);
        }
    }
    catch (err) {
        (0, logger_1.logger)(err);
        error = err;
        (0, http_1.sendResponse)(data, res, error);
    }
}));
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let error = undefined;
    let data = {};
    const branch = new Branch_1.default(req.body);
    try {
        const savedBranch = yield branch.save();
        if (savedBranch) {
            data = savedBranch;
        }
    }
    catch (err) {
        (0, logger_1.logger)(err);
        error = err;
    }
    (0, http_1.sendResponse)(data, res, error);
}));
exports.default = router;
