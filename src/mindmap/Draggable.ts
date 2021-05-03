/*
 * Released under BSD License
 * Copyright (c) 2014-2015 hizzgdev@163.com
 *
 * Project Home:
 *   https://github.com/hizzgdev/jsmind/
 */

/**
 * Modified by tokuhirom.
 * - support npm.
 * - replace var with let/const.
 * Copyright (C) 2021 Tokuhiro Matsuno.
 */

"use strict";

import JsMind from "./JsMind";
import Node from "./Node";
import { Direction} from "./MindmapConstants";

const options = {
  line_width: 5,
  lookup_delay: 500,
  lookup_interval: 80,
};

export default class Draggable {
  private jm: JsMind;
  private e_canvas: HTMLCanvasElement;
  private canvas_ctx: CanvasRenderingContext2D;
  private shadow: HTMLElement;
  private shadow_w: number;
  private shadow_h: number;
  private active_node: Node;
  private target_node: Node;
  private target_direct: Direction;
  private client_w: number;
  private client_h: number;
  private offset_x: number;
  private offset_y: number;
  private hlookup_delay: number;
  private hlookup_timer: number;
  private capture: boolean;
  private moved: boolean;
  private client_hw: number;
  private client_hh: number;
  constructor(jm: JsMind) {
    this.jm = jm;
    this.e_canvas = null;
    this.canvas_ctx = null;
    this.shadow = null;
    this.shadow_w = 0;
    this.shadow_h = 0;
    this.active_node = null;
    this.target_node = null;
    this.target_direct = null;
    this.client_w = 0;
    this.client_h = 0;
    this.offset_x = 0;
    this.offset_y = 0;
    this.hlookup_delay = 0;
    this.hlookup_timer = 0;
    this.capture = false;
    this.moved = false;
  }

  init(): void {
    this._create_canvas();
    this._create_shadow();
    this._event_bind();
  }

  resize(): void {
    this.jm.view.e_nodes.appendChild(this.shadow);
    this.e_canvas.width = this.jm.view.size.w;
    this.e_canvas.height = this.jm.view.size.h;
  }

  _create_canvas(): void {
    const c: HTMLCanvasElement = document.createElement("canvas");
    this.jm.view.e_panel.appendChild(c);
    const ctx: CanvasRenderingContext2D = c.getContext("2d");
    this.e_canvas = c;
    this.canvas_ctx = ctx;
  }

  _create_shadow(): void {
    const s: HTMLElement = document.createElement("jmnode");
    s.style.visibility = "hidden";
    s.style.zIndex = "3";
    s.style.cursor = "move";
    s.style.opacity = "0.7";
    this.shadow = s;
  }

  reset_shadow(el: HTMLElement): void {
    const s = this.shadow.style;
    this.shadow.innerHTML = el.innerHTML;
    s.left = el.style.left;
    s.top = el.style.top;
    s.width = el.style.width;
    s.height = el.style.height;
    s.backgroundImage = el.style.backgroundImage;
    s.backgroundSize = el.style.backgroundSize;
    s.transform = el.style.transform;
    this.shadow_w = this.shadow.clientWidth;
    this.shadow_h = this.shadow.clientHeight;
  }

  show_shadow(): void {
    if (!this.moved) {
      this.shadow.style.visibility = "visible";
    }
  }

  hide_shadow(): void {
    this.shadow.style.visibility = "hidden";
  }

  _magnet_shadow(node: { node: any; np: any; sp: any; direction: number }): void {
    if (node) {
      this.canvas_ctx.lineWidth = options.line_width;
      this.canvas_ctx.strokeStyle = "rgba(0,0,0,0.3)";
      this.canvas_ctx.lineCap = "round";
      this._clear_lines();
      this._canvas_lineto(node.sp.x, node.sp.y, node.np.x, node.np.y);
    }
  }

  _clear_lines(): void {
    this.canvas_ctx.clearRect(0, 0, this.jm.view.size.w, this.jm.view.size.h);
  }

  _canvas_lineto(x1: number, y1: number, x2: number, y2: number): void {
    this.canvas_ctx.beginPath();
    this.canvas_ctx.moveTo(x1, y1);
    this.canvas_ctx.lineTo(x2, y2);
    this.canvas_ctx.stroke();
  }

  _lookup_close_node(): { node: Node; np: any; sp: any; direction: Direction } {
    const root = this.jm.get_root();
    const root_location = root.get_location();
    const root_size = root.get_size();
    const root_x = root_location.x + root_size.w / 2;

    const sw = this.shadow_w;
    const sh = this.shadow_h;
    const sx = this.shadow.offsetLeft;
    const sy = this.shadow.offsetTop;

    let ns, nl;

    const direct = sx + sw / 2 >= root_x ? Direction.RIGHT : Direction.LEFT;
    const nodes = this.jm.mind.nodes;
    let node = null;
    let min_distance = Number.MAX_VALUE;
    let distance = 0;
    let closest_node = null;
    let closest_p = null;
    let shadow_p = null;
    for (const nodeid in nodes) {
      let np, sp;
      node = nodes[nodeid];
      if (node.isroot || node.direction == direct) {
        if (node.id == this.active_node.id) {
          continue;
        }
        ns = node.get_size();
        nl = node.get_location();
        if (direct == Direction.RIGHT) {
          if (sx - nl.x - ns.w <= 0) {
            continue;
          }
          distance =
            Math.abs(sx - nl.x - ns.w) +
            Math.abs(sy + sh / 2 - nl.y - ns.h / 2);
          np = { x: nl.x + ns.w - options.line_width, y: nl.y + ns.h / 2 };
          sp = { x: sx + options.line_width, y: sy + sh / 2 };
        } else {
          if (nl.x - sx - sw <= 0) {
            continue;
          }
          distance =
            Math.abs(sx + sw - nl.x) + Math.abs(sy + sh / 2 - nl.y - ns.h / 2);
          np = { x: nl.x + options.line_width, y: nl.y + ns.h / 2 };
          sp = { x: sx + sw - options.line_width, y: sy + sh / 2 };
        }
        if (distance < min_distance) {
          closest_node = node;
          closest_p = np;
          shadow_p = sp;
          min_distance = distance;
        }
      }
    }
    if (closest_node) {
      return {
        node: closest_node,
        direction: direct,
        sp: shadow_p,
        np: closest_p,
      };
    } else {
      return null;
    }
  }

  lookup_close_node(): void {
    const node_data: {
      node: Node;
      np: any;
      sp: any;
      direction: Direction;
    } = this._lookup_close_node();
    if (node_data) {
      this._magnet_shadow(node_data);
      this.target_node = node_data.node;
      this.target_direct = node_data.direction;
    }
  }

  _event_bind(): void {
    // TODO bind に置換可能っぽい
    const jd = this;
    const container = this.jm.view.container;
    container.addEventListener(
      "mousedown",
      function (e: Event) {
        jd.dragstart.call(jd, e);
      },
      false
    );
    container.addEventListener(
      "mousemove",
      function (e: Event) {
        jd.drag.call(jd, e);
      },
      false
    );
    container.addEventListener(
      "mouseup",
      function (e: Event) {
        jd.dragend.call(jd, e);
      },
      false
    );
    container.addEventListener(
      "touchstart",
      function (e: Event) {
        jd.dragstart.call(jd, e);
      },
      false
    );
    container.addEventListener(
      "touchmove",
      function (e: Event) {
        jd.drag.call(jd, e);
      },
      false
    );
    container.addEventListener(
      "touchend",
      function (e: Event) {
        jd.dragend.call(jd, e);
      },
      false
    );
  }

  dragstart(e: DragEvent): void {
    if (!this.jm.get_editable()) {
      return;
    }
    if (this.capture) {
      return;
    }
    this.active_node = null;

    const jview = this.jm.view;
    const el = e.target as HTMLElement;
    if (el.tagName.toLowerCase() !== "jmnode") {
      return;
    }
    const nodeid = jview.get_binded_nodeid(el);
    if (nodeid) {
      const node = this.jm.get_node(nodeid);
      if (!node.isroot) {
        this.reset_shadow(el);
        this.active_node = node;
        this.offset_x = e.clientX - el.offsetLeft;
        this.offset_y = e.clientY - el.offsetTop;
        // this.offset_x = (e.clientX || e.touches[0].clientX) - el.offsetLeft;
        // this.offset_y = (e.clientY || e.touches[0].clientY) - el.offsetTop;
        this.client_hw = Math.floor(el.clientWidth / 2);
        this.client_hh = Math.floor(el.clientHeight / 2);
        if (this.hlookup_delay !== 0) {
          window.clearTimeout(this.hlookup_delay);
        }
        if (this.hlookup_timer !== 0) {
          window.clearInterval(this.hlookup_timer);
        }
        const jd = this;
        this.hlookup_delay = window.setTimeout(function () {
          jd.hlookup_delay = 0;
          jd.hlookup_timer = window.setInterval(function () {
            jd.lookup_close_node.call(jd);
          }, options.lookup_interval);
        }, options.lookup_delay);
        this.capture = true;
      }
    }
  }

  drag(e: DragEvent): void {
    if (!this.jm.get_editable()) {
      return;
    }
    if (this.capture) {
      e.preventDefault();
      this.show_shadow();
      this.moved = true;
      window.getSelection().removeAllRanges();
      const px = e.clientX - this.offset_x;
      const py = e.clientY - this.offset_y;
      // const px = (e.clientX || e.touches[0].clientX) - this.offset_x;
      // const py = (e.clientY || e.touches[0].clientY) - this.offset_y;
      const cx = px + this.client_hw;
      const cy = py + this.client_hh;
      this.shadow.style.left = px + "px";
      this.shadow.style.top = py + "px";
      window.getSelection().removeAllRanges();
    }
  }

  dragend(e: Event): void {
    if (!this.jm.get_editable()) {
      return;
    }
    if (this.capture) {
      if (this.hlookup_delay !== 0) {
        window.clearTimeout(this.hlookup_delay);
        this.hlookup_delay = 0;
        this._clear_lines();
      }
      if (this.hlookup_timer !== 0) {
        window.clearInterval(this.hlookup_timer);
        this.hlookup_timer = 0;
        this._clear_lines();
      }
      if (this.moved) {
        const src_node = this.active_node;
        const target_node = this.target_node;
        const target_direct = this.target_direct;
        this.move_node(src_node, target_node, target_direct);
      }
      this.hide_shadow();
    }
    this.moved = false;
    this.capture = false;
  }

  move_node(src_node: Node, target_node: Node, target_direct: any): void {
    console.log(
      `jsMind.dgraggable.move_node: ${src_node} ${target_node} ${target_direct}`
    );
    const shadow_h = this.shadow.offsetTop;
    if (!!target_node && !!src_node && !Node.inherited(src_node, target_node)) {
      console.log(`let's move!`);
      // lookup before_node
      const sibling_nodes = target_node.children;
      let sc = sibling_nodes.length;
      let node = null;
      let delta_y = Number.MAX_VALUE;
      let node_before = null;
      let beforeid = "_last_";
      while (sc--) {
        node = sibling_nodes[sc];
        if (node.direction === target_direct && node.id !== src_node.id) {
          const dy = node.get_location().y - shadow_h;
          if (dy > 0 && dy < delta_y) {
            delta_y = dy;
            node_before = node;
            beforeid = "_first_";
          }
        }
      }
      if (node_before) {
        beforeid = node_before.id;
      }
      console.log(
        `Calling jm.move_node: ${src_node.id}, ${beforeid}, ${target_node.id}, ${target_direct}`
      );
      this.jm.move_node(src_node.id, beforeid, target_node.id, target_direct);
      // this.jm.move_node(src_node.id, beforeid, target_node.id, target_direct);
    }
    this.active_node = null;
    this.target_node = null;
    this.target_direct = null;
  }
}
