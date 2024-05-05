"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const sendResponse = (payload, res, error, statusCode) => {
    let description = '';
    let time = Date.now();
    let status = 0 /* RESPONSE_CODE.ERROR */;
    if (error === undefined) {
        description = 'success';
        status = 1 /* RESPONSE_CODE.SUCCESS */;
    }
    else {
        res.status(500);
        description = error;
    }
    let data = {
        status: status,
        description: description,
        data: payload,
        time: time,
    };
    if (statusCode !== undefined) {
        res.status(statusCode);
    }
    res.send(data);
};
exports.sendResponse = sendResponse;
