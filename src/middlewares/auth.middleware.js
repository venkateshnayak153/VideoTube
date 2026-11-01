import asyncHandler from "express-async-handler";
import JWT from "jsonwebtoken";
export const verifyJWT = asyncHandler(async (req, res, next) => {
    try{
        const token = req.cookies?.accessToken || req.headers?.authorization?.replace("Bearer ", "");
    if (!token) {
        throw new ApiError(401, "Unauthorized: No token provided");
    }
    const decoded = JWT.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.userId).select("-password -refreshToken")
    if (!user) {
        throw new ApiError(401, "Unauthorized: User not found");
    }
    req.user = user;
    next();
    }catch(err){
        throw new ApiError(401, "Unauthorized: Invalid token");
    }
});