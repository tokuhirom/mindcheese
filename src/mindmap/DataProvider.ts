import Mind from "./Mind";
import MindmapExporter from "./format/MindmapExporter";
import MindmapImporter from "./format/MindmapImporter";
import NodeTreeImporter from "./format/node_tree/NodeTreeImporter";
import NodeTreeExporter from "./format/node_tree/NodeTreeExporter";
import MarkdownImporter from "./format/markdown/MarkdownImporter";
import MarkdownExporter from "./format/markdown/MarkdownExporter";

class DataFormat {
  private readonly importer: MindmapImporter;
  private readonly exporter: MindmapExporter;

  constructor(importer: MindmapImporter, exporter: MindmapExporter) {
    this.importer = importer;
    this.exporter = exporter;
  }
  getData(mind: Mind): any {
    return this.exporter.getData(mind);
  }
  getMind(source: any): Mind {
    return this.importer.getMind(source);
  }
}

export default class DataProvider {
  private readonly formatMap: Record<string, DataFormat>;

  constructor() {
    this.formatMap = {
      nodeTree: new DataFormat(new NodeTreeImporter(), new NodeTreeExporter()),
      markdown: new DataFormat(new MarkdownImporter(), new MarkdownExporter()),
    };
  }

  load(format: string, mindData: any): Mind {
    const dataFormat = this.formatMap[format];
    return dataFormat.getMind(mindData);
  }

  getData(format: string, mind: Mind): any {
    const dataFormat = this.formatMap[format];
    if (dataFormat) {
      return dataFormat.getData(mind);
    } else {
      throw new Error(`Unknown format: ${dataFormat}`);
    }
  }
}
