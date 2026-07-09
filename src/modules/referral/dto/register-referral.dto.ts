import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, IsUUID, MinLength } from "class-validator";

export class RegisterReferralDto {
  @ApiProperty({ example: "owner@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "+37499123456" })
  @IsString()
  @MinLength(1)
  phone!: string;

  @ApiProperty({
    example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    description:
      "EventHub event UUID for the purchase. Stored on the referral record only. Promo generation uses admin-selected events."
  })
  @IsUUID()
  eventId!: string;
}
