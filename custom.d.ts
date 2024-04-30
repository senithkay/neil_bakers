declare namespace NodeJS {
    interface ProcessEnv {
        JWT_SECRET: string;
        JWT_MAX_AGE:number
        PORT: number;
        // Add other environment variables here if needed
    }
}