import Mind from "../Mind";

export default interface MindmapExporter {
  get_data(mind: Mind): any;
}
