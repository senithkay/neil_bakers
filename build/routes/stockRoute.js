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
        const branch = yield Branch_1.default.findById(req.params.id).populate({ path: 'stocks', populate: { path: 'productId', select: 'productName' } });
        if (branch && branch.stocks) {
            data = branch.stocks;
        }
    }
    catch (err) {
        (0, logger_1.logger)(err);
        error = err;
    }
    (0, http_1.sendResponse)(data, res, error);
}));
router.get("/:id/:date", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let error = undefined;
    let data = [];
    try {
        const branch = yield Branch_1.default.findById(req.params.id).populate('stocks');
        if (branch) {
            if (req.params.date === null || req.params.date === undefined || req.params.date === ' ') {
                console.log(true);
            }
            if (req.params.date && req.params.date !== '') {
                data = branch.stocks.filter((stock) => {
                    stock.populate('productId');
                    return stock.date === req.params.date;
                });
            }
        }
    }
    catch (err) {
        (0, logger_1.logger)(err);
        error = err;
    }
    (0, http_1.sendResponse)(data, res, error);
}));
router.get("/:id/:fromDate/:toDate", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let error = undefined;
    let data = [];
    try {
        const branch = yield Branch_1.default.findById(req.params.id).populate('stocks');
        if (branch) {
            if (req.params.date && req.params.date !== '') {
                data = branch.stocks.filter((stock) => {
                    stock.populate('productId');
                    return ((stock.date >= req.params.fromDate && stock.date <= req.params.toDate) || stock.date === req.params.fromDate);
                });
            }
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
    let stocks = [];
    try {
        const branch = yield Branch_1.default.findById(req.body.branchId).populate('stocks');
        if (!branch) {
            throw new Error('Branch not found');
        }
        if (branch.stocks !== undefined) {
            stocks = branch.stocks;
        }
        const existingStock = stocks.find((stock) => (stock.productId == req.body.stock.productId && stock.date == req.body.stock.date));
        const newStock = new Stock_1.default(req.body.stock);
        let insertedStock = {};
        if (existingStock) {
            const changes = {
                date: newStock.date,
                availableStock: newStock.availableStock,
                remainingStock: newStock.remainingStock,
                pricePerUnit: newStock.pricePerUnit
            };
            const updatedData = yield Stock_1.default.findByIdAndUpdate(existingStock._id, changes, { new: true });
            if (updatedData) {
                insertedStock = updatedData;
                res.status(200);
            }
        }
        else {
            insertedStock = yield newStock.save();
            res.status(201);
        }
        if (!insertedStock) {
            throw new Error('Stock creation failed');
        }
        branch.stocks.push(newStock._id);
        yield branch.save();
        yield session.commitTransaction();
        yield session.endSession();
        const insertedSchemaObject = new Stock_1.default(insertedStock);
        data = yield insertedSchemaObject.populate({ path: 'productId', select: 'productName' });
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
