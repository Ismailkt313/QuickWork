import { Request, Response, NextFunction } from 'express';
import { IInvoiceController, IInvoiceService } from '../interfaces/finance.interface';
import { HttpStatusCode } from '../../../constants/httpStatusCode';
import { IServiceProviderRepository } from '../../serviceProvider/interfaces/serviceProvider.interface';

export class InvoiceController implements IInvoiceController {
    private _invoiceService: IInvoiceService;
    private _providerRepo: IServiceProviderRepository;

    constructor(invoiceService: IInvoiceService, providerRepo: IServiceProviderRepository) {
        this._invoiceService = invoiceService;
        this._providerRepo = providerRepo;
    }

    getMyInvoices = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new Error('Unauthorized');

            const { page = 1, limit = 10, role } = req.query;

            let result;
            const provider = await this._providerRepo.findByUserId(userId);

            if (role === 'provider' && provider) {

                result = await this._invoiceService.getProviderInvoices(provider._id.toString(), Number(page), Number(limit));
            } else if (role === 'client') {

                result = await this._invoiceService.getClientInvoices(userId, Number(page), Number(limit));
            } else {

                result = await this._invoiceService.getClientInvoices(userId, Number(page), Number(limit));
            }

            res.status(HttpStatusCode.OK).json({
                success: true,
                data: result.invoices,
                pagination: {
                    total: result.total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(result.total / Number(limit))
                }
            });
        } catch (error) {
            next(error);
        }
    };

    getInvoiceById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const invoice = await this._invoiceService.getInvoiceById(id as string);
            if (!invoice) {
                res.status(HttpStatusCode.NOT_FOUND).json({ success: false, message: 'Invoice not found' });
                return;
            }

            const userId = req.user?.userId;
            const provider = await this._providerRepo.findByUserId(userId!);

            const isClient = invoice.client.userId.toString() === userId;
            const isProvider = provider && invoice.provider.providerId.toString() === provider._id.toString();

            if (!isClient && !isProvider) {
                res.status(HttpStatusCode.FORBIDDEN).json({ success: false, message: 'Access denied' });
                return;
            }

            res.status(HttpStatusCode.OK).json({ success: true, data: invoice });
        } catch (error) {
            next(error);
        }
    };

    downloadInvoicePdf = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const pdfBuffer = await this._invoiceService.generateInvoicePdf(id as string);

            const invoice = await this._invoiceService.getInvoiceById(id as string);
            const filename = invoice ? `invoice-${invoice.invoiceNumber}.pdf` : `invoice-${id}.pdf`;

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
            res.status(HttpStatusCode.OK).send(pdfBuffer);
        } catch (error) {
            next(error);
        }
    };
}
