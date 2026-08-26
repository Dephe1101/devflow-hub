export const VALIDATION_LIMITS = {
  WORKSPACE: {
    NAME_MIN: 1,
    NAME_MAX: 100,
    DESC_MAX: 500,
  },
  RESOURCE: {
    VALUE_MIN: 1,
    DISPLAY_NAME_MAX: 100,
  },
  NOTE: {
    TITLE_MIN: 1,
    TITLE_MAX: 200,
    CONTENT_MAX: 50000,
    CATEGORY_MAX: 50,
  },
  PAGINATION: {
    PAGE_MIN: 1,
    PAGE_DEFAULT: 1,
    LIMIT_MIN: 1,
    LIMIT_MAX: 100,
    LIMIT_DEFAULT: 20,
  },
} as const;

export const VALIDATION_MESSAGES = {
  WORKSPACE: {
    NAME_REQUIRED: 'Tên Workspace không được để trống',
    INVALID_COLOR: 'Màu không hợp lệ',
  },
  RESOURCE: {
    VALUE_REQUIRED: 'Giá trị không được để trống',
    INVALID_URL: 'URL không hợp lệ (không cho phép javascript:)',
  },
  AGENT: {
    ACTION_REQUIRED: 'Yêu cầu phải có Hành động (Action)',
    INVALID_ACTION: 'Hành động phải là open_folder hoặc launch_app',
    MISSING_TARGET: 'Yêu cầu Path cho open_folder, hoặc appName cho launch_app',
  },
} as const;
