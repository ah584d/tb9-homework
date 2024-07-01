import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
} from "@nestjs/common";
import { QueueService } from "./queue.service";
import { Response } from "express";

const DEFAULT_TIMEOUT_MS = 5000;

@Controller("api")
export class QueueController {
  constructor(private queueService: QueueService) {}

  @Post(":queue_name")
  addMessage(
    @Param("queue_name", new ParseIntPipe()) queue_name: string,
    @Body() payload: unknown
  ): string {
    console.log(
      `POST This action returns: ${queue_name} - ${JSON.stringify(payload ?? {})}`
    );
    this.queueService.addMessage(queue_name, payload);
    return JSON.stringify({ status: `${queue_name} successfully queued` });
  }

  @Get(":queue_name")
  async getMessage(
    @Param("queue_name", new ParseIntPipe()) queue_name: string,
    @Query("timeout") timeout: number,
    @Res() response: Response
  ): Promise<unknown> {
    timeout = timeout || DEFAULT_TIMEOUT_MS;
    console.log(`GET This action returns: ${queue_name} - ${timeout}`);
    const result = await this.queueService.getMessage(queue_name, timeout);

    if (!result) {
      return response.sendStatus(204);
    } else {
      return response.send({
        result,
      });
    }
  }
}
