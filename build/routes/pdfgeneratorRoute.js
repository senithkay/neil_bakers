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
const puppeteer_1 = __importDefault(require("puppeteer"));
const logger_1 = require("../utils/logger");
const reportEngine_1 = require("../utils/reportEngine");
const http_1 = require("../utils/http");
const Branch_1 = __importDefault(require("../models/Branch"));
const router = express_1.default.Router();
router.get('/daily/:id/:date', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = {};
    let error = undefined;
    let date = req.params.date;
    if (req.params.date === undefined || req.params.date === null) { }
    let responseStatus = 200;
    try {
        const branch = yield Branch_1.default.findById(req.params.id).populate({ path: 'stocks', populate: { path: 'productId', select: 'productName' } });
        if (branch) {
            const reportData = [];
            const stocks = branch.stocks;
            stocks.forEach((stock) => {
                const reportRow = new StockReportRow();
                if (stock.date === date) {
                    reportRow.productName = stock.productId.productName;
                    reportRow.pricePerUnit = stock.pricePerUnit;
                    reportRow.soldStock = stock.availableStock - stock.remainingStock;
                    reportRow.openingStock = stock.availableStock;
                    reportRow.balanceStock = stock.remainingStock;
                    reportRow.totalSales = reportRow.soldStock * reportRow.pricePerUnit;
                    reportData.push(reportRow);
                }
            });
            const browser = yield puppeteer_1.default.launch();
            const page = yield browser.newPage();
            const content = yield (0, reportEngine_1.compileReport)('stocks.hbs', {
                info: {
                    title: 'Stocks Report',
                    description: 'Stock report for the month',
                },
                stocks: reportData,
            });
            yield page.setContent(content);
            yield page.emulateMediaType('screen');
            const pdfBuffer = yield page.pdf({
                format: 'A4',
                printBackground: true,
            });
            yield browser.close();
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-disposition': 'attachment; filename=test.pdf',
                'Content-Length': pdfBuffer.length,
            });
            res.end(pdfBuffer);
        }
        else {
            error = 'Invalid branch ID';
            responseStatus = 400;
        }
    }
    catch (err) {
        (0, logger_1.logger)(err);
        error = err;
    }
}));
router.get('/weekly/:id/:fromDate/:toDate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = {};
    let error = undefined;
    let fromDate = req.params.fromDate;
    let toDate = req.params.toDate;
    if (req.params.date === undefined || req.params.date === null) { }
    let responseStatus = 200;
    try {
        const branch = yield Branch_1.default.findById(req.params.id).populate({ path: 'stocks', populate: { path: 'productId', select: 'productName' } });
        if (branch) {
            const reportData = [];
            const stocks = branch.stocks;
            stocks.forEach((stock) => {
                const reportRow = new StockReportRow();
                if (stock.date >= fromDate && stock.date <= toDate) {
                    //TODo change the business logic
                    reportRow.productName = stock.productId.productName;
                    reportRow.pricePerUnit = stock.pricePerUnit;
                    reportRow.soldStock = stock.availableStock - stock.remainingStock;
                    reportRow.openingStock = stock.availableStock;
                    reportRow.balanceStock = stock.remainingStock;
                    reportRow.totalSales = reportRow.soldStock * reportRow.pricePerUnit;
                    reportData.push(reportRow);
                }
            });
            const browser = yield puppeteer_1.default.launch();
            const page = yield browser.newPage();
            const content = yield (0, reportEngine_1.compileReport)('stocks.hbs', {
                info: {
                    title: 'Stocks Report',
                    description: 'Stock report for the month',
                },
                stocks: reportData,
            });
            yield page.setContent(content);
            yield page.emulateMediaType('screen');
            const pdfBuffer = yield page.pdf({
                format: 'A4',
                printBackground: true,
            });
            yield browser.close();
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-disposition': 'attachment; filename=test.pdf',
                'Content-Length': pdfBuffer.length,
            });
            res.end(pdfBuffer);
        }
        else {
            error = 'Invalid branch ID';
            responseStatus = 400;
        }
    }
    catch (err) {
        (0, logger_1.logger)(err);
        error = err;
        responseStatus = 500;
    }
}));
router.get('/monthly/:id/:date', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = {};
    let error = undefined;
    let date = req.params.date;
    let fromDate = date + '-01';
    const monthNumber = parseInt(date.split('-')[1]);
    let responseStatus = 200;
    if (monthNumber < 1 || monthNumber > 12) {
        (0, http_1.sendResponse)(data, res, 'Invalid date', 400);
    }
    const dateObject = new Date(new Date().getFullYear(), monthNumber, 0);
    const numberOfDays = dateObject.getDate();
    let toDate = date + `-${numberOfDays}`;
    if (req.params.date === undefined || req.params.date === null) { }
    try {
        const branch = yield Branch_1.default.findById(req.params.id).populate({ path: 'stocks', populate: { path: 'productId', select: 'productName' } });
        if (branch) {
            const reportData = [];
            const stocks = branch.stocks;
            stocks.forEach((stock) => {
                const reportRow = new StockReportRow();
                if (stock.date >= fromDate && stock.date <= toDate) {
                    reportRow.productName = stock.productId.productName;
                    reportRow.pricePerUnit = stock.pricePerUnit;
                    reportRow.soldStock = stock.availableStock - stock.remainingStock;
                    reportRow.openingStock = stock.availableStock;
                    reportRow.balanceStock = stock.remainingStock;
                    reportRow.totalSales = reportRow.soldStock * reportRow.pricePerUnit;
                    reportData.push(reportRow);
                }
            });
            const browser = yield puppeteer_1.default.launch();
            const page = yield browser.newPage();
            const content = yield (0, reportEngine_1.compileReport)('stocks.hbs', {
                info: {
                    title: 'Stocks Report',
                    description: 'Stock report for the month',
                },
                stocks: reportData,
            });
            yield page.setContent(content);
            yield page.emulateMediaType('screen');
            const pdfBuffer = yield page.pdf({
                format: 'A4',
                printBackground: true,
            });
            yield browser.close();
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-disposition': 'attachment; filename=test.pdf',
                'Content-Length': pdfBuffer.length,
            });
            res.end(pdfBuffer);
        }
        else {
            error = 'Invalid branch ID';
            responseStatus = 400;
        }
    }
    catch (err) {
        (0, logger_1.logger)(err);
    }
}));
class StockReportRow {
    constructor() {
        this.productName = '';
        this.openingStock = 0;
        this.soldStock = 0;
        this.balanceStock = 0;
        this.pricePerUnit = 0;
        this.totalSales = 0;
    }
}
exports.default = router;
