import { apiClient } from '../api/apiClient'
import type { Location } from '../../features/jobs/types/job.types'

export class LocationRepository {
    static async getLocations(): Promise<Location[]> {
        try {
            const response = await apiClient.get<{ success: boolean; data: Location[] }>('/locations/all');
            return response.data.data
        } catch {
            return [
                { id: '1', name: 'Remote (Anywhere)' },
                { id: '2', name: 'Remote (US Only)' },
                { id: '3', name: 'Remote (Europe)' },
                { id: '4', name: 'New York, NY' },
                { id: '5', name: 'San Francisco, CA' },
                { id: '6', name: 'London, UK' },
                { id: '7', name: 'Toronto, CA' },
                { id: '8', name: 'Sydney, AU' },
                { id: '9', name: 'Berlin, DE' }
            ]
        }
    }
}