import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import jwt from "jsonwebtoken"


const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler( async(req,res) =>{
    const {fullname, username, email, password}= req.body
    if(!fullname || !username || !email || !password) throw new ApiError(400,"All fields are required")

    const existedUser = await User.findOne({
        $or: [{ username },{ email }]
    })

    if(existedUser) throw new ApiError(409, "User already exists")

    const user = await User.create({
        fullname,
        username : username.toLowerCase(),
        email,
        password
    })

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if(!createdUser) throw new ApiError(500,"Something went wrong while registering the user")
    
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200,createdUser, "User created successfully"))
})

const loginUser = asyncHandler(async (req,res)=>{
    const {username,email,password} = req.body

    if(!username && !email) throw new ApiError(409,"Username or email is required")
    if(!password) throw new ApiError(409,"Password is required")
    const user = await User.findOne({
        $or:[{email},{username}]
    })

    if(!user) throw new ApiError(404,"user does not exists")
    
    
    const checkPassword = await user.isPasswordCorrect(password)
    if(!checkPassword) throw new ApiError(401,"Invalid user credentials")

    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)

    const safeUser = {
        _id: user._id,
        fullname: user.fullname,
        username: user.username,
        email: user.email
    }

    const options={
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,{user:safeUser},"User logged in successfully"))
})

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options={
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,"User LoggedOut successfully"))
})

const refreshAccessToken =asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken) throw new ApiError(401,"unauthorised request");

    const decodedtoken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    const user = await User.findById(decodedtoken?._id)
    if(!user) throw new ApiError(401,"invalid refresh token")

    if(incomingRefreshToken !== user?.refreshToken) throw new ApiError(401, "refresh token is expired or used")

    const{accessToken,refreshToken : newrefreshToken} = await generateAccessAndRefreshToken(user._id);

    const options = {
        httpOnly:true,
        secure:true
    }

    return res 
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newrefreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                accessToken, refresh : newrefreshToken
            },
            "accessToken refreshed"
        )
    )
})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200,req.user,"current user fetched successfully"))
})

const updateUserDetails = asyncHandler(async(req,res) => {
    const{fullname,email} = req.body
    if(!fullname || !email) throw new ApiError(400,"fullname or email is required")
    
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname,
                email
            }
        },
        {new :true}
    ).select("-password -refreshToken")

    return res.status(200)
    .json(new ApiResponse(200,user,"User details updated successfully"))
})

export {registerUser,loginUser,logoutUser,refreshAccessToken,getCurrentUser,updateUserDetails}