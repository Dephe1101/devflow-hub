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
