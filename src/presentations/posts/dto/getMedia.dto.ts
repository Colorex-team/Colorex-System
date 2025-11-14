import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";

export class GetMediaQueryDto {
  
  @ApiProperty({
    description: 'Page number for pagination',
    minimum: 1,
    default: 1,
    example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 9,
    example: 9
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit: number = 9;

  @ApiProperty({
    description: 'Search query string',
    required: false,
    default: '',
    example: 'sunset'
  })
  @IsOptional()
  @IsString()
  searchQuery?: string = '';

}

export class GetHashTagMediaQueryDto{
  @ApiProperty({
    description: 'Page number for pagination',
    minimum: 1,
    default: 1,
    example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 9,
    example: 9
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit: number = 9;

  @ApiProperty({
    description: 'Search query string',
    required: false,
    default: '',
    example: 'sunset'
  })
  @IsOptional()
  @IsString()
  searchQuery?: string = '';

  @ApiProperty({
    description: 'Hash tag name',
    required: true,
    default: '',
    example: 'sunset'
  })
  @IsOptional()
  @IsString()
  hashTagName: string
}

export class GetUserMediaParamsDto {
  @ApiProperty({
    description: 'ID of the user whose media is being requested',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsNotEmpty()
  @IsString()
  userId: string;
}

