import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import connectDb from "./db/index.js";
import { app } from "./app.js";

console.log("1. Application starting...");

connectDb()
    .then(() => {
        console.log("2. Database connected!");

        app.listen(process.env.PORT || 8000, () => {
            console.log(
                `3. Server is running on port ${process.env.PORT || 8000}`
            );
        });
    })
    .catch((error) => {
        console.error("Database connection failed:", error);
    });