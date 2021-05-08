import { EventType } from "./MindmapConstants";

export default class EventRouter {
  private readonly event_handles_map: Record<
    EventType,
    ((data: any) => void)[]
  >;

  constructor() {
    this.event_handles_map = {
      "1": [],
      "2": [],
      "3": [],
      "4": [],
      "5": [],
    };
  }

  addEventListener(eventType: EventType, callback: (data: any) => void): void {
    this.event_handles_map[eventType].push(callback);
  }

  invokeEventHandler(type: EventType, data: any): void {
    const l = this.event_handles_map[type].length;
    for (let i = 0; i < l; i++) {
      this.event_handles_map[type][i](data);
    }
  }
}
