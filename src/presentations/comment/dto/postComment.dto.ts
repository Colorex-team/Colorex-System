import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class PostCommentParamsDto {
  @ApiProperty({
    example: '5f1b4c4d-1b4c-4d1b-4c1d-4d1b4c4d1b4c',
    description: 'The id of the post', 
  })
  @IsNotEmpty()
  postId: string
}
export class PostCommentDto {
  @ApiProperty({
    example: 'Comment content',
    description: 'The content of the comment',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}

