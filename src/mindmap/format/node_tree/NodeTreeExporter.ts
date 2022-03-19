import Mind from "../../Mind";

export default class NodeTreeExporter {
  getData(mind: Mind): Record<string, any> {
    const json: Record<string, any> = {};
    json.format = "node_tree";
    json.data = mind.root.toObject();
    return json;
  }
}
