// noinspection JSUnusedGlobalSymbols

export const enum Direction {
  LEFT = -1,
  CENTER = 0,
  RIGHT = 1,
}

export const enum EventType {
  Show = 1,
  Resize = 2,
  AfterEdit = 3,
  Select = 4,
  BeforeEdit = 5,
}

export const BEFOREID_FIRST = "_first_";
export const BEFOREID_LAST = "_last_";

export const enum KeyModifier {
  NONE = 0,
  META = 1 << 1,
  CTRL = 1 << 2,
  ALT = 1 << 3,
  SHIFT = 1 << 4,
}

export const KEYCODE_ENTER = 13;
