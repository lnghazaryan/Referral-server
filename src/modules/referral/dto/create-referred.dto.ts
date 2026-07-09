import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class CreateReferredDto {
  @ApiProperty({ example: "friend@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "A3B7CD" })
  @IsString()
  @MinLength(1)
  referralCode!: string;
}
