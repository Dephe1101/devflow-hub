const fs = require('fs');
const path = require('path');

const replacements = [
  {
    file: 'apps/api/src/modules/workspace/workspace.service.ts',
    from: /'Không tìm thấy workspace'/g,
    to: 'ERROR_MESSAGES.WORKSPACE.NOT_FOUND',
  },
  {
    file: 'apps/api/src/modules/workspace/workspace.controller.ts',
    from: /'Xóa workspace thành công'/g,
    to: 'SUCCESS_MESSAGES.WORKSPACE.DELETED',
  },
  {
    file: 'apps/api/src/modules/resource/resource.service.ts',
    from: /'Không tìm thấy workspace'/g,
    to: 'ERROR_MESSAGES.WORKSPACE.NOT_FOUND',
  },
  {
    file: 'apps/api/src/modules/resource/resource.service.ts',
    from: /'Resource không thuộc về workspace này'/g,
    to: 'ERROR_MESSAGES.RESOURCE.NOT_BELONG_TO_WORKSPACE',
  },
  {
    file: 'apps/api/src/modules/resource/resource.controller.ts',
    from: /'Sắp xếp tài nguyên thành công'/g,
    to: 'SUCCESS_MESSAGES.RESOURCE.REORDERED',
  },
  {
    file: 'apps/api/src/modules/resource/resource.controller.ts',
    from: /'Xóa tài nguyên thành công'/g,
    to: 'SUCCESS_MESSAGES.RESOURCE.DELETED',
  },
  {
    file: 'apps/api/src/modules/notes/notes.service.ts',
    from: /'Bạn không có quyền truy cập workspace này'/g,
    to: 'ERROR_MESSAGES.WORKSPACE.NO_ACCESS',
  },
  {
    file: 'apps/api/src/modules/notes/notes.service.ts',
    from: /'Resource không thuộc về workspace này hoặc không tồn tại'/g,
    to: 'ERROR_MESSAGES.RESOURCE.NOT_BELONG_OR_NOT_FOUND',
  },
  {
    file: 'apps/api/src/modules/notes/notes.service.ts',
    from: /'Resource note không được vượt quá 500 ký tự'/g,
    to: 'ERROR_MESSAGES.RESOURCE.NOTE_TOO_LONG',
  },
  {
    file: 'apps/api/src/modules/notes/notes.service.ts',
    from: /'Không tìm thấy note'/g,
    to: 'ERROR_MESSAGES.NOTE.NOT_FOUND',
  },
  {
    file: 'apps/api/src/modules/auth/auth.service.ts',
    from: /'Email này đã được sử dụng'/g,
    to: 'ERROR_MESSAGES.AUTH.EMAIL_IN_USE',
  },
  {
    file: 'apps/api/src/modules/auth/auth.service.ts',
    from: /'Email hoặc mật khẩu không chính xác'/g,
    to: 'ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS',
  },
  {
    file: 'apps/api/src/modules/auth/auth.service.ts',
    from: /'Không tìm thấy người dùng'/g,
    to: 'ERROR_MESSAGES.AUTH.USER_NOT_FOUND',
  },
  {
    file: 'apps/api/src/modules/auth/auth.controller.ts',
    from: /'Token làm mới đã bị thu hồi hoặc hết hiệu lực'/g,
    to: 'ERROR_MESSAGES.AUTH.REFRESH_TOKEN_REVOKED',
  },
  {
    file: 'apps/api/src/modules/auth/auth.controller.ts',
    from: /'Không tìm thấy token làm mới \(Refresh Token\)'/g,
    to: 'ERROR_MESSAGES.AUTH.REFRESH_TOKEN_NOT_FOUND',
  },
  {
    file: 'apps/api/src/modules/auth/auth.controller.ts',
    from: /'Token làm mới không hợp lệ hoặc đã hết hạn'/g,
    to: 'ERROR_MESSAGES.AUTH.REFRESH_TOKEN_INVALID',
  },
  {
    file: 'apps/api/src/modules/auth/auth.controller.ts',
    from: /'Đăng xuất thành công'/g,
    to: 'SUCCESS_MESSAGES.AUTH.LOGOUT',
  },
  {
    file: 'apps/api/src/modules/agent/agent.service.ts',
    from: /'Mã kết nối không hợp lệ hoặc đã hết hạn'/g,
    to: 'ERROR_MESSAGES.AGENT.INVALID_CODE',
  },
  {
    file: 'apps/api/src/modules/agent/agent.service.ts',
    from: /'Token của Agent không hợp lệ'/g,
    to: 'ERROR_MESSAGES.AGENT.INVALID_TOKEN',
  },
  {
    file: 'apps/api/src/modules/agent/agent.service.ts',
    from: /'Không tìm thấy thiết bị hoặc không thuộc quyền sở hữu của bạn'/g,
    to: 'ERROR_MESSAGES.AGENT.NOT_FOUND_OR_NO_PERMISSION',
  },
  {
    file: 'apps/api/src/modules/agent/agent.controller.ts',
    from: /'Không tìm thấy tài nguyên trong các Không gian làm việc của bạn'/g,
    to: 'ERROR_MESSAGES.RESOURCE.NOT_FOUND_IN_USER_WORKSPACES',
  },
  {
    file: 'apps/api/src/modules/auth/strategies/jwt.strategy.ts',
    from: /'Token của Agent không thể truy cập HTTP API'/g,
    to: 'ERROR_MESSAGES.AUTH.AGENT_HTTP_FORBIDDEN',
  },
  {
    file: 'apps/api/src/modules/auth/guards/ws-jwt.guard.ts',
    from: /'Thiếu token xác thực'/g,
    to: 'ERROR_MESSAGES.AUTH.MISSING_TOKEN',
  },
  {
    file: 'apps/api/src/modules/auth/guards/ws-jwt.guard.ts',
    from: /'Không có quyền truy cập'/g,
    to: 'ERROR_MESSAGES.AUTH.UNAUTHORIZED',
  },
  {
    file: 'apps/api/src/common/pipes/zod-validation.pipe.ts',
    from: /'Dữ liệu không hợp lệ'/g,
    to: 'ERROR_MESSAGES.VALIDATION.INVALID_DATA',
  },
];

for (const rep of replacements) {
  const p = path.join(__dirname, rep.file);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    if (content.match(rep.from)) {
      content = content.replace(rep.from, rep.to);
      if (!content.includes('ERROR_MESSAGES') && !content.includes('SUCCESS_MESSAGES')) continue;

      const importRegex = /import\s+{[^}]*}\s+from\s+['"]@repo\/constants['"];/g;

      if (!content.match(importRegex)) {
        content = "import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@repo/constants';\n" + content;
      } else {
        content = content.replace(
          /import\s+{([^}]+)}\s+from\s+['"]@repo\/constants['"];/g,
          (match, p1) => {
            if (p1.includes('ERROR_MESSAGES')) return match;
            return `import { ${p1.trim()}, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@repo/constants';`;
          },
        );
      }
      fs.writeFileSync(p, content);
      console.log('Updated ' + rep.file);
    }
  }
}
