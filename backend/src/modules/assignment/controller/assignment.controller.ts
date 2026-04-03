import { Request, Response } from 'express';
import { IAssignmentController, IAssignmentService } from '../interfaces/assignment.interface';
import { AppError } from '../../../utils/AppError';
import { IServiceProviderRepository } from '../../serviceProvider/interfaces/serviceProvider.interface';
import { mapAssignmentToResponseDTO } from '../dtos/assignmentResponse.dto';

export class AssignmentController implements IAssignmentController {
    private assignmentService: IAssignmentService;
    private serviceProviderRepository: IServiceProviderRepository;

    constructor(
        assignmentService: IAssignmentService,
        serviceProviderRepository: IServiceProviderRepository
    ) {
        this.assignmentService = assignmentService;
        this.serviceProviderRepository = serviceProviderRepository;
    }

    getProviderAssignments = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError('Unauthorized access', 401);
            }

            const provider = await this.serviceProviderRepository.findByUserId(userId);
            if (!provider) {
                throw new AppError('Provider profile not found', 404);
            }

            const assignments = await this.assignmentService.getAssignmentsByProvider(provider._id.toString());
            
            res.status(200).json({
                success: true,
                data: assignments.map(mapAssignmentToResponseDTO)
            });
        } catch (error) {
            next(error);
        }
    };

    getAssignmentById = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId;
            const assignmentId = req.params.id as string;
            const provider = await this.serviceProviderRepository.findByUserId(userId as string);
            const assignment = await this.assignmentService.getAssignmentById(assignmentId);

            const freelancerId = assignment?.freelancerId?._id ? assignment.freelancerId._id.toString() : assignment?.freelancerId?.toString();

            if (!assignment || !provider || freelancerId !== provider._id.toString()) {
                throw new AppError('Assignment not found or unauthorized', 404);
            }

            // Fetch co-workers (other assignments for the same job)
            const jobId = assignment.jobId?._id ? assignment.jobId._id.toString() : assignment.jobId.toString();
            const coWorkers = await this.assignmentService.getAssignmentsByJobId(jobId);
            
            // Map co-workers to a simple format
            const mappedCoWorkers = coWorkers
                .filter(a => a._id.toString() !== assignmentId) // Exclude current provider
                .map((a: any) => ({
                    id: a._id.toString(),
                    name: a.freelancerId?.userId?.name || 'Provider',
                    headline: a.freelancerId?.headline || '',
                    profileImage: a.freelancerId?.profileImage || '',
                    workStatus: a.workStatus
                }));

            const responseData = mapAssignmentToResponseDTO(assignment);
            responseData.coWorkers = mappedCoWorkers;

            res.status(200).json({
                success: true,
                data: responseData
            });
        } catch (error) {
            next(error);
        }
    };

    updateStatus = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId;
            const assignmentId = req.params.id as string;
            const { status } = req.body;

            const provider = await this.serviceProviderRepository.findByUserId(userId as string);
            const assignment = await this.assignmentService.getAssignmentById(assignmentId);

            const freelancerId = assignment?.freelancerId?._id ? assignment.freelancerId._id.toString() : assignment?.freelancerId?.toString();

            if (!assignment || !provider || freelancerId !== provider._id.toString()) {
                throw new AppError('Assignment not found or unauthorized', 404);
            }

            const updated = await this.assignmentService.updateStatus(assignmentId, status);
            res.status(200).json({
                success: true,
                message: `Status updated to ${status}`,
                data: updated ? mapAssignmentToResponseDTO(updated) : null
            });
        } catch (error) {
            next(error);
        }
    };

    submitProof = async (req: Request, res: Response, next: any): Promise<void> => {
        try {
            const userId = req.user?.userId;
            const assignmentId = req.params.id as string;
            const { images, description } = req.body;

            const provider = await this.serviceProviderRepository.findByUserId(userId as string);
            const assignment = await this.assignmentService.getAssignmentById(assignmentId);

            const freelancerId = assignment?.freelancerId?._id ? assignment.freelancerId._id.toString() : assignment?.freelancerId?.toString();

            if (!assignment || !provider || freelancerId !== provider._id.toString()) {
                throw new AppError('Assignment not found or unauthorized', 404);
            }

            const updated = await this.assignmentService.submitProof(assignmentId, { images, description });
            res.status(200).json({
                success: true,
                message: 'Proof submitted successfully',
                data: updated ? mapAssignmentToResponseDTO(updated) : null
            });
        } catch (error) {
            next(error);
        }
    };
}

