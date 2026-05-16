import { ServiceProviderRepository } from "./repositories/serviceProvider.repository";
import { ServiceProviderService } from "./services/serviceProvider.service";
import { ServiceProviderController } from "./controllers/serviceProvider.controller";
import { createServiceProviderRouter } from "./routes/serviceProvider.routes";
import { AuthRepository } from "../auth/repositories/auth.repository";
import { SkillRepository } from "../skill/repositories/skill.repository";

const serviceProviderRepository = new ServiceProviderRepository();
const authRepository = new AuthRepository();
const skillRepository = new SkillRepository();
const serviceProviderService = new ServiceProviderService(serviceProviderRepository, authRepository, skillRepository);
const serviceProviderController = new ServiceProviderController(serviceProviderService);

const serviceProviderRouter = createServiceProviderRouter(serviceProviderController);

export {
    serviceProviderRouter,
    serviceProviderService
};

