import { apiClient } from '../api/apiClient'
import type { Location } from '../../features/user/jobs/types/job.types'

export class LocationRepository {
    static async getLocations(): Promise<Location[]> {
        try {
            const response = await apiClient.get<{ success: boolean; data: Location[] }>('/locations/all');
            return response.data.data
        } catch {
            return []
        }
    }
}