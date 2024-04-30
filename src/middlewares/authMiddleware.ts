import express from 'express'
import jwt from 'jsonwebtoken';
import {sendResponse} from "../utils/http";
import {ErrorMessages} from "../utils/constants";

const whiteList = [
    "/auth/login",
    "/auth/register",
]

const authorize = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const cookies = req.cookies??{};
    const token = cookies.jwt;
    const requestedURL = req.originalUrl
    if(token){
        if (whiteList.includes(requestedURL)){
            res.cookie('jwt', token, {httpOnly: true, maxAge: 1});
        }
        jwt.verify(token, process.env.JWT_SECRET, (err:any, decoded:any) => {
            if(err && !whiteList.includes(requestedURL)){
                res.status(401);
                sendResponse({}, res, ErrorMessages.UNAUTHENTICATED_USER);
            }
            next();
        })
        return;
    }
    if (!whiteList.includes(requestedURL)){
        res.status(401);
        sendResponse({}, res, ErrorMessages.UNAUTHENTICATED_USER);
    }
    else{
        next();
    }

}

export default authorize;