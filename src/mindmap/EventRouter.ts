import { EventType } from "./MindmapConstants";

export default class EventRouter {
  private readonly eventHandlersMap: Record<EventType, ((data: any) => void)[]>;

  constructor() {
    this.eventHandlersMap = {
      "2": [],
      "5": [],
    };
  }

  addEventListener(eventType: EventType, callback: (data: any) => void): void {
    this.eventHandlersMap[eventType].push(callback);
  }

  invokeEventHandler(type: EventType, data: any): void {
    const l = this.eventHandlersMap[type].length;
    for (let i = 0; i < l; i++) {
      this.eventHandlersMap[type][i](data);
    }
  }
}
