import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  UseGuards
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from "@nestjs/swagger";
import { apiErrorSchema } from "../../common/swagger/schemas";
import { InternalApi } from "../../common/decorators/internal-api.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { AuthGuard } from "../auth/auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { ContentService } from "./content.service";
import { UpdateContentDto } from "./dto/update-content.dto";

@ApiTags("Content")
@Controller()
@UseGuards(AuthGuard, RolesGuard)
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @ApiOperation({
    summary: "Public landing content for a locale (defaults merged with CRM overrides)"
  })
  @ApiOkResponse({
    schema: { type: "object", additionalProperties: { type: "string" } }
  })
  @ApiBadRequestResponse({ schema: apiErrorSchema })
  @Public()
  @Get("public/content/:locale")
  getPublicContent(@Param("locale") locale: string) {
    return this.contentService.getPublicContent(locale);
  }

  @InternalApi()
  @Get("admin/content")
  listContent() {
    return this.contentService.getAllForAdmin();
  }

  @InternalApi()
  @Get("admin/content/:locale")
  getContent(@Param("locale") locale: string) {
    return this.contentService.getForAdmin(locale);
  }

  @InternalApi()
  @Roles("Admin")
  @Put("admin/content/:locale")
  updateContent(
    @Param("locale") locale: string,
    @Body() dto: UpdateContentDto
  ) {
    return this.contentService.upsert(locale, dto.content);
  }
}
