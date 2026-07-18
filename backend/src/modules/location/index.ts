import { LocationRepository } from './repositories/location.repository';
import { LocationService } from './services/location.service';
import { LocationController } from './controllers/location.controller';
import { createLocationRouter } from './routes/location.routes';

export const locationRepository = new LocationRepository();
export const locationService = new LocationService(locationRepository);
const locationController = new LocationController(locationService);

export const locationRouter = createLocationRouter(locationController);
