declare namespace NodeJS {
  export interface ProcessEnv {
    SECRET: string;
    DISCORD_TOKEN: string;
    GUILD_ID: string;
    NEW_MEMBERS_PARENT: string;
    ADMINISTRATION_PARENT: string;
    PRIVATE_PARENT: string;
    VERIFIED_ROLE_ID: string;
    MEMBER_ROLE_ID: string;

    DB_HOST: string;
    DB_PASS: string;
    DB_PORT: number;
    DB_USER: string;
    DB_TYPE: 'mysql' | 'mariadb' | 'postgres';
    DB_NAME: string;

    SMTP_SERVICE: string;
    SMTP_HOST: string;
    SMTP_PORT: number;
    SMTP_SECURE: boolean;
    SMTP_USER: string;
    SMTP_PASS: string;

    TEST_EMAIL: string;
    TEST_CODE: string;
  }
}
