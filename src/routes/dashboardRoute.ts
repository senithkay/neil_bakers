import express from "express";
import {sendResponse} from "../utils/http";
import Branch from "../models/Branch";
import {logger} from "../utils/logger";

const router = express.Router();

router.get("/monthly-stock/:id", async(req: express.Request, res: express.Response) => {
    let error = undefined;
    let data:any = [];
    try{
        const branch = await Branch.findById(req.params.id).populate('stocks');
        if (branch){
            let stocks = branch.stocks
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth();
            const numberOfDays = new Date(currentDate.getFullYear(), currentMonth + 1, 0).getDate();
            const dailyStock = [];
            const days = []
            if (stocks === undefined) {
                stocks = []
            }

            for (let day = 1; day <= numberOfDays; day++) {
                const dateString = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                const stocksOfTheDay = stocks.filter((stock:any) => stock.date === dateString);
                const soldQty:any = stocksOfTheDay.reduce((accumulator, currentValue:any) => {
                    return accumulator + (currentValue.availableStock - currentValue.remainingStock);
                }, 0);
                dailyStock.push(soldQty)
                days.push(dateString)
            }
            data = {
                days : days,
                values: dailyStock,
            }
        }
    }
    catch(err){
        logger(err)
        error = err
    }
    sendResponse(data, res, error);
})

router.get('/daily-sales/:id/:date', async (req: express.Request, res: express.Response) => {
    let data = {};
    let error = undefined
    let date = req.params.date
    try{
        const branch = await Branch.findById(req.params.id).populate('stocks');
        if (branch){
            const stocks = branch.stocks
            const stocksOfTheDay = stocks.filter((stock:any) => stock.date === date);
            console.log(stocksOfTheDay)
            const soldQty:any = stocksOfTheDay.reduce((accumulator, currentValue:any) => {
                return accumulator + (currentValue.availableStock - currentValue.remainingStock);
            }, 0);
            const totalQty:any = stocksOfTheDay.reduce((accumulator, currentValue:any) => {
                return accumulator + (currentValue.availableStock);
            }, 0);
            data = {
                sold : soldQty,
                total: totalQty,
            }
        }
    }
    catch (err){
        logger(err);
        error = err
    }
    sendResponse(data,res,error)
})

export default router;