import { applyDecorators } from "@nestjs/common";
import { ApiExcludeEndpoint } from "@nestjs/swagger";

export const InternalApi = () => applyDecorators(ApiExcludeEndpoint());
