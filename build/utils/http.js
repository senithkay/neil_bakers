"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const sendResponse = (payload, res, error) => {
    let description = '';
    let time = Date.now();
    if (error === undefined) {
        description = 'success';
    }
    else {
        description = error;
    }
    let data = {
        description: description,
        data: payload,
        time: time,
    };
    res.send(data);
};
exports.sendResponse = sendResponse;
