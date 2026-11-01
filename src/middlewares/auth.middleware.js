import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apierror.js";
import { User } from "../models/users.models.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "") ||
            req.headers?.authorization?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized: No token provided");
        }

        const decodedToken = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id || decodedToken?.userId).select(
            "-password -refreshToken"
        );

        if (!user) {
            throw new ApiError(401, "Unauthorized: Invalid access token");
        }

        req.user = user;
        next();
    } catch (err) {
        throw new ApiError(401, err?.message || "Unauthorized: Invalid token");
    }
});