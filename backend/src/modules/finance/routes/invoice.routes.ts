import { Router } from 'express';
import { IInvoiceController } from '../interfaces/finance.interface';
import { authMiddleware } from '../../../middleware/auth.middleware';

export const createInvoiceRouter = (invoiceController: IInvoiceController) => {
    const router = Router();

    router.get('/', authMiddleware, invoiceController.getMyInvoices);
    router.get('/:id', authMiddleware, invoiceController.getInvoiceById);
    router.get('/:id/pdf', authMiddleware, invoiceController.downloadInvoicePdf);

    return router;
};
