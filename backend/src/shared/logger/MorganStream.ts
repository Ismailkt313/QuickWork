import { StreamOptions } from "morgan";
import { ILogger } from "../interfaces/ILogger";

export class MorganStream implements StreamOptions {
    constructor(private logger: ILogger) {}

    public write(message: string): void {
        const cleanMessage = message.trim();
        if (cleanMessage) {
            try {
                const data = JSON.parse(cleanMessage);
                this.logger.info("HTTP Request Completed", data);
            } catch {
                this.logger.info(cleanMessage);
            }
        }
    }
}
