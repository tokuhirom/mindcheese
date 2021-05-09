import Mind from "../Mind";

export default interface MindmapImporter {
  getMind(source: any): Mind;
}
