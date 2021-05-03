import { NodeTree } from "./format/NodeTree";

export default class DataProvider {
  private format: Record<string, NodeTree>;
  private jm: any;

  constructor(jm: any) {
    this.jm = jm;
    this.format = {
      node_tree: new NodeTree(),
    };
  }

  init() {
    // TODO remove
    console.debug("data.init");
  }

  reset() {
    // TODO remove
    console.debug("data.reset");
  }

  load(mind_data: any) {
    return this.format.node_tree.get_mind(mind_data);
  }

  get_data(data_format: string) {
    if (data_format === "node_tree") {
      return this.format.node_tree.get_data(this.jm.mind);
    } else {
      throw new Error(`Unknown format: ${data_format}`);
    }
  }
}
