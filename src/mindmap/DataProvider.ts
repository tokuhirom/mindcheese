import { NodeTree } from "./format/NodeTree";
import JsMind from "./JsMind";
import Mind from "./Mind";

export default class DataProvider {
  private format: Record<string, NodeTree>;
  private jm: JsMind;

  constructor(jm: JsMind) {
    this.jm = jm;
    this.format = {
      node_tree: new NodeTree(),
    };
  }

  load(mind_data: any, id: number): Mind {
    return this.format.node_tree.get_mind(mind_data, id);
  }

  get_data(data_format: string): Record<string, any> {
    if (data_format === "node_tree") {
      console.log(this.jm.mind);
      return this.format.node_tree.get_data(this.jm.mind);
    } else {
      throw new Error(`Unknown format: ${data_format}`);
    }
  }
}
