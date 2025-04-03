import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRouter from "./routes.js"

const app = express()

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended:true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

app.use(userRouter)

export {app}