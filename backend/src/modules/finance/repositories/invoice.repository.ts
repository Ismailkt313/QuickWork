import { IInvoice, IInvoiceRepository } from '../interfaces/finance.interface';
import { InvoiceModel } from '../models/invoice.model';
import { Types } from 'mongoose';

export class InvoiceRepository implements IInvoiceRepository {
    async create(data: Partial<IInvoice>): Promise<IInvoice> {
        return await InvoiceModel.create(data);
    }

    async findById(id: string): Promise<IInvoice | null> {
        return await InvoiceModel.findById(id)
            .populate('jobId')
            .populate('workHistoryId');
    }

    async findByInvoiceNumber(number: string): Promise<IInvoice | null> {
        return await InvoiceModel.findOne({ invoiceNumber: number });
    }

    async findByClient(clientId: string, skip: number, limit: number): Promise<[IInvoice[], number]> {
        const query = { 'client.userId': new Types.ObjectId(clientId) };
        return Promise.all([
            InvoiceModel.find(query)
                .populate('jobId')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            InvoiceModel.countDocuments(query)
        ]);
    }

    async findByProvider(providerId: string, skip: number, limit: number): Promise<[IInvoice[], number]> {
        const query = { 'provider.providerId': new Types.ObjectId(providerId) };
        return Promise.all([
            InvoiceModel.find(query)
            .populate('jobId')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            InvoiceModel.countDocuments(query)
        ]);
    }

    async getNextInvoiceNumber(): Promise<string> {
        const date = new Date();
        const year = date.getFullYear();

        // Find the last invoice for the current year
        const lastInvoice = await InvoiceModel.findOne({
            invoiceNumber: new RegExp(`^QW-INV-${year}-`)
        }).sort({ invoiceNumber: -1 });

        let sequence = 1;
        if (lastInvoice) {
            const parts = lastInvoice.invoiceNumber.split('-');
            const lastSequence = parseInt(parts[parts.length - 1]);
            sequence = lastSequence + 1;
        }

        return `QW-INV-${year}-${sequence.toString().padStart(5, '0')}`;
    }
}
