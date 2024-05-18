import express from "express";
import puppeteer from "puppeteer";
import {logger} from "../utils/logger";
import {compileReport} from "../utils/reportEngine";
import {sendResponse} from "../utils/http";
import Branch from "../models/Branch";

const router = express.Router();


router.get('/daily/:id/:date', async(req: express.Request, res: express.Response) => {
    let data = {};
    let error = undefined;
    let date = req.params.date;
    if(req.params.date === undefined || req.params.date === null){}
    let responseStatus = 200
    let sumOfTotalSales = 0;
    let sumOfCostOfRemaining = 0
    try{
        const branch = await Branch.findById(req.params.id).populate({path: 'stocks', populate: { path: 'productId', select: 'productName' }} );
        if (branch){
            const reportData:StockReport[] = []
            const stocks = branch.stocks
            stocks.forEach((stock:any) => {
                const reportRow = new StockReportRow()
                if (stock.date === date){
                    reportRow.productName = stock.productId.productName;
                    reportRow.pricePerUnit = stock.pricePerUnit;
                    reportRow.soldStock = stock.availableStock - stock.remainingStock;
                    reportRow.openingStock = stock.availableStock;
                    reportRow.date = stock.date
                    reportRow.balanceStock = stock.remainingStock;
                    reportRow.totalSales = reportRow.soldStock * reportRow.pricePerUnit;
                    reportRow.costOfRemainingStock = reportRow.balanceStock*reportRow.pricePerUnit
                    sumOfTotalSales += reportRow.totalSales
                    sumOfCostOfRemaining += reportRow.costOfRemainingStock
                    reportData.push(reportRow)
                }
            })
            const parsedData = reportData.map((item:StockReport) => {
                return {...item,
                    totalSales: item.totalSales.toFixed(2),
                    pricePerUnit: item.pricePerUnit.toFixed(2),
                    costOfRemainingStock: item.costOfRemainingStock.toFixed(2)
                }
            })
            const browser = await puppeteer.launch({headless:true})
            const page = await browser.newPage();

            const content = await compileReport('stocks.hbs', {
                info : {
                    title: 'Daily Stocks Report',
                    description: `Date : ${date}`,
                    sumOfSales: sumOfTotalSales.toFixed(2),
                    sumOfRemaining : sumOfCostOfRemaining.toFixed(2)
                },
                stocks:parsedData,
            })

            await page.setContent(content)
            await page.emulateMediaType('screen');
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
            });
            await browser.close();
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-disposition': 'attachment; filename=test.pdf',
                'Content-Length': pdfBuffer.length,
            });
            res.end(pdfBuffer);
        }
        else{
            error = 'Invalid branch ID'
            responseStatus = 400
        }
    }catch(err){
        logger(err);
        error = err;
    }
})

router.get('/weekly/:id/:fromDate/:toDate', async(req: express.Request, res: express.Response) => {
    let data = {};
    let error = undefined;
    let fromDate = req.params.fromDate;
    let toDate = req.params.toDate;
    if(req.params.date === undefined || req.params.date === null){}
    let sumOfTotalSales = 0;
    let sumOfCostOfRemaining = 0
    let responseStatus = 200
    try{
        const branch = await Branch.findById(req.params.id).populate({path: 'stocks', populate: { path: 'productId', select: 'productName' }} );
        if (branch){
            const reportData:StockReport[] = []
            const stocks = branch.stocks
            stocks.forEach((stock:any) => {
                const reportRow = new StockReportRow()
                if (stock.date >= fromDate && stock.date <= toDate){
                    reportRow.productName = stock.productId.productName;
                    reportRow.pricePerUnit = stock.pricePerUnit;
                    reportRow.soldStock = stock.availableStock - stock.remainingStock;
                    reportRow.openingStock = stock.availableStock;
                    reportRow.balanceStock = stock.remainingStock;
                    reportRow.totalSales = reportRow.soldStock * reportRow.pricePerUnit;
                    reportRow.date = stock.date
                    reportRow.costOfRemainingStock = reportRow.balanceStock*reportRow.pricePerUnit
                    sumOfTotalSales += reportRow.totalSales
                    sumOfCostOfRemaining += reportRow.costOfRemainingStock
                    reportData.push(reportRow)
                }

            })
            const parsedData = reportData.map((item:StockReport) => {
                return {...item,
                    totalSales: item.totalSales.toFixed(2),
                    pricePerUnit: item.pricePerUnit.toFixed(2),
                    costOfRemainingStock: item.costOfRemainingStock.toFixed(2)
                }
            })
            const browser = await puppeteer.launch()
            const page = await browser.newPage();

            const content = await compileReport('stocks.hbs', {
                info : {
                    title: 'Weekly Stocks Report',
                    description: `Period: ${fromDate} - ${toDate}`,
                    sumOfSales: sumOfTotalSales.toFixed(2),
                    sumOfRemaining : sumOfCostOfRemaining.toFixed(2)
                },
                stocks:parsedData,
            })

            await page.setContent(content)
            await page.emulateMediaType('screen');
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
            });

            await browser.close();
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-disposition': 'attachment; filename=test.pdf',
                'Content-Length': pdfBuffer.length,
            });
            res.end(pdfBuffer);
        }
        else{
            error = 'Invalid branch ID'
            responseStatus = 400
        }
    }catch(err){
        logger(err);
        error = err;
        responseStatus = 500
    }
})

router.get('/monthly/:id/:date', async(req: express.Request, res: express.Response) => {
    let data = {};
    let error = undefined;
    let date = req.params.date;
    let fromDate = date + '-01'
    let sumOfTotalSales = 0;
    let sumOfCostOfRemaining = 0
    const monthNumber = parseInt(date.split('-')[1])
    let responseStatus = 200
    if ( monthNumber< 1 || monthNumber > 12) {
        sendResponse(data, res, 'Invalid date',  400)
    }
    const dateObject = new Date(new Date().getFullYear(), monthNumber, 0);
    const numberOfDays = dateObject.getDate()
    let toDate = date + `-${numberOfDays}`
    if(req.params.date === undefined || req.params.date === null){}
    try{
        const branch = await Branch.findById(req.params.id).populate({path: 'stocks', populate: { path: 'productId', select: 'productName' }} );
        if (branch){
            const reportData:StockReport[] = []
            const stocks = branch.stocks
            stocks.forEach((stock:any) => {
                const reportRow = new StockReportRow()
                if (stock.date >= fromDate && stock.date <= toDate){
                    reportRow.productName = stock.productId.productName;
                    reportRow.pricePerUnit = stock.pricePerUnit;
                    reportRow.soldStock = stock.availableStock - stock.remainingStock;
                    reportRow.openingStock = stock.availableStock;
                    reportRow.balanceStock = stock.remainingStock;
                    reportRow.totalSales = reportRow.soldStock * reportRow.pricePerUnit;
                    reportRow.date = stock.date
                    reportRow.costOfRemainingStock = reportRow.balanceStock*reportRow.pricePerUnit
                    sumOfTotalSales += reportRow.totalSales
                    sumOfCostOfRemaining += reportRow.costOfRemainingStock
                    reportData.push(reportRow)
                }

            })

            const parsedData = reportData.map((item:StockReport) => {
                return {...item,
                    totalSales: item.totalSales.toFixed(2),
                    pricePerUnit: item.pricePerUnit.toFixed(2),
                    costOfRemainingStock: item.costOfRemainingStock.toFixed(2)
                }
            })
            const browser = await puppeteer.launch()
            const page = await browser.newPage();

            const content = await compileReport('stocks.hbs', {
                info : {
                    title: 'Monthly Stocks Report',
                    description: `Month: ${date}`,
                    sumOfSales: sumOfTotalSales.toFixed(2),
                    sumOfRemaining : sumOfCostOfRemaining.toFixed(2)

                },
                stocks:parsedData,
            })

            await page.setContent(content)
            await page.emulateMediaType('screen');
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
            });

            await browser.close();
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-disposition': 'attachment; filename=test.pdf',
                'Content-Length': pdfBuffer.length,
            });
            res.end(pdfBuffer);
        }
        else{
            error = 'Invalid branch ID'
            responseStatus = 400
        }
    }catch(err){
        logger(err);
    }
})
interface StockReport{
    productName:string,
    openingStock:number,
    soldStock:number,
    balanceStock:number,
    pricePerUnit:number,
    totalSales:number,
    costOfRemainingStock:number,
}

class StockReportRow implements StockReport {
    productName: string;
    openingStock: number;
    soldStock: number;
    balanceStock: number;
    pricePerUnit: number;
    totalSales: number;
    date:string;
    costOfRemainingStock: number ;

    constructor(
    ) {
        this.productName = '';
        this.openingStock = 0;
        this.soldStock = 0;
        this.balanceStock = 0;
        this.pricePerUnit = 0;
        this.totalSales = 0;
        this.date = '';
        this.costOfRemainingStock = 0
    }
}


export default router;