import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
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

  @ApiProperty({
    example: 15000,
    required: false,
    nullable: true,
    description: "Total purchase amount paid by the referred user."
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  buyPrice?: number;
}
