import { Request, Response, NextFunction } from 'express';
import { IInvoiceController, IInvoiceService } from '../interfaces/finance.interface';
import { HttpStatusCode } from '../../../constants/httpStatusCode';
import { IServiceProviderService } from '../../serviceProvider/interfaces/serviceProvider.interface';
import { serviceProviderService } from '../../serviceProvider';
import { AppError } from '../../../utils/AppError';
import { ErrorMessages } from '../../../constants/messages/errorMessages';
import { mapInvoiceToResponseDTO } from '../dtos/financeResponse.dto';
export class InvoiceController implements IInvoiceController {
    private _invoiceService: IInvoiceService;
    private _providerService: IServiceProviderService;

    constructor(invoiceService: IInvoiceService, providerService: IServiceProviderService) {
        this._invoiceService = invoiceService;
        this._providerService = providerService;
    }

    private get providerService(): IServiceProviderService {
        return this._providerService || serviceProviderService;
    }

    public getMyInvoices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new AppError(ErrorMessages.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED);

            const { page = 1, limit = 10, role } = req.query;

            let result;
            const provider = await this.providerService.getProviderByUserId(userId);

            if (role === 'provider' && provider) {

                result = await this._invoiceService.getProviderInvoices(provider._id.toString(), Number(page), Number(limit));
            } else if (role === 'client') {

                result = await this._invoiceService.getClientInvoices(userId, Number(page), Number(limit));
            } else {

                result = await this._invoiceService.getClientInvoices(userId, Number(page), Number(limit));
            }

            res.status(HttpStatusCode.OK).json({
                success: true,
                data: result.invoices.map(mapInvoiceToResponseDTO),
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

    public getInvoiceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            console.log("id", id)
            const invoice = await this._invoiceService.getInvoiceById(id as string);
            if (!invoice) {
                res.status(HttpStatusCode.NOT_FOUND).json({ success: false, message: ErrorMessages.INVOICE_NOT_FOUND });
                return;
            }

            const userId = req.user?.userId;
            const provider = await this.providerService.getProviderByUserId(userId!);

            const isClient = invoice.client.userId.toString() === userId;
            const isProvider = provider && invoice.provider.providerId.toString() === provider._id.toString();

            if (!isClient && !isProvider) {
                res.status(HttpStatusCode.FORBIDDEN).json({ success: false, message: ErrorMessages.ACCESS_DENIED });
                return;
            }

            res.status(HttpStatusCode.OK).json({ success: true, data: mapInvoiceToResponseDTO(invoice) });
        } catch (error) {
            next(error);
        }
    };

    public downloadInvoicePdf = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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


