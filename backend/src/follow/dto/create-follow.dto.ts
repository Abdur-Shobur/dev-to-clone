import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateFollowDto {
  @IsNumber()
  @IsNotEmpty()
  followingId: number;
}
