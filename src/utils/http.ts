import express from "express";

export const sendResponse = (payload: any, res: express.Response, error? : any) => {
    let description = '';
    let time = Date.now();
    if (error === undefined) {
        description = 'success';
    }
    else{
        description = error
    }
    let data = {
        description: description,
        data: payload,
        time: time,
    }
    res.send(data);
}