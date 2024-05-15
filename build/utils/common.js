"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatString = exports.ErrorMessages = void 0;
//errors
class ErrorMessages {
}
exports.ErrorMessages = ErrorMessages;
ErrorMessages.INCORRECT_USERNAME_OR_PASSWORD = "Invalid email or password";
ErrorMessages.UNAUTHENTICATED_USER = "Unauthorized user";
const formatString = (text) => {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        if (i === 0) {
            result += text[i].toUpperCase();
        }
        else if (text[i] === text[i].toUpperCase()) {
            result += ` ${text[i]}`;
        }
        else {
            result += text[i];
        }
    }
    return result;
};
exports.formatString = formatString;
