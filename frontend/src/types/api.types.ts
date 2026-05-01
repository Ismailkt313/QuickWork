export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface IPaginationMetadata {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IPaginatedResponse<T> extends IApiResponse<T[]> {
  pagination: IPaginationMetadata;
}
