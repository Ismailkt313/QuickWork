import app from './app'
import mongoose from 'mongoose'
import { config } from './config'

const startServer = async (): Promise<void> => {
    try {
        await mongoose.connect(config.MONGO_URI);
        console.log('databse connected')
        app.listen(config.PORT, () => {
            console.log('server connected')
        });
    } catch (error) {
        console.error('server error occurd',error)
        process.exit(1);
    }
};

startServer(); 