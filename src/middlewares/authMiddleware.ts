import express from 'express'
import jwt from 'jsonwebtoken';
import {sendResponse} from "../utils/http";
import {ErrorMessages} from "../utils/constants";

const whiteList = [
    "/auth/login",
    "/auth/register",
    "/auth/"
]

const authorize = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const cookies = req.cookies??{};
    const token = cookies.jwt;
    const requestedURL = req.originalUrl
    if(token){
        if (requestedURL.includes('auth')){
            res.cookie('jwt', token, {httpOnly: true, maxAge: 1});
        }
        jwt.verify(token, process.env.JWT_SECRET, (err:any, decoded:any) => {
            if(err && !whiteList.includes(requestedURL)){
                sendResponse({}, res, ErrorMessages.UNAUTHENTICATED_USER,401);
            }
            next();
        })
        return;
    }
    if (!requestedURL.includes('auth')){
        sendResponse({}, res, ErrorMessages.UNAUTHENTICATED_USER, 401);
    }
    else{
        next();
    }

}

export default authorize;