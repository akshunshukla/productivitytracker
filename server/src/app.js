import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({extended: true , limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

import userRouter from "./routes/user.route.js"
import sessionRouter from "./routes/sessions.route.js"
import analyticsRouter from "./routes/analytics.route.js"
import { verifyJWT } from "./middlewares/auth.middleware.js"

app.use("/api/v1/user",userRouter)
app.use("/api/v1/session",verifyJWT,sessionRouter)
app.use("/api/v1/analytics",verifyJWT,analyticsRouter)


export {app}