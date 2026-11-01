import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDb = async () => {
    try {
        const mongoUri = (process.env.MONGO_URI || "").replace(/\/+$/, "");
        const DBInstance = await mongoose.connect(
            `${mongoUri}/${DB_NAME}`
        );

        console.log(
            `Connected to database ${DBInstance.connection.host} successfully`
        );
    } catch (error) {
        console.log("Error in connecting to database:", error);
        process.exit(1);
    }
};

export default connectDb;