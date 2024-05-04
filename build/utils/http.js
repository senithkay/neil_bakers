"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const sendResponse = (payload, res, error) => {
    let description = '';
    let time = Date.now();
    let status = 0;
    if (error === undefined) {
        description = 'success';
        status = 1;
        //ToDO: add enum for this
    }
    else {
        description = error;
    }
    let data = {
        status: status,
        description: description,
        data: payload,
        time: time,
    };
    res.send(data);
};
exports.sendResponse = sendResponse;
