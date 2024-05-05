import Redis from "ioredis"
import "dotenv/config"
import { logger } from "./logger"


const redisClient = new Redis({
    port: Number(process.env.REDIS_PORT),
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD
})

redisClient.on("error", (err) => {
    logger.log({ level: "error", message: `${err}` })
})

redisClient.on("connect", () => {
    logger.log({ level: "info", message: "Connected to Redis server successfully" })
})


export { redisClient }
