import { Sequelize } from "sequelize";
import { config } from "dotenv";

config();

export function createSequelize(databaseName?: string) {
    return new Sequelize({
        database: databaseName || process.env.DB_NAME || "",
        username: process.env.DB_USERNAME || "",
        password: process.env.DB_PASSWORD || "",
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT as string) || 3306,
        dialect: 'mysql',
        pool:{
            max: 20,
            min: 2,
            acquire: 30000,
            idle: 60000
        },
        logging: false
    });
}

export const sequelize = createSequelize();