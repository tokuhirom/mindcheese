import { Mind } from "./model/Mind";
import { EventType } from "./MindmapConstants";

export type EventCallback = (mind: Mind) => void;
export default class EventRouter {
  private readonly eventHandlersMap;
  constructor();
  addEventListener(eventType: EventType, callback: EventCallback): void;
  invokeEventHandler(type: EventType, mind: Mind): void;
}
