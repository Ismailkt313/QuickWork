import { LocationRepository } from './repositories/location.repository';
import { LocationService } from './services/location.service';
import { LocationController } from './controllers/location.controller';
import { createLocationRouter } from './routes/location.routes';

const locationRepository = new LocationRepository();
const locationService = new LocationService(locationRepository);
const locationController = new LocationController(locationService);

const locationRouter = createLocationRouter(locationController);

export {
    locationRouter,
    LocationRepository,
    LocationService,
    LocationController
};
