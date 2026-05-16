
import { WalletRepository } from './repositories/wallet.repository';
import { PlatformTransactionRepository } from './repositories/platformTransaction.repository';
import { WorkHistoryRepository } from './repositories/workHistory.repository';
import { InvoiceRepository } from './repositories/invoice.repository';
import { JobRepository } from '../job/repositories/job.repository';
import { ServiceProviderRepository } from '../serviceProvider/repositories/serviceProvider.repository';
import { AuthRepository } from '../auth/repositories/auth.repository';
import { AssignmentRepository } from '../assignment/repositories/assignment.repository';
import { serviceProviderService } from '../serviceProvider';

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

const walletRepository = new WalletRepository();
const platformTransactionRepository = new PlatformTransactionRepository();
const workHistoryRepository = new WorkHistoryRepository();
const invoiceRepository = new InvoiceRepository();
const jobRepository = new JobRepository();
const serviceProviderRepository = new ServiceProviderRepository();
const authRepository = new AuthRepository();
const assignmentRepository = new AssignmentRepository();

const walletService = new WalletService(walletRepository);
const razorpayService = new RazorpayService();
const invoiceService = new InvoiceService(
    invoiceRepository,
    workHistoryRepository,
    jobRepository,
    serviceProviderRepository,
    authRepository
);
const workHistoryService = new WorkHistoryService(workHistoryRepository, jobRepository);
const paymentService = new PaymentService(
    walletService,
    razorpayService,
    workHistoryRepository,
    platformTransactionRepository,
    invoiceService,
    assignmentRepository
);
const adminFinanceService = new AdminFinanceService(platformTransactionRepository, walletRepository);

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
    workHistoryService,
    paymentService,
    walletService
};

