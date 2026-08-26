export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiResponse<T = any> {
  data?: T;
  success?: boolean;
  message?: string;
  error?: {
    code: string;
    message: string;
    statusCode: number;
  };
}
