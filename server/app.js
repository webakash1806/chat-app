import express from 'express'
import cors from 'cors'
import { config } from 'dotenv'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import errorMiddleware from './middleware/error.middleware.js'
import UserRoutes from './routes/auth.route.js'

config()

const app = express()

app.use(express.urlencoded({ extended: true }))

app.use(express.json())

app.use(cookieParser())

app.use(cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true
}))

app.use(morgan('dev'))

app.use('/ping', function (req, res) {
    res.json({
        success: true,
        message: "pong"
    })
})

app.use('/api/v1/user', UserRoutes)

app.all('*', (req, res) => {
    res.status(404).send("OOPS! page not found")
})

app.use(errorMiddleware)

export default app