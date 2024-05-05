import express from "express";

export const sendResponse = (payload: any, res: express.Response, error? : any, statusCode?:number) => {
    let description = '';
    let time = Date.now();
    let status = RESPONSE_CODE.ERROR;
    if (error === undefined) {
        description = 'success';
        status = RESPONSE_CODE.SUCCESS
    }
    else{
        res.status(500)
        description = error;
    }
    let data = {
        status: status,
        description: description,
        data: payload,
        time: time,
    }
    if (statusCode !== undefined){
        res.status(statusCode);
    }
    res.send(data);
}