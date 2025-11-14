import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsNotEmpty } from 'class-validator';

export class PostMessageDto {
  @ApiProperty({
    example: 'Hello World!',
    description: 'The content of the message',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}
export class postMessageParamsDto{
  @ApiProperty({
    example: '2a047d80-d406-424d-bbfa-adc39e20077b',
    description: 'The id of the user to send the message to',
  })
  @IsString()
  @IsNotEmpty()
  receiverId: string;
}