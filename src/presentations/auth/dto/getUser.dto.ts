import { IsString, IsUUID } from "class-validator";

export class GetUserParamsDto {
  @IsString()
  profileId: string
}