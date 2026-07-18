import { LandingService } from './services/landing.services';
import { LandingController } from './controllers/landing.controller';
import { createLandingRouter } from './routes/landing.routes';

// Import singletons from other modules
import { locationRepository } from '../location';
import { skillRepository } from '../skill';

const landingService = new LandingService(locationRepository, skillRepository);
const landingController = new LandingController(landingService);
const landingRouter = createLandingRouter(landingController);

export { landingRouter };