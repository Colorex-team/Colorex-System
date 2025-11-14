import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class DeleteCommentParamsDto{
  @ApiProperty({
    example:'b9e9b1b1-1b1b-1b1b-1b1b-1b1b1b1b1b1b', 
    description:'The id of the comment'
  })
  @IsString()
  @IsNotEmpty()
  commentId: string
}

