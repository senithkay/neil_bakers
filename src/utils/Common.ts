//errors
export class ErrorMessages {
    static INCORRECT_USERNAME_OR_PASSWORD = "Invalid email or password"
    static UNAUTHENTICATED_USER = "Unauthorized user"
}

export const formatString = (text: string) => {
    let result = ''
    for (let i = 0; i < text.length; i++) {
        if (i === 0) {
            result += text[i].toUpperCase()
        } else if (text[i] === text[i].toUpperCase()) {
            result += ` ${text[i]}`
        } else {
            result += text[i]
        }
    }
    return result
}