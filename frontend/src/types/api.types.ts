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

export interface IPaginatedData<T> extends IPaginationMetadata {
  users: T[];
}

export type IPaginatedResponse<T> = IApiResponse<IPaginatedData<T>>;
