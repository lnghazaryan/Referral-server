import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import type { UserRole } from "../auth.types";

export class CreateUserDto {
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

  @ApiProperty({ enum: ["Guest", "Admin"], example: "Guest", required: false })
  @IsOptional()
  @IsIn(["Guest", "Admin"])
  role?: UserRole;
}
