export const ERROR_MESSAGES = {
  WORKSPACE: {
    NOT_FOUND: 'Không tìm thấy workspace',
    NOT_FOUND_OR_NO_PERMISSION:
      'Không tìm thấy Không gian làm việc hoặc không thuộc quyền sở hữu của bạn',
    NO_ACCESS: 'Bạn không có quyền truy cập workspace này',
  },
  RESOURCE: {
    NOT_BELONG_TO_WORKSPACE: 'Resource không thuộc về workspace này',
    NOT_BELONG_OR_NOT_FOUND: 'Resource không thuộc về workspace này hoặc không tồn tại',
    NOTE_TOO_LONG: 'Resource note không được vượt quá 500 ký tự',
    NOT_FOUND_IN_USER_WORKSPACES: 'Không tìm thấy tài nguyên trong các Không gian làm việc của bạn',
  },
  NOTE: {
    NOT_FOUND: 'Không tìm thấy note',
  },
  AUTH: {
    EMAIL_IN_USE: 'Email này đã được sử dụng',
    INVALID_CREDENTIALS: 'Email hoặc mật khẩu không chính xác',
    USER_NOT_FOUND: 'Không tìm thấy người dùng',
    REFRESH_TOKEN_REVOKED: 'Token làm mới đã bị thu hồi hoặc hết hiệu lực',
    REFRESH_TOKEN_NOT_FOUND: 'Không tìm thấy token làm mới (Refresh Token)',
    REFRESH_TOKEN_INVALID: 'Token làm mới không hợp lệ hoặc đã hết hạn',
    MISSING_TOKEN: 'Thiếu token xác thực',
    UNAUTHORIZED: 'Không có quyền truy cập',
    AGENT_HTTP_FORBIDDEN: 'Token của Agent không thể truy cập HTTP API',
  },
  AGENT: {
    INVALID_CODE: 'Mã kết nối không hợp lệ hoặc đã hết hạn',
    INVALID_TOKEN: 'Token của Agent không hợp lệ',
    NOT_FOUND_OR_NO_PERMISSION: 'Không tìm thấy thiết bị hoặc không thuộc quyền sở hữu của bạn',
    RATE_LIMIT_EXCEEDED: 'Thử quá nhiều lần. Vui lòng thử lại sau.',
    NOT_CONNECTED: 'Desktop Agent chưa được kết nối',
    WS_ONLY: 'Chỉ các agent mới được phép kết nối',
  },
  VALIDATION: {
    INVALID_DATA: 'Dữ liệu không hợp lệ',
  },
} as const;

export const SUCCESS_MESSAGES = {
  WORKSPACE: {
    DELETED: 'Xóa workspace thành công',
  },
  RESOURCE: {
    REORDERED: 'Sắp xếp tài nguyên thành công',
    DELETED: 'Xóa tài nguyên thành công',
  },
  AUTH: {
    LOGOUT: 'Đăng xuất thành công',
  },
} as const;
