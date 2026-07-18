import { WalletRepository } from './repositories/wallet.repository';
import { PlatformTransactionRepository } from './repositories/platformTransaction.repository';
import { WorkHistoryRepository } from './repositories/workHistory.repository';
import { InvoiceRepository } from './repositories/invoice.repository';

// Import singletons from other modules
import { jobRepository } from '../job';
import { authRepository } from '../auth';
import { assignmentRepository } from '../assignment';

import { WalletService } from './services/wallet.service';
import { RazorpayService } from './services/razorpay.service';
import { WorkHistoryService } from './services/workHistory.service';
import { PaymentService } from './services/payment.service';
import { InvoiceService } from './services/invoice.service';
import { AdminFinanceService } from './services/adminFinance.service';

import { WalletController } from './controllers/wallet.controller';
import { PaymentController } from './controllers/payment.controller';
import { InvoiceController } from './controllers/invoice.controller';
import { AdminFinanceController } from './controllers/adminFinance.controller';

import { createWalletRouter } from './routes/wallet.routes';
import { createPaymentRouter } from './routes/payment.routes';
import { createInvoiceRouter } from './routes/invoice.routes';
import { createAdminFinanceRouter } from './routes/adminFinance.routes';

import { appLogger } from '../../shared/logger';

// Export Repository singletons
export const walletRepository = new WalletRepository();
export const platformTransactionRepository = new PlatformTransactionRepository();
export const workHistoryRepository = new WorkHistoryRepository();
export const invoiceRepository = new InvoiceRepository();

export const walletService = new WalletService(walletRepository, appLogger);
const razorpayService = new RazorpayService();

// Import serviceProviderRepository at the bottom of the instantiation section to avoid circular imports
import { serviceProviderRepository, serviceProviderService } from '../serviceProvider';

export const invoiceService = new InvoiceService(
    invoiceRepository,
    workHistoryRepository,
    jobRepository,
    serviceProviderRepository,
    authRepository
);
export const workHistoryService = new WorkHistoryService(workHistoryRepository, jobRepository);
export const paymentService = new PaymentService(
    walletService,
    razorpayService,
    workHistoryRepository,
    platformTransactionRepository,
    invoiceService,
    assignmentRepository,
    appLogger
);
export const adminFinanceService = new AdminFinanceService(platformTransactionRepository, walletRepository);

const walletController = new WalletController(walletService, serviceProviderService);
const paymentController = new PaymentController(paymentService, serviceProviderService, workHistoryService);
const invoiceController = new InvoiceController(invoiceService, serviceProviderService);
const adminFinanceController = new AdminFinanceController(adminFinanceService);

const walletRouter = createWalletRouter(walletController);
const paymentRouter = createPaymentRouter(paymentController);
const invoiceRouter = createInvoiceRouter(invoiceController);
const adminFinanceRouter = createAdminFinanceRouter(adminFinanceController);

export {
    walletRouter,
    paymentRouter,
    invoiceRouter,
    adminFinanceRouter,
};
