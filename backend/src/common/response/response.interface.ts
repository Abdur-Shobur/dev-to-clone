import { PaginationMetaDto } from '@/helpers/pagination.dto';

export interface iResponse<T> {
  status: boolean;
  message: string;
  statusCode: number;
  data: T | null;
  meta?: any;
  errors?: any;
}
