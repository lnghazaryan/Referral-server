import { Controller, Get } from "@nestjs/common";
import {
  ApiExcludeController,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from "@nestjs/swagger";
import { healthSchema } from "../common/swagger/schemas";

@ApiTags("Health")
@ApiExcludeController()
@Controller("health")
export class HealthController {
  @ApiOperation({ summary: "Check API health" })
  @ApiOkResponse({ schema: healthSchema })
  @Get()
  getHealth(): { status: string } {
    return { status: "ok" };
  }
}
