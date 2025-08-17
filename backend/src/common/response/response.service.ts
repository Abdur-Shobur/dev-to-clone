import { PaginationMetaDto } from '@/helpers/pagination.dto';
import { iResponse } from './response.interface';
const isProduction = process.env.NODE_ENV === 'production';

type SuccessResponseParams<T> = {
  data: T;
  message?: string;
  statusCode?: number;
  meta?: PaginationMetaDto | null;
};

type ErrorResponseParams = {
  message?: string;
  statusCode?: number;
  errors?: any;
};

export class ResponseService {
  static success<T>({
    data,
    message = 'Operation successful',
    statusCode = 200,
    meta = null,
  }: SuccessResponseParams<T>): iResponse<T> {
    return {
      status: true,
      message,
      data,
      meta,
      statusCode,
    };
  }

  static error({
    message = 'Something went wrong',
    statusCode = 400,
    errors = null,
  }: ErrorResponseParams): iResponse<null> {
    return {
      status: false,
      message,
      data: null,
      meta: undefined,
      statusCode,
      errors: isProduction ? null : errors,
    };
  }
}
