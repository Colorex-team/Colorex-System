import { IsUUID, IsOptional, IsString } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  @IsOptional()
  userId: string;

  @IsOptional()
  @IsString()
  existingSubscriptionId?: string;
}