import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (locaFilePath) => {
    try {
        if (!locaFilePath) return null;
        const response = await cloudinary.uploader.upload(locaFilePath, {
            resource_type: "auto"
        });
        console.log("File is Uploaded on Cloudinary", response.url);
        if (fs.existsSync(locaFilePath)) {
            fs.unlinkSync(locaFilePath);
        }
        return response;
    } catch (err) {
        if (fs.existsSync(locaFilePath)) {
            fs.unlinkSync(locaFilePath); // remove the locally saved path
        }
        return null;
    }
};

export { uploadOnCloudinary };