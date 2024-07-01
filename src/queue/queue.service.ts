import { Injectable } from "@nestjs/common";
import { ClientQueue } from "src/types/common.types";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class QueueService {
  private readonly queueInstance = {};
  private readonly clientQueue: ClientQueue[] = [];
  private intervalRefs = {};

  addMessage(queue_name: string, payload: unknown) {
    if (!this.queueInstance[queue_name]) {
      this.queueInstance[queue_name] = [];
    }
    this.queueInstance[queue_name].push(payload);
    console.log(`===> DEBUG after push: ${JSON.stringify(this.queueInstance)}`);
  }

  async getMessage(
    queue_name: string,
    timeout: number
  ): Promise<string | undefined> {
    return new Promise((res, _err) => {
      if (this.queueInstance[queue_name]?.length > 0) {
        const lastElement = this.queueInstance[queue_name].shift();
        console.log(
          `===> DEBUG after shift: ${JSON.stringify(this.queueInstance)}`
        );
        res(lastElement);
      } else {
        addClientRequest(queue_name);
        setInterval(() => {
          if (!this.queueInstance[queue_name]) {
            return;
          } else {
            const lastElement = this.queueInstance[queue_name].shift();
            res(lastElement);
          }
        }, 1000);
      }
    });
  }
}

function addClientRequest(queue_name: string): void {
  const timestamp = Date.now();
  const id = uuidv4();
  this.clientQueue.push({ id, timestamp, queue_name });
  this.clientQueue.sort(
    (a: ClientQueue, b: ClientQueue) => b.timestamp - a.timestamp
  );
}
