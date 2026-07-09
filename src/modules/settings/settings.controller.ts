import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";
import { InternalApi } from "../../common/decorators/internal-api.decorator";
import { AuthGuard } from "../auth/auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { UpdateSettingsDto } from "./dto/update-settings.dto";
import type { AppSettings } from "./settings.defaults";
import { SettingsService } from "./settings.service";

@ApiExcludeController()
@Controller("admin/settings")
@UseGuards(AuthGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @InternalApi()
  @Get()
  getSettings() {
    return this.settingsService.getAll();
  }

  @InternalApi()
  @Roles("Admin")
  @Put()
  updateSettings(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.update(dto as Partial<AppSettings>);
  }
}
