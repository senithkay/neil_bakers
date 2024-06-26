import express, {response} from 'express'
import {logger} from "../utils/logger";
import Branch from "../models/Branch";
import {sendResponse} from "../utils/http";

const router = express.Router()

router.get('/daily/:id/:date', async(req: express.Request, res: express.Response) => {
    let data = {};
    let error = undefined;
    let date = req.params.date;
    if(req.params.date === undefined || req.params.date === null){}
    let responseStatus = 200
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
                    reportRow.balanceStock = stock.remainingStock;
                    reportRow.totalSales = reportRow.soldStock * reportRow.pricePerUnit;
                    reportData.push(reportRow)
                }

            })
            data=reportData;
        }
        else{
            error = 'Invalid branch ID'
            responseStatus = 400
        }
    }catch(err){
        logger(err);
        error = err;
    }
    sendResponse(data, res, error,  responseStatus)
})

router.get('/weekly/:id/:fromDate/:toDate', async(req: express.Request, res: express.Response) => {
    let data = {};
    let error = undefined;
    let fromDate = req.params.fromDate;
    let toDate = req.params.toDate;
    if(req.params.date === undefined || req.params.date === null){}
    let responseStatus = 200
    try{
        const branch = await Branch.findById(req.params.id).populate({path: 'stocks', populate: { path: 'productId', select: 'productName' }} );
        if (branch){
            const reportData:StockReport[] = []
            const stocks = branch.stocks
            stocks.forEach((stock:any) => {
                const reportRow = new StockReportRow()
                if (stock.date >= fromDate && stock.date <= toDate){
                    //TODo change the business logic
                    reportRow.productName = stock.productId.productName;
                    reportRow.pricePerUnit = stock.pricePerUnit;
                    reportRow.soldStock = stock.availableStock - stock.remainingStock;
                    reportRow.openingStock = stock.availableStock;
                    reportRow.balanceStock = stock.remainingStock;
                    reportRow.totalSales = reportRow.soldStock * reportRow.pricePerUnit;
                    reportRow.date = stock.date
                    reportData.push(reportRow)
                }
            })
            data=reportData;
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
    sendResponse(data, res, error,  responseStatus)
})

router.get('/monthly/:id/:date', async(req: express.Request, res: express.Response) => {
    let data = {};
    let error = undefined;
    let date = req.params.date;
    let fromDate = date + '-01'
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
                    reportData.push(reportRow)
                }
            })
            data=reportData;
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
    sendResponse(data, res, error,  responseStatus)
})

interface StockReport{
    productName:string,
    openingStock:number,
    soldStock:number,
    balanceStock:number,
    pricePerUnit:number,
    totalSales:number
}

class StockReportRow implements StockReport {
    productName: string;
    openingStock: number;
    soldStock: number;
    balanceStock: number;
    pricePerUnit: number;
    totalSales: number;
    date:string;

    constructor(
    ) {
        this.productName = '';
        this.openingStock = 0;
        this.soldStock = 0;
        this.balanceStock = 0;
        this.pricePerUnit = 0;
        this.totalSales = 0;
        this.date = ''
    }
}

export default router