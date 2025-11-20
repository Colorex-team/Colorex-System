import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class EditCommentParamsDto {
  @ApiProperty({
    example: 'c0f0c2e2-7a0d-4f0d-8a0d-0a0d0a0a0a0a',
    description: 'The id of the comment',
  })
  @IsString()
  commentId: string;
}

export class EditCommentDto {
  @ApiProperty({
    example: 'hello world',
    description: 'The content of the comment',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}
