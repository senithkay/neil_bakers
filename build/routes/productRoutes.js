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
const Product_1 = __importDefault(require("../models/Product"));
const logger_1 = require("../utils/logger");
const http_1 = require("../utils/http");
const router = express_1.default.Router();
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product = new Product_1.default(req.body);
    let error = undefined;
    let data = {};
    try {
        const savedProduct = yield product.save();
        if (savedProduct) {
            data = savedProduct;
        }
    }
    catch (err) {
        (0, logger_1.logger)(err);
        error = err;
    }
    (0, http_1.sendResponse)(data, res, error);
}));
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = [];
    let error = undefined;
    try {
        const products = yield Product_1.default.find();
        if (products) {
            data = products;
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
        const updatedProduct = yield Product_1.default.findByIdAndUpdate(id, changes, { new: true });
        if (updatedProduct) {
            data = updatedProduct;
        }
    }
    catch (err) {
        (0, logger_1.logger)(err);
        error = err;
    }
    (0, http_1.sendResponse)(data, res, error);
}));
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    let error = undefined;
    let data = {};
    try {
        const deletedProduct = yield Product_1.default.findByIdAndDelete(id, { returnDocument: 'after' });
        if (deletedProduct) {
            data = deletedProduct;
        }
    }
    catch (err) {
        (0, logger_1.logger)(err);
        error = err;
    }
    (0, http_1.sendResponse)(data, res, error);
}));
router.get('/price/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = {};
    let error = undefined;
    try {
        const product = yield Product_1.default.findById(req.params.id);
        if (product) {
            data = { productId: product._id, price: product.price };
        }
    }
    catch (err) {
        (0, logger_1.logger)(err);
        error = err;
    }
    (0, http_1.sendResponse)(data, res, error);
}));
exports.default = router;
