import { LandingRepository } from './repository/landing.repository';
import { LandingService } from './services/landing.services';
import { LandingController } from './controllers/landing.controller';
import { createLandingRouter } from './routes/landing.routes';

const landingRepository = new LandingRepository();
const landingService = new LandingService(landingRepository);
const landingController = new LandingController(landingService);
const landingRouter = createLandingRouter(landingController);

export { landingRouter };