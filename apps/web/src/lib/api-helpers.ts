import axios from 'axios';

interface BackendErrorResponse {
  error?: {
    message?: string | string[];
    code?: string;
  };
}

/**
 * Bóc tách thông báo lỗi từ AxiosError trả về bởi Backend (GlobalExceptionFilter).
 * @param error Lỗi bắt được từ try/catch hoặc onError
 * @param fallbackMessage Thông báo mặc định nếu không thể bóc tách được lỗi
 * @returns Chuỗi thông báo lỗi đã được chuẩn hóa
 */
export function extractErrorMessage(error: unknown, fallbackMessage: string): string {
  if (axios.isAxiosError<BackendErrorResponse>(error)) {
    const backendMessage = error.response?.data.error?.message;

    if (typeof backendMessage === 'string') {
      return backendMessage;
    }

    if (Array.isArray(backendMessage) && backendMessage.length > 0) {
      // Nếu là mảng (thường do class-validator / Zod validation), nối chúng lại
      return backendMessage.join(', ');
    }
  }

  // Nếu error là một Error instance thông thường (không phải Axios Error)
  if (error instanceof Error && error.message) {
    // Chỉ dùng fallback nếu error message quá chung chung (như "Network Error")
    if (error.message.includes('Network Error')) {
      return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.';
    }
    // Tránh trả về các lỗi kỹ thuật lố bịch cho end-user, ưu tiên fallback
    return fallbackMessage;
  }

  return fallbackMessage;
}
