import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";
import { ColorType } from "../../../domains/model/enums/colorType.enum";
import { Roles } from "../../../domains/model/roles.enum";


export class EditUserDto {
  @ApiProperty({
    description: "The new username of the user",
    example: "john_doe",
    required: false,
  })
  @IsString()
  @IsOptional()
  username: string;

  @ApiProperty({
    description: "A short bio for the user",
    example: "Food lover and traveler",
    required: false,
    maxLength: 200,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  bio: string;

  @ApiProperty({
    description: "The URL of the user's avatar image",
    example: "https://example.com/avatar.jpg",
    required: false,
  })
  @IsString()
  @IsOptional()
  avatarUrl: string;

  @ApiProperty({
    description: "The color type of the user",
    example: "summer",
    required: false,
  })
  @IsOptional()
  @IsEnum(ColorType)
  colorType: ColorType;

  @IsOptional()
  @IsEnum(Roles)
  role: Roles

  @IsOptional()
  @IsString()
  subcribed_at: Date
}

export class EditUserParamsDto {
  @ApiProperty({
    description: "The unique ID on the user profile",
    example: "10350c9f-1384-4e9e-9aba-b9eef895a829",
  })
  @IsString()
  profileId: string;
}
