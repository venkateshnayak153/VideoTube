import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apierror.js"
import { User } from "../models/users.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiresponse.js"
import { error } from "console"
const genrateAccesAndRefreshTokens = async (userId)=>{
    try{
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
        user.refreshToken = refreshToken
        user.save({validateBeforeSave : false})
        return {accessToken , refreshToken}
    }catch(error){
        throw new ApiError(500 , 'Something went wrong while generating tokens')
    }
}
const registerUser = asyncHandler(async (req, res, next) => {
    // Get the user details
    // Validation - not empty
    // Check if already exists
    // Check for images
    // Check for avatar
    // Upload images to Cloudinary
    // Create user object and create entry
    // Remove password and refresh token from response
    // Check for user creation

    const { fullname, email, username, password } = req.body

    if (
        [fullname, email, username, password].some(
            (field) => !field || (typeof field === "string" && field.trim() === "")
        )
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [
            { username: username.toLowerCase() },
            { email: email.toLowerCase() }
        ]
    })

    if (existedUser) {
        throw new ApiError(409, "User or email already exists")
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar Required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar || !avatar.url) {
        throw new ApiError(400, "Avatar upload failed")
    }

    let coverImage = null

    if (coverImageLocalPath) {
        coverImage = await uploadOnCloudinary(coverImageLocalPath)
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, 'User Registered successfully')
    )
})


const loginUser = asyncHandler(async (req , res) =>{
    //1.Get user email and password
    //2.Find email 
    //3.Check pass
    //4.access and refresh token
    //5.Send secure cookies and response
    const{email ,ussername, password} = req.body
    if(!(email || username)){
        throw new ApiError(400 , 'Username or Email is required')
    }
    const user = await User.findOne({
        $or :[{email} , {username}]
    })
    if(!user){
        throw new ApiError(401 , 'User does not exists')
    }
    const ispassValid = await user.isPasswordCorrect(password)

    if(!ispassValid){
        throw new ApiError(401 , 'Incorrect Password')
    }
    const {accessToken, refreshToken} = await genrateAccesAndRefreshTokens(user._id)

    //Cookies
    const loggedIn = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure : true
    }
    return res.status(200)
    .cookie('accessToken' , accessToken , options)
    .cookie('refreshToken' , refreshToken , options)
    .json(new ApiResponse(200 , loggedIn , 'User Logged in successfully'))
})

const logoutUser = asyncHandler(async (req , res) =>{
    await User.findByIdAndUpdate(req.user._id , {refreshToken : undefined} , {new : true})
    const options = {
        httpOnly : true,
        secure : true
    }
    return res.status(200)
    .clearCookie('accessToken' , options)
    .clearCookie('refreshToken' , options)
    .json(new ApiResponse(200 , null , 'User Logged out successfully'))
})
export { registerUser ,loginUser,logoutUser} 