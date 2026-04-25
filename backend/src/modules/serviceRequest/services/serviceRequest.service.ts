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
import { logger } from '../../../utils/logger';


export class ServiceRequestService implements IServiceRequestService {
    private serviceRequestRepository: IServiceRequestRepository;
    private skillRepository: ISkillRepository;
    private serviceProviderRepository: IServiceProviderRepository;

    constructor(
        serviceRequestRepository: IServiceRequestRepository,
        skillRepository: ISkillRepository,
        serviceProviderRepository: IServiceProviderRepository
    ) {
        this.serviceRequestRepository = serviceRequestRepository;
        this.skillRepository = skillRepository;
        this.serviceProviderRepository = serviceProviderRepository;
    }

    async createRequest(userId: string, dto: CreateServiceRequestDTO): Promise<{ success: boolean; message: string; data?: any }> {
        const normalizedName = dto.name.toLowerCase().trim();
        const generatedSlug = generateSlug(normalizedName);

        const existingSkill = await this.skillRepository.findByName(normalizedName);
        if (existingSkill) {
            return { success: false, message: ErrorMessages.SKILL_ALREADY_EXISTS };
        }

        const existingRequest = await this.serviceRequestRepository.findPendingByName(normalizedName);
        if (existingRequest) {
            return { success: false, message: ErrorMessages.PENDING_REQUEST_EXISTS };
        }

        const newRequest = await this.serviceRequestRepository.create({
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
        const requests = await this.serviceRequestRepository.findByUser(userId);
        return { success: true, data: requests };
    }

    async getPendingRequests(): Promise<{ success: boolean; data: IServiceRequest[] }> {
        const requests = await this.serviceRequestRepository.findAllPending();
        return { success: true, data: requests };
    }

    async approveRequest(
      adminId: string,
      requestId: string
    ): Promise<{ success: boolean; message: string }> {

      const request = await this.serviceRequestRepository.findById(requestId);
      if (!request) {
        return { success: false, message: ErrorMessages.SERVICE_REQUEST_NOT_FOUND };
      }

      if (request.status !== SKILL_STATUS.PENDING) {
        return { success: false, message: ErrorMessages.REQUEST_ALREADY_REVIEWED(request.status) };
      }


      let skill = await this.skillRepository.findBySlug(request.slug);

      if (!skill) {
        try {
          skill = await this.skillRepository.create({
            name: request.name,
            slug: request.slug
          });
        } catch (error: any) {
          if (error.code === 11000) {
            skill = await this.skillRepository.findBySlug(request.slug);
          } else {
            logger.error({ error, requestId, slug: request.slug }, "Failed to create skill during approval");

            throw error;
          }
        }
      }

      if (!skill) {
        throw new Error('Failed to find or create skill');
      }

      const userId = request.requestedBy.toString();
      const updateResult = await this.serviceProviderRepository.addSkillToProvider(
        userId,
        skill._id.toString()
      );

      if (updateResult.matchedCount === 0) {
         await this.serviceRequestRepository.updateStatus(requestId, {
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


      await this.serviceRequestRepository.updateStatus(requestId, {
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
        const request = await this.serviceRequestRepository.findById(requestId);
        if (!request) {
            return { success: false, message: ErrorMessages.SERVICE_REQUEST_NOT_FOUND };
        }

        if (request.status !== SKILL_STATUS.PENDING) {
            return { success: false, message: ErrorMessages.REQUEST_ALREADY_REVIEWED(request.status) };
        }

        await this.serviceRequestRepository.updateStatus(requestId, {
            status: SKILL_STATUS.REJECTED,
            reviewedBy: new Types.ObjectId(adminId),
            reviewedAt: new Date(),
            rejectionReason: dto.rejectionReason
        });

        return { success: true, message: SuccessMessages.SERVICE_REQUEST_REJECTED };
    }
}
