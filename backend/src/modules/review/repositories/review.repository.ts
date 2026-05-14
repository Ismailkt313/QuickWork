import { Types } from 'mongoose';
import { IReview, IReviewRepository, IReviewPaginatedResponse } from '../interfaces/review.interface';
import { ReviewModel } from '../models/review.model';

export class ReviewRepository implements IReviewRepository {
    async create(data: Partial<IReview>): Promise<IReview> {
        const review = new ReviewModel(data);
        return await review.save();
    }

    async findById(id: string): Promise<IReview | null> {
        return await ReviewModel.findById(id)
            .populate('reviewerId', 'name')
            .populate('revieweeId', 'name');
    }

    async findByUser(userId: string, page: number, limit: number): Promise<IReviewPaginatedResponse> {
        const skip = (page - 1) * limit;

        if (!Types.ObjectId.isValid(userId)) {
            return {
                data: [],
                pagination: { total: 0, page, limit, totalPages: 0, hasNext: false, hasPrev: false },
                meta: { averageRating: 0, totalReviews: 0 }
            };
        }

        const [reviews, total, aggregate] = await Promise.all([
            ReviewModel.find({ revieweeId: userId })
                .populate('reviewerId', 'name')
                .populate('revieweeId', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            ReviewModel.countDocuments({ revieweeId: userId }),
            ReviewModel.aggregate([
                { $match: { revieweeId: new Types.ObjectId(userId) } },
                { $group: { _id: null, averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } }
            ])
        ]);

        const totalPages = Math.ceil(total / limit);
        const meta = aggregate.length > 0 ? {
            averageRating: Math.round(aggregate[0].averageRating * 10) / 10,
            totalReviews: aggregate[0].totalReviews
        } : { averageRating: 0, totalReviews: 0 };

        return {
            data: reviews,
            pagination: {
                total,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            },
            meta
        };
    }

    async findByRevieweeAndRole(revieweeId: string, role: string, page: number, limit: number): Promise<IReviewPaginatedResponse> {
        const skip = (page - 1) * limit;

        if (!Types.ObjectId.isValid(revieweeId)) {
            return {
                data: [],
                pagination: { total: 0, page, limit, totalPages: 0, hasNext: false, hasPrev: false },
                meta: { averageRating: 0, totalReviews: 0 }
            };
        }

        const [aggregate, reviews, total] = await Promise.all([
            ReviewModel.aggregate([
                { $match: { revieweeId: new Types.ObjectId(revieweeId), role } },
                { $group: { _id: null, averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } }
            ]),
            ReviewModel.find({ revieweeId, role })
                .populate({
                    path: 'reviewerId',
                    select: 'name profileImage'
                })
                .populate({
                    path: 'assignmentId',
                    select: 'jobId',
                    populate: {
                        path: 'jobId',
                        select: 'title'
                    }
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            ReviewModel.countDocuments({ revieweeId, role })
        ]);

        const meta = aggregate.length > 0 ? {
            averageRating: Math.round(aggregate[0].averageRating * 10) / 10,
            totalReviews: aggregate[0].totalReviews
        } : { averageRating: 0, totalReviews: 0 };

        const totalPages = Math.ceil(total / limit);

        const mappedReviews = (reviews as any[]).map(r => ({
            _id: r._id,
            rating: r.rating,
            comment: r.comment,
            images: r.images,
            createdAt: r.createdAt,
            provider: {
                _id: r.reviewerId?._id,
                name: r.reviewerId?.name,
                profileImage: r.reviewerId?.profileImage?.url
            },
            assignment: {
                _id: r.assignmentId?._id,
                title: r.assignmentId?.jobId?.title || 'Unknown Job'
            }
        }));

        return {
            data: mappedReviews as any,
            pagination: {
                total,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            },
            meta
        };
    }

    async findByAssignment(assignmentId: string): Promise<IReview[]> {
        return await ReviewModel.find({ assignmentId })
            .populate('reviewerId', 'name')
            .populate('revieweeId', 'name');
    }

    async exists(query: any): Promise<boolean> {
        const count = await ReviewModel.countDocuments(query);
        return count > 0;
    }

    async update(id: string, data: Partial<IReview>): Promise<IReview | null> {
        return await ReviewModel.findByIdAndUpdate(id, data, { new: true })
            .populate('reviewerId', 'name')
            .populate('revieweeId', 'name');
    }

    async delete(id: string): Promise<boolean> {
        const result = await ReviewModel.findByIdAndDelete(id);
        return !!result;
    }

    async getDashboardStats(revieweeId: string): Promise<any> {
        const stats = await ReviewModel.aggregate([
            { $match: { revieweeId: new Types.ObjectId(revieweeId) } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);
        return stats[0] || { averageRating: 0, totalReviews: 0 };
    }

    async findRecentReviews(revieweeId: string, limit: number): Promise<IReview[]> {
        return await ReviewModel.find({ revieweeId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('reviewerId', 'name profileImage');
    }
}
