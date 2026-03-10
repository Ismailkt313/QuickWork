export interface responseservice {
    _id: string;
  name: string;
  slug: string;
    icon?: string;
}

export interface responseLocation {
    _id: string;
    name: string;
    slug: string;
}

export const mapLandingDataToResponseDTO = (data: any): { services: responseservice[]; locations: responseLocation[] } => {
    const services: responseservice[] = data.services.map((service: any) => ({
        _id: service._id,
        name: service.name,
        slug: service.slug,
        icon: service.icon
    }));

    const locations: responseLocation[] = data.locations.map((location: any) => ({
        _id: location._id,
        name: location.name,
        slug: location.slug
    }));

    return { services, locations };
};