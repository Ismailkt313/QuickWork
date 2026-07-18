import { ReportRepository } from './repositories/report.repository';
import { ReportService } from './services/report.service';
import { ReportController } from './controllers/report.controller';
import { createReportRouter } from './routes/report.routes';
import { ModerationService } from './services/moderation.service';
import { ModerationController } from './controllers/moderation.controller';
import { createModerationRouter } from './routes/moderation.routes';
import { ModerationLogRepository } from './repositories/moderationLog.repository';

// Import singletons from other modules
import { assignmentRepository } from '../assignment';
import { authRepository } from '../auth';

import { notificationService } from '../notification';
import { appLogger } from '../../shared/logger';

export const reportRepository = new ReportRepository();
const reportService = new ReportService(reportRepository, assignmentRepository);
const reportController = new ReportController(reportService);

const moderationLogRepository = new ModerationLogRepository();
const moderationService = new ModerationService(reportRepository, moderationLogRepository, authRepository, notificationService, appLogger);
const moderationController = new ModerationController(moderationService);

export const reportRouter = createReportRouter(reportController);
export const moderationRouter = createModerationRouter(moderationController);
