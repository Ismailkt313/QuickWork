import { ServiceProviderRepository } from "./repositories/serviceProvider.repository";
import { ServiceProviderService } from "./services/serviceProvider.service";
import { ServiceProviderController } from "./controllers/serviceProvider.controller";
import { createServiceProviderRouter } from "./routes/serviceProvider.routes";

const serviceProviderRepository = new ServiceProviderRepository();
const serviceProviderService = new ServiceProviderService(serviceProviderRepository);
const serviceProviderController = new ServiceProviderController(serviceProviderService);

const serviceProviderRouter = createServiceProviderRouter(serviceProviderController);

export {
    serviceProviderRouter
};
