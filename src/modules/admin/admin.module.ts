import { Module } from "@nestjs/common";
import { ExternalModule } from "../external/external.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { AdminUiController } from "./admin-ui.controller";

@Module({
  imports: [ExternalModule],
  controllers: [AdminController, AdminUiController],
  providers: [AdminService]
})
export class AdminModule {}
