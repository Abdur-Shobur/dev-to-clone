import { Type } from 'class-transformer';
import { IsOptional, IsPositive } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  readonly page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  readonly limit?: number = 10;
}

export class PaginationMetaDto {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly pageCount: number;
  readonly hasPreviousPage: boolean;
  readonly hasNextPage: boolean;
}
