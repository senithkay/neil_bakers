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
const Stock_1 = __importDefault(require("../models/Stock"));
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../utils/logger");
const http_1 = require("../utils/http");
const router = express_1.default.Router();
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let error = undefined;
    let data = [];
    try {
        const branch = yield Branch_1.default.findById(req.params.id).populate('stocks');
        if (branch) {
            data = branch.stocks;
        }
    }
    catch (err) {
        (0, logger_1.logger)(err);
        error = err;
    }
    (0, http_1.sendResponse)(data, res, error);
}));
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let error = undefined;
    let data = {};
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const branch = yield Branch_1.default.findById(req.body.branchId);
        if (!branch) {
            throw new Error('Branch not found');
        }
        const newStock = new Stock_1.default(req.body.stock);
        const insertedStock = yield newStock.save();
        if (!insertedStock) {
            throw new Error('Stock creation failed');
        }
        branch.stocks.push(newStock._id);
        yield branch.save();
        yield session.commitTransaction();
        yield session.endSession();
        data = branch;
    }
    catch (err) {
        (0, logger_1.logger)(err);
        yield session.abortTransaction();
        yield session.endSession();
        error = err;
    }
    (0, http_1.sendResponse)(data, res, error);
}));
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let error = undefined;
    let data = {};
    try {
        const receivedData = req.body;
        const updatedStock = yield Stock_1.default.findByIdAndUpdate(req.params.id, receivedData, { new: true });
        if (updatedStock) {
            data = updatedStock;
        }
    }
    catch (err) {
        (0, logger_1.logger)(err);
        error = err;
    }
    (0, http_1.sendResponse)(data, res, error);
}));
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let error = undefined;
    let data = {};
    try {
        const deletedStock = yield Stock_1.default.findByIdAndDelete(req.params.id, { returnDocument: 'after' });
        if (deletedStock) {
            data = deletedStock;
        }
    }
    catch (err) {
        (0, logger_1.logger)(err);
        error = err;
    }
    (0, http_1.sendResponse)(data, res, error);
}));
exports.default = router;
