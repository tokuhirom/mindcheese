import Mind from "../Mind";

export default interface MindmapExporter {
  getData(mind: Mind): any;
}
