import dotenv from "dotenv";
dotenv.config();

const getEnv = (key: string): string => {
    let value = process.env[key]
    if (!value) {
        console.error(key)
        throw new Error(`missing env ${key}`)
    }
    return value
}
export const env = {
    mongoURI: getEnv('MONGO_URI'),
    jwtSecret: getEnv('JWT_SECRET'),
    jwtrefreshscret: getEnv('JWT_REFRESH_SECRET'),
    nodemailerEmail: getEnv('NODEMAILER_EMAIL'),
    nodemailerPassword: getEnv('NODEMAILER_PASSWORD')
}