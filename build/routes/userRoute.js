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
const logger_1 = require("../utils/logger");
const http_1 = require("../utils/http");
const User_1 = __importDefault(require("../models/User"));
const Product_1 = __importDefault(require("../models/Product"));
const mongoose_1 = __importDefault(require("mongoose"));
const router = express_1.default.Router();
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let error = undefined;
    let data = {};
    try {
        const users = yield User_1.default.find().populate('uLocation');
        if (users) {
            data = users;
        }
    }
    catch (err) {
        (0, logger_1.logger)(err);
        error = err;
    }
    (0, http_1.sendResponse)(data, res, error);
}));
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = new User_1.default({
        email: req.body.email,
        password: req.body.password,
        username: req.body.username,
        uLocation: req.body.location,
        isSuperAdmin: false
    });
    let error = undefined;
    let data = {};
    try {
        const savedUser = yield user.save();
        if (savedUser) {
            data = savedUser;
        }
    }
    catch (err) {
        (0, logger_1.logger)(err);
        error = err;
    }
    (0, http_1.sendResponse)(data, res, error);
}));
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const changes = req.body;
    let error = undefined;
    let data = {};
    try {
        const updatedUser = yield Product_1.default.findByIdAndUpdate(id, changes, { new: true });
        if (updatedUser) {
            data = updatedUser;
        }
    }
    catch (err) {
        (0, logger_1.logger)(err);
        error = err;
    }
    (0, http_1.sendResponse)(data, res, error);
}));
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = new mongoose_1.default.Types.ObjectId(req.params.id);
    let error = undefined;
    let data = {};
    try {
        const deletedUser = yield User_1.default.findByIdAndDelete(id, { returnDocument: 'after' });
        if (deletedUser) {
            data = deletedUser;
        }
    }
    catch (err) {
        (0, logger_1.logger)(err);
        error = err;
    }
    (0, http_1.sendResponse)(data, res, error);
}));
exports.default = router;
