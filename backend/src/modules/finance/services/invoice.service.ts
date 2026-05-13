import {
    IInvoice,
    IInvoiceRepository,
    IInvoiceService,
    IWorkHistoryRepository
} from '../interfaces/finance.interface';
import { IJobRepository } from '../../job/interfaces/job.interface';
import { IServiceProviderRepository } from '../../serviceProvider/interfaces/serviceProvider.interface';
import { UserModel } from '../../auth/models/user.model';
import PDFDocument from 'pdfkit';

export class InvoiceService implements IInvoiceService {
    private _invoiceRepo: IInvoiceRepository;
    private _workHistoryRepo: IWorkHistoryRepository;
    private _jobRepo: IJobRepository;
    private _providerRepo: IServiceProviderRepository;

    constructor(
        invoiceRepo: IInvoiceRepository,
        workHistoryRepo: IWorkHistoryRepository,
        jobRepo: IJobRepository,
        providerRepo: IServiceProviderRepository
    ) {
        this._invoiceRepo = invoiceRepo;
        this._workHistoryRepo = workHistoryRepo;
        this._jobRepo = jobRepo;
        this._providerRepo = providerRepo;
    }

    async generateInvoice(workHistoryId: string): Promise<IInvoice> {
        const history = await this._workHistoryRepo.findById(workHistoryId);
        if (!history) throw new Error('Work history not found');
        if (history.payment.status !== 'completed') throw new Error('Invoice can only be generated for completed payments');


        const job = await this._jobRepo.findById(history.jobId.toString());
        if (!job) throw new Error('Job not found');

        const client = await UserModel.findById(history.clientId);
        if (!client) throw new Error('Client not found');

        const provider = await this._providerRepo.findById(history.providerId.toString());
        if (!provider) throw new Error('Provider not found');

        const providerUser = await UserModel.findById(provider.userId);
        if (!providerUser) throw new Error('Provider user not found');

        const invoiceNumber = await this._invoiceRepo.getNextInvoiceNumber();

        const invoiceData: Partial<IInvoice> = {
            invoiceNumber,
            workHistoryId: history._id,
            jobId: history.jobId,
            assignmentId: history.assignmentId,
            client: {
                userId: client._id,
                name: client.name,
                email: client.email || ''
            },
            provider: {
                providerId: provider._id,
                name: providerUser.name,
                email: providerUser.email || ''
            },
            items: [{
                description: `Service: ${job.title}`,
                quantity: 1,
                rate: history.payment.totalAmount,
                amount: history.payment.totalAmount
            }],
            subtotal: history.payment.totalAmount,
            platformFee: history.payment.platformFee,
            platformFeePercent: 10,
            total: history.payment.totalAmount,
            providerPayout: history.payment.providerAmount,
            paymentMethod: history.payment.method,
            paymentStatus: 'paid',
            paidAt: history.payment.confirmedAt || new Date(),
            issuedAt: new Date(),
            dueDate: new Date(),
            status: 'issued'
        };

        return await this._invoiceRepo.create(invoiceData);
    }

    async getInvoiceById(id: string): Promise<IInvoice | null> {
        return await this._invoiceRepo.findById(id);
    }

    async getClientInvoices(clientId: string, page: number, limit: number): Promise<{ invoices: IInvoice[], total: number }> {
        const skip = (page - 1) * limit;
        const [invoices, total] = await this._invoiceRepo.findByClient(clientId, skip, limit);
        return { invoices, total };
    }

    async getProviderInvoices(providerId: string, page: number, limit: number): Promise<{ invoices: IInvoice[], total: number }> {
        const skip = (page - 1) * limit;
        const [invoices, total] = await this._invoiceRepo.findByProvider(providerId, skip, limit);
        return { invoices, total };
    }

    async generateInvoicePdf(id: string): Promise<Buffer> {
        const invoice = await this._invoiceRepo.findById(id);
        if (!invoice) throw new Error('Invoice not found');

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            doc.fillColor('#444444').fontSize(20).text('QuickWork Marketplace', 50, 57);
            doc.text('QuickWork Solutions Pvt. Ltd.', 200, 65, { align: 'right' });
            doc.text('Hitech City, Hyderabad', 200, 80, { align: 'right' });
            doc.text('Telangana, India, 500081', 200, 95, { align: 'right' });
            doc.moveDown();

            doc.fillColor('#000000').fontSize(20).text('Invoice', 50, 160);
            doc.fontSize(10).text(`Invoice Number: ${invoice.invoiceNumber}`, 50, 200);
            doc.text(`Invoice Date: ${invoice.issuedAt.toLocaleDateString()}`, 50, 215);
            doc.text(`Payment Status: ${invoice.paymentStatus.toUpperCase()}`, 50, 230);

            doc.text('Bill To:', 50, 270, { underline: true });
            doc.text(invoice.client.name, 50, 285);
            doc.text(invoice.client.email, 50, 300);

            doc.text('Provider:', 300, 270, { underline: true });
            doc.text(invoice.provider.name, 300, 285);
            doc.text(invoice.provider.email, 300, 300);

            const tableTop = 350;
            doc.font('Helvetica-Bold').fontSize(10).text('Description', 50, tableTop);
            doc.text('Quantity', 250, tableTop, { align: 'right' });
            doc.text('Rate', 350, tableTop, { align: 'right' });
            doc.text('Amount', 450, tableTop, { align: 'right' });
            doc.font('Helvetica');

            doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

            let y = tableTop + 30;
            invoice.items.forEach(item => {
                doc.text(item.description, 50, y);
                doc.text(item.quantity.toString(), 250, y, { align: 'right' });
                doc.text(`₹${item.rate.toLocaleString()}`, 350, y, { align: 'right' });
                doc.text(`₹${item.amount.toLocaleString()}`, 450, y, { align: 'right' });
                y += 20;
            });

            doc.moveTo(50, y).lineTo(550, y).stroke();

            y += 20;
            doc.text('Subtotal:', 350, y, { align: 'right' });
            doc.text(`₹${invoice.subtotal.toLocaleString()}`, 450, y, { align: 'right' });

            y += 20;
            doc.text(`Platform Fee (${invoice.platformFeePercent}%):`, 350, y, { align: 'right' });
            doc.text(`-₹${invoice.platformFee.toLocaleString()}`, 450, y, { align: 'right' });

            y += 20;
            doc.font('Helvetica-Bold').fontSize(12).text('Total Paid:', 350, y, { align: 'right' });
            doc.text(`₹${invoice.total.toLocaleString()}`, 450, y, { align: 'right' });
            doc.font('Helvetica');

            y += 25;
            doc.fontSize(10).text(`Payment Method: ${invoice.paymentMethod}`, 50, y);
            doc.text(`Paid At: ${invoice.paidAt.toLocaleDateString()}`, 50, y + 15);

            doc.fontSize(10).text('Thank you for using QuickWork!', 50, 700, { align: 'center', width: 500 });

            doc.end();
        });
    }
}
