import { ApiProperty } from "@nestjs/swagger";
import { IsIn } from "class-validator";
import type { UserRole } from "../auth.types";

export class UpdateUserRoleDto {
  @ApiProperty({ enum: ["Guest", "Admin"], example: "Admin" })
  @IsIn(["Guest", "Admin"])
  role!: UserRole;
}
