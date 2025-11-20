import { ApiProperty } from '@nestjs/swagger';
import {  IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class FollowParamsDto {
  @ApiProperty({
    example: 'b9e9b1b1-1b1b-1b1b-1b1b-1b1b1b1b1b1b1b',
    description: 'The id of the user to follow',
  })
  @IsString()
  @IsNotEmpty()
  followingId: string;
}

export class UserFollowParamsDto {
  @ApiProperty({
    example: 'b9e9b1b1-1b1b-1b1b-1b1b-1b1b1b1b1b1b1b',
    description: 'The id of the user',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class UserFollowQueryDto {
  @ApiProperty({
    example: 1,
    description: 'Page number for pagination',
  })
  @IsNotEmpty()
  page: number

  @ApiProperty({
    example: 10,
    description: 'Number of items per page for pagination',
  })
  @IsNotEmpty()
  limit: number
}