import { Edge } from "../graph/Edge";
import { Graph } from "../graph/Graph";
import { Vertex } from "../graph/Vertex";
import { commonGreekGods } from "./commonGreekGods";
import type {
  DeityDataset,
  DeityNode,
  DeityRelationship,
  RelationshipType,
} from "./types";

export interface DeityGraphConversionOptions {
  includeRelationshipTypes?: RelationshipType[];
  includeConsorts?: boolean;
}

export interface DeityGraphConversionResult {
  graph: Graph;
  indexByDeityId: Map<string, number>;
  deityByIndex: Map<number, DeityNode>;
  relationshipsByEdgeIndex: Map<number, DeityRelationship>;
}

const shouldIncludeRelationship = (
  relationship: DeityRelationship,
  options: DeityGraphConversionOptions,
): boolean => {
  if (
    options.includeRelationshipTypes &&
    !options.includeRelationshipTypes.includes(relationship.type)
  ) {
    return false;
  }

  if (options.includeConsorts === false && relationship.type === "consort_of") {
    return false;
  }

  return true;
};

export const deityDatasetToGraph = (
  dataset: DeityDataset,
  options: DeityGraphConversionOptions = {},
): DeityGraphConversionResult => {
  const indexByDeityId = new Map<string, number>();
  const deityByIndex = new Map<number, DeityNode>();
  const vertices = dataset.nodes.map((node, index) => {
    indexByDeityId.set(node.id, index);
    deityByIndex.set(index, node);
    return new Vertex(index);
  });

  const edges: Edge[] = [];
  const relationshipsByEdgeIndex = new Map<number, DeityRelationship>();

  for (const relationship of dataset.relationships) {
    if (!shouldIncludeRelationship(relationship, options)) {
      continue;
    }

    const startIndex = indexByDeityId.get(relationship.fromId);
    const endIndex = indexByDeityId.get(relationship.toId);

    if (startIndex === undefined || endIndex === undefined) {
      continue;
    }

    edges.push(new Edge(startIndex, endIndex));
    relationshipsByEdgeIndex.set(edges.length - 1, relationship);
  }

  return {
    graph: new Graph(vertices, edges),
    indexByDeityId,
    deityByIndex,
    relationshipsByEdgeIndex,
  };
};

export const commonGreekGodsGraph = (
  options: DeityGraphConversionOptions = {},
): DeityGraphConversionResult => deityDatasetToGraph(commonGreekGods, options);
