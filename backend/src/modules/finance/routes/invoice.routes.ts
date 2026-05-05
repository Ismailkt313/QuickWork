import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';

export const createInvoiceRouter = (invoiceController: InvoiceController) => {
    const router = Router();

    router.get('/', authMiddleware, invoiceController.getMyInvoices);
    router.get('/:id', authMiddleware, invoiceController.getInvoiceById);
    router.get('/:id/pdf', authMiddleware, invoiceController.downloadInvoicePdf);

    return router;
};
