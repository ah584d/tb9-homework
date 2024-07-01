import { Injectable } from "@nestjs/common";
import { ClientQueue } from "src/types/common.types";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class QueueService {
  private readonly queueInstance = {};
  private readonly clientQueue: ClientQueue[] = [];

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
        this.addClientRequest(queue_name, res);
        setTimeout(() => {
          this.resolveTimeout(queue_name, res);
        }, timeout);
      }
    });
  }

  private processPendingRequests(queue_name: string): void {
    while (
      this.queueInstance[queue_name]?.length > 0 &&
      this.clientQueue[queue_name]?.length > 0
    ) {
      const nextRequest = this.clientQueue[queue_name].shift();
      const lastElement = this.queueInstance[queue_name].shift();
      if (nextRequest) {
        nextRequest.resolve(lastElement);
        console.log(
          `===> DEBUG after resolving: ${JSON.stringify(this.queueInstance)}`
        );
      }
    }
  }

  private addClientRequest(
    queue_name: string,
    resolve: (value?: unknown) => void
  ): void {
    const timestamp = Date.now();
    const id = uuidv4();
    if (!this.clientQueue[queue_name]) {
      this.clientQueue[queue_name] = [];
    }
    this.clientQueue[queue_name].push({ id, timestamp, resolve });
    this.clientQueue[queue_name].sort(
      (a: ClientQueue, b: ClientQueue) => b.timestamp - a.timestamp
    );
    console.log(`===> DEBUG clientQueue: ${JSON.stringify(this.clientQueue)}`);
  }

  private resolveTimeout(
    queue_name: string,
    resolve: (value?: unknown) => void
  ): void {
    const index = this.clientQueue[queue_name]?.findIndex(
      (request: PromiseConstructor) => request.resolve === resolve
    );
    if (index !== undefined && index >= 0) {
      this.clientQueue[queue_name].splice(index, 1);
      resolve(undefined);
    }
  }
}
