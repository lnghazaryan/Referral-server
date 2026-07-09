import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches, MaxLength, MinLength } from "class-validator";

export class SignUpDto {
  @ApiProperty({ example: "newuser" })
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  @Matches(/^[a-zA-Z0-9_]+$/)
  username!: string;

  @ApiProperty({ example: "11111111" })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
