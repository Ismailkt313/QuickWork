import {
    IInvoice,
    IInvoiceRepository,
    IInvoiceService,
    IWorkHistoryRepository
} from '../interfaces/finance.interface';
import { IJobRepository } from '../../job/interfaces/job.interface';
import { IServiceProviderRepository } from '../../serviceProvider/interfaces/serviceProvider.interface';
import { IAuthRepository } from '../../auth/interfaces/auth.interface';
import PDFDocument from 'pdfkit';
import https from 'https';
import fs from 'fs';
import path from 'path';

async function ensureFontExists(fontPath: string, url: string): Promise<void> {
    if (fs.existsSync(fontPath)) return;
    const dir = path.dirname(fontPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(fontPath);
        https.get(url, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                https.get(response.headers.location!, (res) => {
                    res.pipe(file);
                    file.on('finish', () => { file.close(); resolve(); });
                }).on('error', (err) => { fs.unlink(fontPath, () => { }); reject(err); });
            } else if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => { file.close(); resolve(); });
            } else {
                file.close();
                fs.unlink(fontPath, () => { });
                reject(new Error(`Failed to download font, status code: ${response.statusCode}`));
            }
        }).on('error', (err) => { fs.unlink(fontPath, () => { }); reject(err); });
    });
}

export class InvoiceService implements IInvoiceService {
    private _invoiceRepo: IInvoiceRepository;
    private _workHistoryRepo: IWorkHistoryRepository;
    private _jobRepo: IJobRepository;
    private _providerRepo: IServiceProviderRepository;
    private _authRepo: IAuthRepository;

    constructor(
        invoiceRepo: IInvoiceRepository,
        workHistoryRepo: IWorkHistoryRepository,
        jobRepo: IJobRepository,
        providerRepo: IServiceProviderRepository,
        authRepo: IAuthRepository
    ) {
        this._invoiceRepo = invoiceRepo;
        this._workHistoryRepo = workHistoryRepo;
        this._jobRepo = jobRepo;
        this._providerRepo = providerRepo;
        this._authRepo = authRepo;
    }

    async generateInvoice(workHistoryId: string): Promise<IInvoice> {
        const history = await this._workHistoryRepo.findById(workHistoryId);
        if (!history) throw new Error('Work history not found');
        if (history.payment.status !== 'completed') throw new Error('Invoice can only be generated for completed payments');


        const getIdStr = (val: unknown): string => {
            if (!val) return '';
            if (typeof val === 'object' && val !== null && '_id' in val) {
                const obj = val as { _id: { toString(): string } };
                return obj._id.toString();
            }
            return String(val);
        };

        const job = await this._jobRepo.findById(getIdStr(history.jobId));
        if (!job) throw new Error('Job not found');

        const client = await this._authRepo.findById(getIdStr(history.clientId));
        if (!client) throw new Error('Client not found');

        const provider = await this._providerRepo.findById(getIdStr(history.providerId));
        if (!provider) throw new Error('Provider not found');

        const providerUser = await this._authRepo.findById(getIdStr(provider.userId));
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

        const fontDir = path.resolve(__dirname, '../fonts');
        const fontRegularPath = path.join(fontDir, 'Roboto-Regular.ttf');
        const fontMediumPath = path.join(fontDir, 'Roboto-Medium.ttf');
        const fontBoldPath = path.join(fontDir, 'Roboto-Bold.ttf');

        try {
            await ensureFontExists(fontRegularPath, 'https://raw.githubusercontent.com/googlefonts/roboto/main/src/hinted/Roboto-Regular.ttf');
            await ensureFontExists(fontMediumPath, 'https://raw.githubusercontent.com/googlefonts/roboto/main/src/hinted/Roboto-Medium.ttf');
            await ensureFontExists(fontBoldPath, 'https://raw.githubusercontent.com/googlefonts/roboto/main/src/hinted/Roboto-Bold.ttf');
        } catch (err) {
            console.warn('Failed to ensure Roboto fonts exist, continuing with fallback fonts:', err);
        }

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            const hasRoboto = fs.existsSync(fontRegularPath) && fs.existsSync(fontMediumPath) && fs.existsSync(fontBoldPath);
            if (hasRoboto) {
                try {
                    doc.registerFont('Roboto-Regular', fontRegularPath);
                    doc.registerFont('Roboto-Medium', fontMediumPath);
                    doc.registerFont('Roboto-Bold', fontBoldPath);
                } catch (e) {
                    console.warn('Font registration error:', e);
                }
            }

            const setFont = (weight: 'regular' | 'medium' | 'bold', size: number, color: string) => {
                let fontName = 'Helvetica';
                if (hasRoboto) {
                    if (weight === 'regular') fontName = 'Roboto-Regular';
                    if (weight === 'medium') fontName = 'Roboto-Medium';
                    if (weight === 'bold') fontName = 'Roboto-Bold';
                } else {
                    if (weight === 'bold' || weight === 'medium') fontName = 'Helvetica-Bold';
                }
                doc.font(fontName).fontSize(size).fillColor(color);
            };

            const formatCurr = (num: number) => {
                const formatted = num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                return (hasRoboto ? '₹' : 'INR ') + formatted;
            };

            // Palette
            const primaryColor = '#6366F1';
            const textDark = '#0F172A';
            const textNormal = '#334155';
            const textMuted = '#64748B';
            const borderLight = '#E2E8F0';
            const bgLight = '#F8FAFC';

            // 1. HEADER SECTION
            // Logo Box
            doc.roundedRect(50, 50, 32, 32, 8).fill(primaryColor);
            setFont('bold', 16, '#FFFFFF');
            doc.text('QW', 50, 58, { width: 32, align: 'center' });

            // Brand Name & Subtitle
            setFont('bold', 22, textDark);
            doc.text('QuickWork', 92, 52);
            setFont('medium', 10, textMuted);
            doc.text('Marketplace Billing', 92, 78);

            // Title "INVOICE"
            setFont('bold', 28, textDark);
            doc.text('INVOICE', 412, 48, { width: 150, align: 'right' });

            // Status Badge
            const statusStr = (invoice.paymentStatus || 'pending').toLowerCase();
            let badgeBg = '#FEF3C7';
            let badgeText = '#D97706';
            if (statusStr === 'paid') {
                badgeBg = '#D1FAE5';
                badgeText = '#059669';
            } else if (statusStr === 'refunded') {
                badgeBg = '#F3F4F6';
                badgeText = '#4B5563';
            }
            doc.roundedRect(482, 84, 80, 22, 11).fill(badgeBg);
            setFont('bold', 10, badgeText);
            doc.text(statusStr.toUpperCase(), 482, 90, { width: 80, align: 'center' });

            // Header Separator
            doc.moveTo(50, 125).lineTo(562, 125).strokeColor(borderLight).lineWidth(1).stroke();

            // 2. METADATA SECTION (4 Columns)
            setFont('medium', 9, textMuted);
            doc.text('INVOICE NUMBER', 50, 142);
            doc.text('DATE OF ISSUE', 180, 142);
            doc.text('DUE / PAID DATE', 310, 142);
            doc.text('PAYMENT METHOD', 440, 142);

            setFont('bold', 11, textDark);
            doc.text(invoice.invoiceNumber || 'N/A', 50, 156);
            doc.text(invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A', 180, 156);
            const paidOrDue = invoice.paidAt ? new Date(invoice.paidAt) : (invoice.dueDate ? new Date(invoice.dueDate) : new Date());
            doc.text(paidOrDue.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), 310, 156);
            doc.text((invoice.paymentMethod || 'N/A').toUpperCase(), 440, 156);

            // Metadata Separator
            doc.moveTo(50, 185).lineTo(562, 185).strokeColor(borderLight).lineWidth(1).stroke();

            // 3. CLIENT & PROVIDER CARDS
            setFont('medium', 9, textMuted);
            doc.text('BILLED TO (CLIENT)', 50, 205);
            doc.text('BILLED BY (PROVIDER)', 310, 205);

            setFont('bold', 13, textDark);
            doc.text(invoice.client?.name || 'Client Name', 50, 222, { width: 240 });
            doc.text(invoice.provider?.name || 'Provider Name', 310, 222, { width: 240 });

            setFont('regular', 10, textNormal);
            doc.text(invoice.client?.email || 'N/A', 50, 240, { width: 240 });
            doc.text(invoice.provider?.email || 'N/A', 310, 240, { width: 240 });

            setFont('regular', 9, textMuted);
            doc.text(`Client ID: ${invoice.client?.userId ? invoice.client.userId.toString().slice(-8).toUpperCase() : 'N/A'}`, 50, 255, { width: 240 });
            doc.text(`Provider ID: ${invoice.provider?.providerId ? invoice.provider.providerId.toString().slice(-8).toUpperCase() : 'N/A'}`, 310, 255, { width: 240 });

            // 4. SERVICE DETAILS TABLE
            // Table Header Background
            doc.roundedRect(50, 285, 512, 28, 6).fill(bgLight);
            doc.moveTo(50, 285).lineTo(562, 285).strokeColor(borderLight).lineWidth(1).stroke();
            doc.moveTo(50, 313).lineTo(562, 313).strokeColor(borderLight).lineWidth(1).stroke();

            setFont('bold', 9, textMuted);
            doc.text('SERVICE DESCRIPTION', 65, 294);
            doc.text('QTY', 340, 294, { width: 40, align: 'right' });
            doc.text('RATE', 400, 294, { width: 70, align: 'right' });
            doc.text('AMOUNT', 480, 294, { width: 70, align: 'right' });

            // Table Rows
            let y = 328;
            const items = invoice.items && invoice.items.length > 0 ? invoice.items : [{
                description: `Service for Job ID: ${invoice.jobId || 'N/A'}`,
                quantity: 1,
                rate: invoice.total || 0,
                amount: invoice.total || 0
            }];

            items.forEach(item => {
                if (y > 560) {
                    doc.addPage();
                    y = 50;
                }
                setFont('medium', 11, textDark);
                doc.text(item.description || 'Service Provided', 65, y, { width: 265 });
                const nextY = doc.y;

                setFont('regular', 11, textNormal);
                doc.text((item.quantity || 1).toString(), 340, y, { width: 40, align: 'right' });
                doc.text(formatCurr(item.rate || 0), 400, y, { width: 70, align: 'right' });

                setFont('medium', 11, textDark);
                doc.text(formatCurr(item.amount || 0), 480, y, { width: 70, align: 'right' });

                y = Math.max(nextY + 12, y + 25);
                doc.moveTo(50, y).lineTo(562, y).strokeColor(borderLight).lineWidth(1).stroke();
                y += 15;
            });

            // 5. FINANCIAL SUMMARY & NOTES SECTION
            if (y > 520) {
                doc.addPage();
                y = 50;
            }

            // Left Side Notes
            setFont('bold', 10, textDark);
            doc.text('PAYMENT & TERMS', 50, y);
            setFont('medium', 10, statusStr === 'paid' ? '#059669' : '#D97706');
            doc.text(`Payment Status: ${statusStr.toUpperCase()}`, 50, y + 18);
            setFont('regular', 10, textNormal);
            doc.text(`Payment Method: ${(invoice.paymentMethod || 'N/A').toUpperCase()}`, 50, y + 34);
            doc.text(`Processed At: ${paidOrDue.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 50, y + 50);

            setFont('regular', 9, textMuted);
            doc.text('Note: This is a secure, automated marketplace billing document. All transactions are governed by QuickWork Marketplace terms of service and user agreements.', 50, y + 74, { width: 230 });

            // Right Side Summary Card
            const cardHeight = invoice.providerPayout ? 165 : 140;
            doc.roundedRect(300, y - 5, 262, cardHeight, 8).fill(bgLight);
            doc.roundedRect(300, y - 5, 262, cardHeight, 8).strokeColor(borderLight).lineWidth(1).stroke();

            let sy = y + 10;
            setFont('regular', 10, textMuted);
            doc.text('Subtotal', 315, sy);
            setFont('medium', 10, textDark);
            doc.text(formatCurr(invoice.subtotal || 0), 430, sy, { width: 115, align: 'right' });

            sy += 22;
            setFont('regular', 10, textMuted);
            doc.text(`Platform Fee (${invoice.platformFeePercent || 10}%)`, 315, sy);
            setFont('medium', 10, textNormal);
            doc.text('-' + formatCurr(invoice.platformFee || 0), 430, sy, { width: 115, align: 'right' });

            if (invoice.providerPayout) {
                sy += 22;
                setFont('regular', 10, textMuted);
                doc.text('Provider Payout', 315, sy);
                setFont('medium', 10, textNormal);
                doc.text(formatCurr(invoice.providerPayout), 430, sy, { width: 115, align: 'right' });
            }

            sy += 20;
            doc.moveTo(315, sy).lineTo(547, sy).strokeColor(borderLight).lineWidth(1).stroke();

            sy += 16;
            setFont('bold', 14, textDark);
            doc.text('Total Paid', 315, sy);
            setFont('bold', 16, primaryColor);
            doc.text(formatCurr(invoice.total || 0), 410, sy - 2, { width: 135, align: 'right' });

            // 6. FOOTER SECTION
            const footY = 705;
            doc.moveTo(50, footY).lineTo(562, footY).strokeColor(borderLight).lineWidth(1).stroke();
            setFont('medium', 9, textMuted);
            doc.text('This invoice was automatically generated by QuickWork Marketplace.', 50, footY + 15, { width: 512, align: 'center' });
            setFont('regular', 8, '#94A3B8');
            doc.text('QuickWork Solutions Pvt. Ltd. • Hitech City, Hyderabad, Telangana, India 500081', 50, footY + 30, { width: 512, align: 'center' });
            doc.text('For billing support, contact support@quickwork.com or visit help.quickwork.com', 50, footY + 42, { width: 512, align: 'center' });

            doc.end();
        });
    }
}

