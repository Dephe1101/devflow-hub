export class ResponseDto<T> {
  statusCode!: number;
  message!: string;
  data!: T | null;
  error?: unknown;

  constructor(partial: Partial<ResponseDto<T>>) {
    Object.assign(this, partial);
  }

  static success<T>(
    data: T,
    message = 'Success',
    statusCode = 200,
  ): ResponseDto<T> {
    return new ResponseDto<T>({
      statusCode,
      message,
      data,
    });
  }

  static error(
    message: string,
    statusCode = 400,
    errorDetails?: unknown,
  ): ResponseDto<null> {
    return new ResponseDto<null>({
      statusCode,
      message,
      data: null,
      error: errorDetails,
    });
  }
}
