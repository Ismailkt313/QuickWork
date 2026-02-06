import app from './app'
import dotenv from 'dotenv'
dotenv.config()
import { connectDB } from '@config/db'
let server = async() => {
    await connectDB()
    app.listen(3000, () => {
    console.log('created')
})
}
server() 