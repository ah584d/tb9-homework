export interface ClientQueue {
  id: string;
  timestamp: number;
  queue_name: string;
  resolve: (value?: unknown) => void;
}
