"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = exports.setUser = void 0;
let store = {
    user: {}
};
const setUser = (value) => {
    store.user = value;
};
exports.setUser = setUser;
const getUser = () => {
    return store.user;
};
exports.getUser = getUser;
