import { Injectable } from "@nestjs/common";
import { db } from "../../db/client";

@Injectable()
export class DatabaseService {
  readonly db = db;
}
