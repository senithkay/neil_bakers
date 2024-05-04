import express from "express";

export const sendResponse = (payload: any, res: express.Response, error? : any) => {
    let description = '';
    let time = Date.now();
    let status = 0
    if (error === undefined) {
        description = 'success';
        status = 1
        //ToDO: add enum for this

    }
    else{
        description = error
    }
    let data = {
        status: status,
        description: description,
        data: payload,
        time: time,
    }
    res.send(data);
}