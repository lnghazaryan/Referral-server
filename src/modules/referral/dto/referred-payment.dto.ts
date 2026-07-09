import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MinLength
} from "class-validator";

export class ReferredPaymentDto {
  @ApiProperty({ example: "friend@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "A3B7CD" })
  @IsString()
  @MinLength(1)
  referralCode!: string;

  @ApiProperty({
    example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    description:
      "EventHub event UUID the referred user purchased. Referrer promo is only generated when this event is in our events list."
  })
  @IsUUID()
  eventId!: string;

  @ApiProperty({
    example: "+37477111222",
    required: false,
    nullable: true
  })
  @IsOptional()
  @IsString()
  phone?: string;
}
