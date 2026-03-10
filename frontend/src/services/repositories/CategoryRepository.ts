import { apiClient } from '../api/apiClient'
import type { ServiceCategory } from '../../features/jobs/types/job.types'

export class CategoryRepository {
    static async getCategories(): Promise<ServiceCategory[]> {
        try {
            const response = await apiClient.get<{ success: boolean; data: ServiceCategory[] }>('/skills/list')
            console.log('Categories fetched from API:', response.data)
            return response.data.data
        } catch {
            return [
                { id: '1', name: 'Web, Mobile & Software Dev' },
                { id: '2', name: 'Design & Creative' },
                { id: '3', name: 'Writing & Translation' },
                { id: '4', name: 'Sales & Marketing' },
                { id: '5', name: 'Admin Support' },
                { id: '6', name: 'Customer Service' },
                { id: '7', name: 'Data Science & Analytics' },
                { id: '8', name: 'Engineering & Architecture' }
            ]
        }
    }
}