declare namespace NodeJS {
    interface ProcessEnv {
        JWT_SECRET: string;
        JWT_MAX_AGE:number
        PORT: number;
        MAIL_ENCRYPTION_KEY:string;
        MAIL_ENCRYPTION_IV:string;
        DATABASE_CONNECTION:string
        CLIENT_DOMAIN:string;
        CLIENT_PORT:number
        PROTOCOL:string
    }
}