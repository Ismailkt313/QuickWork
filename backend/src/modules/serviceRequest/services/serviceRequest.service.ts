import mongoose, { Types } from 'mongoose';
import { ServiceRequestRepository } from '../repositories/serviceRequest.repository';
import { SkillRepository } from '../../skill/repositories/skill.repository';
import { CreateServiceRequestDTO } from '../dtos/createServiceRequest.dto';
import { RejectServiceRequestDTO } from '../dtos/rejectServiceRequest.dto';
import { IServiceRequest } from '../interfaces/serviceRequest.interface';
import { generateSlug } from '../../../utils/slug.util';

export class ServiceRequestService {
    private serviceRequestRepository: ServiceRequestRepository;
    private skillRepository: SkillRepository;

    constructor(serviceRequestRepository: ServiceRequestRepository, skillRepository: SkillRepository) {
        this.serviceRequestRepository = serviceRequestRepository;
        this.skillRepository = skillRepository;
    }

    async createRequest(userId: string, dto: CreateServiceRequestDTO): Promise<{ success: boolean; message: string; data?: any }> {
        const normalizedName = dto.name.toLowerCase().trim();
        const generatedSlug = generateSlug(normalizedName);

        const existingSkill = await this.skillRepository.findByName(normalizedName);
        if (existingSkill) {
            return { success: false, message: 'Skill already exists in the system' };
        }

        const existingRequest = await this.serviceRequestRepository.findPendingByName(normalizedName);
        if (existingRequest) {
            return { success: false, message: 'A pending request for this skill already exists' };
        }

        const newRequest = await this.serviceRequestRepository.create({
            name: normalizedName,
            slug: generatedSlug,
            description: dto.description,
            requestedBy: new Types.ObjectId(userId)
        });

        return {
            success: true,
            message: 'Service request submitted successfully',
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
        return { success: false, message: "Service request not found" };
      }

      if (request.status !== "pending") {
        return { success: false, message: `Request is already ${request.status}` };
      }

      try {
         await this.skillRepository.create({
          name: request.name,
          slug: request.slug
        });

      } catch (error: any) {
         if (error.code === 11000) {
         } else {
          throw error;
        }
      }

       await this.serviceRequestRepository.updateStatus(requestId, {
        status: "approved",
        reviewedBy: new Types.ObjectId(adminId),
        reviewedAt: new Date()
      });

      return {
        success: true,
        message: "Service request approved successfully"
      };
    }

    async rejectRequest(adminId: string, requestId: string, dto: RejectServiceRequestDTO): Promise<{ success: boolean; message: string }> {
        const request = await this.serviceRequestRepository.findById(requestId);
        if (!request) {
            return { success: false, message: 'Service request not found' };
        }

        if (request.status !== 'pending') {
            return { success: false, message: `Request is already ${request.status}` };
        }

        await this.serviceRequestRepository.updateStatus(requestId, {
            status: 'rejected',
            reviewedBy: new Types.ObjectId(adminId),
            reviewedAt: new Date(),
            rejectionReason: dto.rejectionReason
        });

        return { success: true, message: 'Service request has been rejected' };
    }
}
