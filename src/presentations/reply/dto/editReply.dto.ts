import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class EditReplyParamsDto {
    @ApiProperty({
      example:'2a047d80-d406-424d-bbfa-adc39e20077b',
      description:'the id of the reply'
    })
  @IsString()
  @IsString()
  replyId: string
}

export class EditReplyDto {
  @ApiProperty({
    example:'Hello World!',
    description:'new reply content'
  })
  @IsNotEmpty()
  @IsString()
  content: string
}