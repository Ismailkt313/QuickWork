    import mongoose from 'mongoose'
    import { env } from './env'

    export const connectDB = async () => {
        try {
            await mongoose.connect(env.mongoURI)
            console.log('dbs connected')
        } catch (error) {
            
        }
    }