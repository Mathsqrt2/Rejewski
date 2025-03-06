declare namespace NodeJS {
    export interface ProcessEnv {
        DISCORD_TOKEN: string;
        SECRET: string;

        DB_HOST: string;
        DB_PASS: string;
        DB_PORT: number;
        DB_USER: string;

        SMTP_SERVICE: string;
        SMTP_HOST: string;
        SMTP_PORT: number;
        SMTP_SECURE: boolean;
        SMTP_USER: string;
        SMTP_PASS: string;
    }
}
