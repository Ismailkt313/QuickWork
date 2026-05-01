
import { WalletRepository } from './repositories/wallet.repository';
import { PlatformTransactionRepository } from './repositories/platformTransaction.repository';
import { WorkHistoryRepository } from './repositories/workHistory.repository';
import { JobRepository } from '../job/repositories/job.repository';
import { ServiceProviderRepository } from '../serviceProvider/repositories/serviceProvider.repository';


import { WalletService } from './services/wallet.service';
import { RazorpayService } from './services/razorpay.service';
import { WorkHistoryService } from './services/workHistory.service';
import { PaymentService } from './services/payment.service';
import { AdminFinanceService } from './services/adminFinance.service';


import { WalletController } from './controllers/wallet.controller';
import { PaymentController } from './controllers/payment.controller';
import { AdminFinanceController } from './controllers/adminFinance.controller';


import { createWalletRouter } from './routes/wallet.routes';
import { createPaymentRouter } from './routes/payment.routes';
import { createAdminFinanceRouter } from './routes/adminFinance.routes';


const walletRepository = new WalletRepository();
const platformTransactionRepository = new PlatformTransactionRepository();
const workHistoryRepository = new WorkHistoryRepository();
const jobRepository = new JobRepository();
const serviceProviderRepository = new ServiceProviderRepository();


const walletService = new WalletService(walletRepository);
const razorpayService = new RazorpayService();
const workHistoryService = new WorkHistoryService(workHistoryRepository, jobRepository);
const paymentService = new PaymentService(
    walletService,
    razorpayService,
    workHistoryRepository,
    platformTransactionRepository
);
const adminFinanceService = new AdminFinanceService(platformTransactionRepository, walletRepository);


const walletController = new WalletController(walletService, serviceProviderRepository);
const paymentController = new PaymentController(paymentService, serviceProviderRepository, workHistoryRepository);
const adminFinanceController = new AdminFinanceController(adminFinanceService);


const walletRouter = createWalletRouter(walletController);
const paymentRouter = createPaymentRouter(paymentController);
const adminFinanceRouter = createAdminFinanceRouter(adminFinanceController);


export {
    walletRouter,
    paymentRouter,
    adminFinanceRouter,
    workHistoryService,
    paymentService,
    walletService
};
