import { Injectable } from "@nestjs/common";
import { ClientQueue } from "src/types/common.types";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class QueueService {
  private readonly queueInstance = {};
  private readonly clientQueue = {};

  addMessage(queue_name: string, payload: unknown) {
    if (!this.queueInstance[queue_name]) {
      this.queueInstance[queue_name] = [];
    }
    this.queueInstance[queue_name].push(payload);
    console.log(`===> DEBUG after push: ${JSON.stringify(this.queueInstance)}`);

    // Note Amir: here I release the response for the clients which wait for a response
    this.processPendingRequests(queue_name);
  }

  async getMessage(
    queue_name: string,
    timeout: number
  ): Promise<string | undefined> {
    return new Promise((res, _err) => {
      // happy scenario, the queue has some elements to return
      if (this.queueInstance[queue_name]?.length > 0) {
        const lastElement = this.queueInstance[queue_name].shift();
        console.log(
          `===> DEBUG after shift: ${JSON.stringify(this.queueInstance)}`
        );
        res(lastElement);
      } else {
        this.addClientRequest(queue_name, res, timeout);
      }
    });
  }

  private processPendingRequests(queue_name: string): void {
    // assign the new message to pending promise res if they match by queue name

    const clientQueueByMessage = this.clientQueue[queue_name];
    if (!clientQueueByMessage || clientQueueByMessage?.length === 0) {
      return;
    }
    const olderRequest = clientQueueByMessage.shift();
    const lastElement = this.queueInstance[queue_name].shift();

    olderRequest.resolve(lastElement);
  }

  private addClientRequest(
    queue_name: string,
    resolve: (value?: unknown) => void,
    timeout: number
  ): void {
    if (
      !this.clientQueue[queue_name] ||
      this.clientQueue[queue_name].length === 0
    ) {
      this.clientQueue[queue_name] = [];
    }
    this.clientQueue[queue_name].push({ resolve, timeout });

    console.log(`====> DEBUG candidate to sleep:  `);

    const ref = setInterval(() => {
      clearTimeout(ref);
    }, timeout);

    while (this.clientQueue[queue_name].length === 0 && ref) {

    }

    const lastElement = this.queueInstance[queue_name].shift();
    this.clientQueue[queue_name].resolve(lastElement);
  }
}
