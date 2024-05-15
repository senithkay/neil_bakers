import express from "express";
import {formatString} from "./Common";

export const sendResponse = (payload: any, res: express.Response, error? : any, statusCode?:number) => {
    let description = '';
    let time = Date.now();
    let status = RESPONSE_CODE.ERROR;
    if (error === undefined) {
        description = 'success';
        status = RESPONSE_CODE.SUCCESS
    }
    else{
        if (error.errors !== undefined && error.errors !== null) {
            const key = Object.keys(error.errors)[0]
            const cause = error.errors[key]
            res.status(500)
            description = cause.properties.message;
            if (cause.properties.message === undefined) {
                description = error.errors
            }
            else{
                description = cause.properties.message;
            }
        }
        else if (error.code !== undefined && error.code !== null && error.code === 11000){
            const key = Object.keys(error.keyValue)[0]
            const cause = error.keyValue[key]
            description = `This ${formatString(key)} : ${cause} is already in use`
        }

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

