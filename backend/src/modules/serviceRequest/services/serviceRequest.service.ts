import { Types } from 'mongoose';
import { ISkillRepository } from '../../skill/interfaces/skill.interface';
import { IServiceProviderRepository } from '../../serviceProvider/interfaces/serviceProvider.interface';
import { CreateServiceRequestDTO } from '../dtos/createServiceRequest.dto';
import { RejectServiceRequestDTO } from '../dtos/rejectServiceRequest.dto';
import { IServiceRequest, IServiceRequestService, IServiceRequestRepository } from '../interfaces/serviceRequest.interface';
import { generateSlug } from '../../../utils/slug.util';
import { SKILL_STATUS } from '../../../constants/skill';
import { SuccessMessages } from '../../../constants/messages/successMessages';
import { ErrorMessages } from '../../../constants/messages/errorMessages';
import { ILogger } from '../../../shared/interfaces/ILogger';

export class ServiceRequestService implements IServiceRequestService {
    private _serviceRequestRepository: IServiceRequestRepository;
    private _skillRepository: ISkillRepository;
    private _serviceProviderRepository: IServiceProviderRepository;
    private _logger: ILogger;

    constructor(
        serviceRequestRepository: IServiceRequestRepository,
        skillRepository: ISkillRepository,
        serviceProviderRepository: IServiceProviderRepository,
        logger: ILogger
    ) {
        this._serviceRequestRepository = serviceRequestRepository;
        this._skillRepository = skillRepository;
        this._serviceProviderRepository = serviceProviderRepository;
        this._logger = logger;
    }

    async createRequest(userId: string, dto: CreateServiceRequestDTO): Promise<{ success: boolean; message: string; data?: IServiceRequest }> {
        const normalizedName = dto.name.toLowerCase().trim();
        const generatedSlug = generateSlug(normalizedName);

        const existingSkill = await this._skillRepository.findByName(normalizedName);
        if (existingSkill) {
            return { success: false, message: ErrorMessages.SKILL_ALREADY_EXISTS };
        }

        const existingRequest = await this._serviceRequestRepository.findPendingByName(normalizedName);
        if (existingRequest) {
            return { success: false, message: ErrorMessages.PENDING_REQUEST_EXISTS };
        }

        const newRequest = await this._serviceRequestRepository.create({
            name: normalizedName,
            slug: generatedSlug,
            description: dto.description,
            requestedBy: new Types.ObjectId(userId)
        });

        return {
            success: true,
            message: SuccessMessages.SERVICE_REQUEST_SUBMITTED,
            data: newRequest
        };
    }

    async getUserRequests(userId: string): Promise<{ success: boolean; data: IServiceRequest[] }> {
        const requests = await this._serviceRequestRepository.findByUser(userId);
        return { success: true, data: requests };
    }

    async getPendingRequests(page: number, limit: number, search?: string): Promise<{
        success: boolean;
        data: IServiceRequest[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }> {
        const [requests, total] = await Promise.all([
            this._serviceRequestRepository.findAllPending(page, limit, search),
            this._serviceRequestRepository.getPendingCount(search)
        ]);

        return {
            success: true,
            data: requests,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async approveRequest(
      adminId: string,
      requestId: string
    ): Promise<{ success: boolean; message: string }> {

      const request = await this._serviceRequestRepository.findById(requestId);
      if (!request) {
        return { success: false, message: ErrorMessages.SERVICE_REQUEST_NOT_FOUND };
      }

      if (request.status !== SKILL_STATUS.PENDING) {
        return { success: false, message: ErrorMessages.REQUEST_ALREADY_REVIEWED(request.status) };
      }

      let skill = await this._skillRepository.findBySlug(request.slug);

      if (!skill) {
        try {
          skill = await this._skillRepository.create({
            name: request.name,
            slug: request.slug
          });
        } catch (error) {
          if (error && typeof error === 'object' && 'code' in error && (error as { code?: number }).code === 11000) {
            skill = await this._skillRepository.findBySlug(request.slug);
          } else {
            this._logger.error("Failed to create skill during approval", { error: (error as Error).message || error, requestId, slug: request.slug });

            throw error;
          }
        }
      }

      if (!skill) {
        throw new Error('Failed to find or create skill');
      }

      const userId = request.requestedBy.toString();
      const updateResult = await this._serviceProviderRepository.addSkillToProvider(
        userId,
        skill._id.toString()
      );

      if (!updateResult || updateResult.matchedCount === 0) {
         await this._serviceRequestRepository.updateStatus(requestId, {
          status: SKILL_STATUS.APPROVED,
          reviewedBy: new Types.ObjectId(adminId),
          reviewedAt: new Date(),
          adminNotes: 'Skill approved but provider profile was not found to auto-assign.'
        });

        return {
          success: true,
          message: SuccessMessages.SERVICE_REQUEST_PARTIAL_SUCCESS
        };
      }

      await this._serviceRequestRepository.updateStatus(requestId, {
        status: SKILL_STATUS.APPROVED,
        reviewedBy: new Types.ObjectId(adminId),
        reviewedAt: new Date()
      });

      return {
        success: true,
        message: SuccessMessages.SERVICE_REQUEST_APPROVED
      };
    }

    async rejectRequest(adminId: string, requestId: string, dto: RejectServiceRequestDTO): Promise<{ success: boolean; message: string }> {
        const request = await this._serviceRequestRepository.findById(requestId);
        if (!request) {
            return { success: false, message: ErrorMessages.SERVICE_REQUEST_NOT_FOUND };
        }

        if (request.status !== SKILL_STATUS.PENDING) {
            return { success: false, message: ErrorMessages.REQUEST_ALREADY_REVIEWED(request.status) };
        }

        await this._serviceRequestRepository.updateStatus(requestId, {
            status: SKILL_STATUS.REJECTED,
            reviewedBy: new Types.ObjectId(adminId),
            reviewedAt: new Date(),
            rejectionReason: dto.rejectionReason
        });

        return { success: true, message: SuccessMessages.SERVICE_REQUEST_REJECTED };
    }
}
