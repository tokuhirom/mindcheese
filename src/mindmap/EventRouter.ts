import { EventType } from "./MindmapConstants";
import { Mind } from "./model/Mind";

export type EventCallback = (mind: Mind) => void;

export default class EventRouter {
  private readonly eventHandlersMap: Record<EventType, ((data: any) => void)[]>;

  constructor() {
    this.eventHandlersMap = { "1": [] };
  }

  addEventListener(eventType: EventType, callback: EventCallback): void {
    this.eventHandlersMap[eventType].push(callback);
  }

  invokeEventHandler(type: EventType, mind: Mind): void {
    const l = this.eventHandlersMap[type].length;
    for (let i = 0; i < l; i++) {
      this.eventHandlersMap[type][i](mind);
    }
  }
}
