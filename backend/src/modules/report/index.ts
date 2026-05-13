import { ReportRepository } from './repositories/report.repository';
import { ReportService } from './services/report.service';
import { ReportController } from './controllers/report.controller';
import { createReportRouter } from './routes/report.routes';
import { ModerationService } from './services/moderation.service';
import { ModerationController } from './controllers/moderation.controller';
import { createModerationRouter } from './routes/moderation.routes';

import { AssignmentRepository } from '../assignment/repositories/assignment.repository';

import { AuthRepository } from '../auth/repositories/auth.repository';
import { ModerationLogRepository } from './repositories/moderationLog.repository';

const reportRepository = new ReportRepository();
const assignmentRepository = new AssignmentRepository();
const reportService = new ReportService(reportRepository, assignmentRepository);
const reportController = new ReportController(reportService);

import { notificationService } from '../notification';

const authRepository = new AuthRepository();
const moderationLogRepository = new ModerationLogRepository();
const moderationService = new ModerationService(reportRepository, moderationLogRepository, authRepository, notificationService);
const moderationController = new ModerationController(moderationService);

export const reportRouter = createReportRouter(reportController);
export const moderationRouter = createModerationRouter(moderationController);

export { reportRepository };
