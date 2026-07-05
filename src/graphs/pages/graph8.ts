import {
  commonGreekGods,
  commonGreekGodsGraph,
  type DeityCategory,
} from "../gods";
import { GraphLayout } from "../layout/GraphLayout";
import { GraphRenderer, GraphStyleConfig } from "../render/GraphRenderer";
import { black } from "../utils/colors";
import { Vector } from "../vector/Vector";

const { graph, deityByIndex, indexByDeityId, relationshipsByEdgeIndex } =
  commonGreekGodsGraph();

const categoryColor: Record<DeityCategory, string> = {
  primordial: "#2e3440",
  titan: "#b48ead",
  olympian: "#5e81ac",
  chthonic: "#bf616a",
  minor: "#a3be8c",
};

const EDGE_PARENT_COLOR = "#707c8a";
const EDGE_CONSORT_COLOR = "#d08770";
const VERTEX_RADIUS = 10;
const HOVER_RADIUS = 16;

const categoryBaseDepth: Record<DeityCategory, number> = {
  primordial: 0,
  titan: 1,
  olympian: 2,
  chthonic: 2,
  minor: 2,
};

const categoryBandIndex: Record<DeityCategory, number> = {
  primordial: 0,
  titan: 1,
  olympian: 2,
  chthonic: 3,
  minor: 4,
};

const BAND_SUBLEVEL_COUNT = 3;
type LayoutMode = "hierarchy" | "radial";

const buildHierarchicalRadialLayout = (): GraphLayout => {
  const parentRelationships = commonGreekGods.relationships.filter(
    (relationship) => relationship.type === "parent_of",
  );

  const allIndices = graph.vertices.map((vertex) => vertex.index);
  const childrenByParent = new Map<number, number[]>();
  const parentsByChild = new Map<number, number[]>();
  const inDegree = new Map<number, number>(allIndices.map((index) => [index, 0]));
  const topologicalDepthByIndex = new Map<number, number>(
    allIndices.map((index) => [index, 0]),
  );

  for (const relationship of parentRelationships) {
    const fromIndex = indexByDeityId.get(relationship.fromId);
    const toIndex = indexByDeityId.get(relationship.toId);

    if (fromIndex === undefined || toIndex === undefined) {
      continue;
    }

    const children = childrenByParent.get(fromIndex) ?? [];
    children.push(toIndex);
    childrenByParent.set(fromIndex, children);

    const parents = parentsByChild.get(toIndex) ?? [];
    parents.push(fromIndex);
    parentsByChild.set(toIndex, parents);

    inDegree.set(toIndex, (inDegree.get(toIndex) ?? 0) + 1);
  }

  const roots = allIndices
    .filter((index) => (inDegree.get(index) ?? 0) === 0)
    .sort((first, second) => {
      const firstName = deityByIndex.get(first)?.name ?? "";
      const secondName = deityByIndex.get(second)?.name ?? "";
      return firstName.localeCompare(secondName);
    });

  const remainingInDegree = new Map(inDegree);
  const queue = [...roots];
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined) {
      continue;
    }

    const currentDepth = topologicalDepthByIndex.get(current) ?? 0;
    const children = childrenByParent.get(current) ?? [];

    for (const child of children) {
      const nextDepth = currentDepth + 1;
      if (nextDepth > (topologicalDepthByIndex.get(child) ?? -1)) {
        topologicalDepthByIndex.set(child, nextDepth);
      }

      const nextInDegree = (remainingInDegree.get(child) ?? 0) - 1;
      remainingInDegree.set(child, nextInDegree);
      if (nextInDegree === 0) {
        queue.push(child);
      }
    }
  }

  const layers = new Map<number, number[]>();
  for (const index of allIndices) {
    const deity = deityByIndex.get(index);
    if (!deity) {
      continue;
    }

    const relativeDepth =
      (topologicalDepthByIndex.get(index) ?? categoryBaseDepth[deity.category]) -
      categoryBaseDepth[deity.category];
    const subLevel = Math.max(0, Math.min(BAND_SUBLEVEL_COUNT - 1, relativeDepth));
    const layerIndex = categoryBandIndex[deity.category] * BAND_SUBLEVEL_COUNT + subLevel;

    const layer = layers.get(layerIndex) ?? [];
    layer.push(index);
    layers.set(layerIndex, layer);
  }

  const nameFor = (index: number): string => deityByIndex.get(index)?.name ?? "";
  const maxLayerIndex = Math.max(...layers.keys(), 0);
  const layerByIndex = new Map<number, number>();
  for (const [layerIndex, layer] of layers.entries()) {
    for (const index of layer) {
      layerByIndex.set(index, layerIndex);
    }
  }

  for (const layer of layers.values()) {
    layer.sort((first, second) => nameFor(first).localeCompare(nameFor(second)));
  }

  const layerAngles = new Map<number, number>();

  const recomputeLayerAngles = (): void => {
    layerAngles.clear();
    for (const layer of layers.values()) {
      if (layer.length === 0) {
        continue;
      }

      const startAngle = -Math.PI / 2;
      for (let i = 0; i < layer.length; i++) {
        const angle =
          layer.length === 1
            ? startAngle
            : startAngle + (2 * Math.PI * i) / layer.length;
        layerAngles.set(layer[i], angle);
      }
    }
  };

  const sortLayerByParentBarycenter = (layerIndex: number): void => {
    const layer = layers.get(layerIndex);
    if (!layer || layer.length <= 1) {
      return;
    }

    const sortable = layer.map((index, fallback) => {
      const parents = (parentsByChild.get(index) ?? []).filter((parent) => {
        const parentLayer = layerByIndex.get(parent);
        return parentLayer !== undefined && parentLayer < layerIndex;
      });
      const barycenter =
        parents.length > 0
          ? parents.reduce((sum, parent) => sum + (layerAngles.get(parent) ?? 0), 0) /
            parents.length
          : Number.POSITIVE_INFINITY;

      return { index, barycenter, fallback };
    });

    sortable.sort((first, second) => {
      if (Number.isFinite(first.barycenter) && Number.isFinite(second.barycenter)) {
        return first.barycenter - second.barycenter;
      }
      if (Number.isFinite(first.barycenter)) {
        return -1;
      }
      if (Number.isFinite(second.barycenter)) {
        return 1;
      }
      const byFallback = first.fallback - second.fallback;
      if (byFallback !== 0) {
        return byFallback;
      }
      return nameFor(first.index).localeCompare(nameFor(second.index));
    });

    layers.set(
      layerIndex,
      sortable.map((entry) => entry.index),
    );
  };

  recomputeLayerAngles();
  for (let i = 0; i < 4; i++) {
    for (let layerIndex = 1; layerIndex <= maxLayerIndex; layerIndex++) {
      sortLayerByParentBarycenter(layerIndex);
    }
    recomputeLayerAngles();
  }

  const positions = new Map<number, Vector>();
  const innerRadius = 0.09;
  const outerRadius = 0.45;
  const maxBandIndex = Math.max(...Object.values(categoryBandIndex));
  const bandCount = maxBandIndex + 1;
  const bandGap = 0.02;
  const totalRadiusRange = outerRadius - innerRadius;
  const totalGap = bandGap * Math.max(0, bandCount - 1);
  const usableRadius = Math.max(0.01, totalRadiusRange - totalGap);
  const bandThickness = usableRadius / bandCount;
  const subStep = bandThickness / BAND_SUBLEVEL_COUNT;

  for (let layerIndex = 0; layerIndex <= maxLayerIndex; layerIndex++) {
    const layer = layers.get(layerIndex) ?? [];
    if (layer.length === 0) {
      continue;
    }

    const band = Math.floor(layerIndex / BAND_SUBLEVEL_COUNT);
    const subLevel = layerIndex % BAND_SUBLEVEL_COUNT;
    const bandBase = innerRadius + band * (bandThickness + bandGap);
    const radius = bandBase + (subLevel + 0.5) * subStep;
    const startAngle = -Math.PI / 2;
    for (let i = 0; i < layer.length; i++) {
      const angle =
        layer.length === 1
          ? startAngle
          : startAngle + (2 * Math.PI * i) / layer.length;
      positions.set(
        layer[i],
        new Vector(0.5 + radius * Math.cos(angle), 0.5 + radius * Math.sin(angle)),
      );
    }
  }

  return {
    vertexPosition: (vertexIndex: number) =>
      positions.get(vertexIndex) ?? new Vector(0.5, 0.5),
  };
};

const buildHierarchyLayout = (): GraphLayout => {
  const parentRelationships = commonGreekGods.relationships.filter(
    (relationship) => relationship.type === "parent_of",
  );

  const allIndices = graph.vertices.map((vertex) => vertex.index);
  const childrenByParent = new Map<number, number[]>();
  const parentsByChild = new Map<number, number[]>();
  const inDegree = new Map<number, number>(allIndices.map((index) => [index, 0]));
  const topologicalDepthByIndex = new Map<number, number>(
    allIndices.map((index) => [index, 0]),
  );

  for (const relationship of parentRelationships) {
    const fromIndex = indexByDeityId.get(relationship.fromId);
    const toIndex = indexByDeityId.get(relationship.toId);

    if (fromIndex === undefined || toIndex === undefined) {
      continue;
    }

    const children = childrenByParent.get(fromIndex) ?? [];
    children.push(toIndex);
    childrenByParent.set(fromIndex, children);

    const parents = parentsByChild.get(toIndex) ?? [];
    parents.push(fromIndex);
    parentsByChild.set(toIndex, parents);

    inDegree.set(toIndex, (inDegree.get(toIndex) ?? 0) + 1);
  }

  const roots = allIndices
    .filter((index) => (inDegree.get(index) ?? 0) === 0)
    .sort((first, second) => {
      const firstName = deityByIndex.get(first)?.name ?? "";
      const secondName = deityByIndex.get(second)?.name ?? "";
      return firstName.localeCompare(secondName);
    });

  const depthByIndex = new Map<number, number>();
  for (const index of allIndices) {
    const category = deityByIndex.get(index)?.category;
    depthByIndex.set(index, category ? categoryBaseDepth[category] : 2);
  }

  const remainingInDegree = new Map(inDegree);
  const queue = [...roots];
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined) {
      continue;
    }

    const currentDepth = depthByIndex.get(current) ?? 0;
    const children = childrenByParent.get(current) ?? [];
    const currentTopologicalDepth = topologicalDepthByIndex.get(current) ?? 0;

    for (const child of children) {
      const nextDepth = currentDepth + 1;
      if (nextDepth > (depthByIndex.get(child) ?? -1)) {
        depthByIndex.set(child, nextDepth);
      }

      const nextTopologicalDepth = currentTopologicalDepth + 1;
      if (nextTopologicalDepth > (topologicalDepthByIndex.get(child) ?? -1)) {
        topologicalDepthByIndex.set(child, nextTopologicalDepth);
      }

      const nextInDegree = (remainingInDegree.get(child) ?? 0) - 1;
      remainingInDegree.set(child, nextInDegree);
      if (nextInDegree === 0) {
        queue.push(child);
      }
    }
  }

  const categorySubDepth = new Map<DeityCategory, Map<number, number[]>>();
  for (const index of allIndices) {
    const deity = deityByIndex.get(index);
    if (!deity) {
      continue;
    }

    const relativeDepth =
      (topologicalDepthByIndex.get(index) ?? categoryBaseDepth[deity.category]) -
      categoryBaseDepth[deity.category];
    const subLevel = Math.max(0, Math.min(BAND_SUBLEVEL_COUNT - 1, relativeDepth));

    const bySubLevel =
      categorySubDepth.get(deity.category) ?? new Map<number, number[]>();
    const layer = bySubLevel.get(subLevel) ?? [];
    layer.push(index);
    bySubLevel.set(subLevel, layer);
    categorySubDepth.set(deity.category, bySubLevel);
  }

  const layers = new Map<number, number[]>();
  for (const [category, bySubLevel] of categorySubDepth.entries()) {
    const band = categoryBandIndex[category];
    for (const [subLevel, indices] of bySubLevel.entries()) {
      const depth = band * BAND_SUBLEVEL_COUNT + subLevel;
      const layer = layers.get(depth) ?? [];
      layer.push(...indices);
      layers.set(depth, layer);
    }
  }

  const nameFor = (index: number): string => deityByIndex.get(index)?.name ?? "";

  for (const layer of layers.values()) {
    layer.sort((first, second) => nameFor(first).localeCompare(nameFor(second)));
  }

  const maxDepth = Math.max(...layers.keys(), 0);
  const depthOrder = Array.from({ length: maxDepth + 1 }, (_, i) => i);

  const getLayerOrderMap = (depth: number): Map<number, number> => {
    const layer = layers.get(depth) ?? [];
    return new Map(layer.map((index, order) => [index, order]));
  };

  const sortLayerByNeighborBarycenter = (
    depth: number,
    getNeighbors: (index: number) => number[],
    neighborDepth: number,
  ): void => {
    const layer = layers.get(depth);
    if (!layer || layer.length <= 1) {
      return;
    }

    const neighborOrder = getLayerOrderMap(neighborDepth);
    const withBarycenter = layer.map((index, currentOrder) => {
      const neighbors = getNeighbors(index).filter((neighbor) =>
        neighborOrder.has(neighbor),
      );

      if (neighbors.length === 0) {
        return {
          index,
          barycenter: Number.POSITIVE_INFINITY,
          fallback: currentOrder,
        };
      }

      const total = neighbors.reduce((sum, neighbor) => {
        return sum + (neighborOrder.get(neighbor) ?? 0);
      }, 0);

      return {
        index,
        barycenter: total / neighbors.length,
        fallback: currentOrder,
      };
    });

    withBarycenter.sort((first, second) => {
      if (Number.isFinite(first.barycenter) && Number.isFinite(second.barycenter)) {
        return first.barycenter - second.barycenter;
      }
      if (Number.isFinite(first.barycenter)) {
        return -1;
      }
      if (Number.isFinite(second.barycenter)) {
        return 1;
      }
      const byFallback = first.fallback - second.fallback;
      if (byFallback !== 0) {
        return byFallback;
      }
      return nameFor(first.index).localeCompare(nameFor(second.index));
    });

    layers.set(
      depth,
      withBarycenter.map((entry) => entry.index),
    );
  };

  for (let i = 0; i < 4; i++) {
    for (let depth = 1; depth <= maxDepth; depth++) {
      sortLayerByNeighborBarycenter(
        depth,
        (index) => parentsByChild.get(index) ?? [],
        depth - 1,
      );
    }

    for (let depth = maxDepth - 1; depth >= 0; depth--) {
      sortLayerByNeighborBarycenter(
        depth,
        (index) => childrenByParent.get(index) ?? [],
        depth + 1,
      );
    }
  }

  const siblingGroupsForLayer = (depth: number): number[][] => {
    const layer = layers.get(depth) ?? [];
    if (layer.length === 0) {
      return [];
    }

    const groupByKey = new Map<string, number[]>();
    for (const index of layer) {
      const parents = [...(parentsByChild.get(index) ?? [])].sort((a, b) => a - b);
      const key =
        parents.length > 0 ? `parents:${parents.join("-")}` : `solo:${index}`;
      const group = groupByKey.get(key) ?? [];
      group.push(index);
      groupByKey.set(key, group);
    }

    const layerOrder = getLayerOrderMap(depth);
    const previousLayerOrder = depth > 0 ? getLayerOrderMap(depth - 1) : undefined;

    const groups = Array.from(groupByKey.values());
    groups.sort((firstGroup, secondGroup) => {
      const averageFrom = (values: number[]): number => {
        const total = values.reduce((sum, value) => sum + value, 0);
        return total / values.length;
      };

      const firstParentOrders = firstGroup
        .flatMap((index) => parentsByChild.get(index) ?? [])
        .map((parent) => previousLayerOrder?.get(parent))
        .filter((order): order is number => order !== undefined);
      const secondParentOrders = secondGroup
        .flatMap((index) => parentsByChild.get(index) ?? [])
        .map((parent) => previousLayerOrder?.get(parent))
        .filter((order): order is number => order !== undefined);

      if (firstParentOrders.length > 0 && secondParentOrders.length > 0) {
        return averageFrom(firstParentOrders) - averageFrom(secondParentOrders);
      }

      const firstLayerOrders = firstGroup
        .map((index) => layerOrder.get(index))
        .filter((order): order is number => order !== undefined);
      const secondLayerOrders = secondGroup
        .map((index) => layerOrder.get(index))
        .filter((order): order is number => order !== undefined);

      return averageFrom(firstLayerOrders) - averageFrom(secondLayerOrders);
    });

    for (const group of groups) {
      group.sort((first, second) => {
        const firstOrder = layerOrder.get(first) ?? 0;
        const secondOrder = layerOrder.get(second) ?? 0;
        if (firstOrder !== secondOrder) {
          return firstOrder - secondOrder;
        }
        return nameFor(first).localeCompare(nameFor(second));
      });
    }

    return groups;
  };

  const positions = new Map<number, Vector>();
  const groupGapSlots = 1.25;

  for (const depth of depthOrder) {
    const layerGroups = siblingGroupsForLayer(depth);
    const layer = layerGroups.flatMap((group) => group);
    const y = maxDepth === 0 ? 0.5 : depth / maxDepth;

    if (layer.length === 0) {
      continue;
    }

    const totalSlots =
      layer.length +
      Math.max(0, layerGroups.length - 1) * groupGapSlots;
    const denominator = totalSlots > 1 ? totalSlots - 1 : 1;
    let slotCursor = 0;

    for (let groupIndex = 0; groupIndex < layerGroups.length; groupIndex++) {
      const group = layerGroups[groupIndex];
      for (const index of group) {
        const normalized = denominator === 0 ? 0.5 : slotCursor / denominator;
        positions.set(index, new Vector(0.08 + normalized * 0.84, 0.08 + y * 0.84));
        slotCursor += 1;
      }

      if (groupIndex < layerGroups.length - 1) {
        slotCursor += groupGapSlots;
      }
    }
  }

  return {
    vertexPosition: (vertexIndex: number) =>
      positions.get(vertexIndex) ?? new Vector(0.5, 0.5),
  };
};

const hierarchyLayout = buildHierarchyLayout();
const radialLayout = buildHierarchicalRadialLayout();

let activeLayoutMode: LayoutMode = "hierarchy";
let activeBaseLayout: GraphLayout = hierarchyLayout;

const positionByIndex = new Map<number, Vector>();
const refreshPositionMap = (layout: GraphLayout): void => {
  positionByIndex.clear();
  for (const vertex of graph.vertices) {
    positionByIndex.set(vertex.index, layout.vertexPosition(vertex.index));
  }
};
refreshPositionMap(activeBaseLayout);

const interactiveLayout: GraphLayout = {
  vertexPosition: (vertexIndex: number) =>
    positionByIndex.get(vertexIndex) ?? new Vector(0.5, 0.5),
};

const relationshipByEdge = new Map(
  graph.edges.map((edge, index) => [edge, relationshipsByEdgeIndex.get(index)]),
);

const parentEdgeIndicesByParent = new Map<number, number[]>();
const parentEdgeIndicesByChild = new Map<number, number[]>();
for (let edgeIndex = 0; edgeIndex < graph.edges.length; edgeIndex++) {
  const relationship = relationshipsByEdgeIndex.get(edgeIndex);
  if (!relationship || relationship.type !== "parent_of") {
    continue;
  }

  const fromIndex = indexByDeityId.get(relationship.fromId);
  const toIndex = indexByDeityId.get(relationship.toId);
  if (fromIndex === undefined || toIndex === undefined) {
    continue;
  }

  const outgoing = parentEdgeIndicesByParent.get(fromIndex) ?? [];
  outgoing.push(edgeIndex);
  parentEdgeIndicesByParent.set(fromIndex, outgoing);

  const incoming = parentEdgeIndicesByChild.get(toIndex) ?? [];
  incoming.push(edgeIndex);
  parentEdgeIndicesByChild.set(toIndex, incoming);
}

let selectedVertexIndex: number | null = null;
let highlightedLineageEdgeIndices = new Set<number>();

const computeLineageEdgeIndices = (vertexIndex: number): Set<number> => {
  const highlighted = new Set<number>();

  const ancestorQueue = [vertexIndex];
  const seenAncestors = new Set<number>([vertexIndex]);
  while (ancestorQueue.length > 0) {
    const current = ancestorQueue.shift();
    if (current === undefined) {
      continue;
    }

    const incoming = parentEdgeIndicesByChild.get(current) ?? [];
    for (const edgeIndex of incoming) {
      highlighted.add(edgeIndex);
      const parentIndex = graph.edges[edgeIndex].startIndex;
      if (!seenAncestors.has(parentIndex)) {
        seenAncestors.add(parentIndex);
        ancestorQueue.push(parentIndex);
      }
    }
  }

  const descendantQueue = [vertexIndex];
  const seenDescendants = new Set<number>([vertexIndex]);
  while (descendantQueue.length > 0) {
    const current = descendantQueue.shift();
    if (current === undefined) {
      continue;
    }

    const outgoing = parentEdgeIndicesByParent.get(current) ?? [];
    for (const edgeIndex of outgoing) {
      highlighted.add(edgeIndex);
      const childIndex = graph.edges[edgeIndex].endIndex;
      if (!seenDescendants.has(childIndex)) {
        seenDescendants.add(childIndex);
        descendantQueue.push(childIndex);
      }
    }
  }

  return highlighted;
};

const graphStyles: Partial<GraphStyleConfig> = {
  vertexColor: (vertex) => {
    const deity = deityByIndex.get(vertex.index);
    if (!deity) {
      return categoryColor.minor;
    }
    return categoryColor[deity.category];
  },
  vertexSize: 10,
  vertexStroke: (vertex) =>
    vertex.index === selectedVertexIndex ? "#f5c400" : black,
  vertexStrokeWidth: (vertex) => (vertex.index === selectedVertexIndex ? 4 : 2),
  edgeColor: (edge) => {
    const edgeIndex = graph.edges.indexOf(edge);
    if (edgeIndex >= 0 && highlightedLineageEdgeIndices.has(edgeIndex)) {
      return "#f5c400";
    }

    return relationshipByEdge.get(edge)?.type === "consort_of"
      ? EDGE_CONSORT_COLOR
      : EDGE_PARENT_COLOR;
  },
  edgeWidth: (edge) => {
    const edgeIndex = graph.edges.indexOf(edge);
    if (edgeIndex >= 0 && highlightedLineageEdgeIndices.has(edgeIndex)) {
      return 3.5;
    }

    return relationshipByEdge.get(edge)?.type === "consort_of" ? 1.5 : 2;
  },
};

const renderer = new GraphRenderer(40, "canvas", graph, interactiveLayout, graphStyles);
renderer.render();

const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;

const tooltip = document.createElement("div");
tooltip.style.position = "fixed";
tooltip.style.pointerEvents = "none";
tooltip.style.background = "rgba(10, 12, 16, 0.95)";
tooltip.style.border = "1px solid rgba(255, 255, 255, 0.2)";
tooltip.style.borderRadius = "8px";
tooltip.style.color = "#f2f2f2";
tooltip.style.padding = "10px 12px";
tooltip.style.fontFamily = "Helvetica, sans-serif";
tooltip.style.fontSize = "13px";
tooltip.style.lineHeight = "1.35";
tooltip.style.maxWidth = "260px";
tooltip.style.zIndex = "20";
tooltip.style.display = "none";
document.body.appendChild(tooltip);

const setActiveLayout = (mode: LayoutMode): void => {
  activeLayoutMode = mode;
  activeBaseLayout = mode === "hierarchy" ? hierarchyLayout : radialLayout;
  refreshPositionMap(activeBaseLayout);
  renderer.setLayout(interactiveLayout);
  renderer.render();
};

const layoutModeInputs = document.querySelectorAll<HTMLInputElement>(
  'input[name="layout-mode"]',
);
for (const input of layoutModeInputs) {
  input.checked = input.value === activeLayoutMode;
  input.addEventListener("change", () => {
    if (!input.checked) {
      return;
    }
    if (input.value === "hierarchy" || input.value === "radial") {
      setActiveLayout(input.value);
    }
  });
}

const toCanvasPoint = (
  unitPosition: Vector,
  canvasWidth: number,
  canvasHeight: number,
  padding: number,
): Vector => {
  const drawableWidth = Math.max(0, canvasWidth - padding * 2);
  const drawableHeight = Math.max(0, canvasHeight - padding * 2);
  return new Vector(
    padding + unitPosition.x * drawableWidth,
    padding + unitPosition.y * drawableHeight,
  );
};

const fromCanvasPoint = (
  canvasX: number,
  canvasY: number,
  canvasWidth: number,
  canvasHeight: number,
  padding: number,
): Vector => {
  const drawableWidth = Math.max(1, canvasWidth - padding * 2);
  const drawableHeight = Math.max(1, canvasHeight - padding * 2);
  const x = (canvasX - padding) / drawableWidth;
  const y = (canvasY - padding) / drawableHeight;
  return new Vector(Math.min(1, Math.max(0, x)), Math.min(1, Math.max(0, y)));
};

const getNearestVertex = (
  mouseX: number,
  mouseY: number,
  canvasWidth: number,
  canvasHeight: number,
): number | null => {
  let nearestIndex: number | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const vertex of graph.vertices) {
    const unitPosition = positionByIndex.get(vertex.index);
    if (!unitPosition) {
      continue;
    }

    const canvasPosition = toCanvasPoint(unitPosition, canvasWidth, canvasHeight, 40);
    const distance = canvasPosition.distanceTo(new Vector(mouseX, mouseY));
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = vertex.index;
    }
  }

  const effectiveRadius = Math.max(HOVER_RADIUS, VERTEX_RADIUS + 4);
  if (nearestDistance > effectiveRadius) {
    return null;
  }

  return nearestIndex;
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatCategory = (category: DeityCategory): string =>
  category.charAt(0).toUpperCase() + category.slice(1);

if (canvas) {
  let draggingVertexIndex: number | null = null;
  let dragStartMouse: Vector | null = null;
  let skipNextClick = false;

  canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (draggingVertexIndex !== null) {
      const pointerUnitPosition = fromCanvasPoint(
        mouseX,
        mouseY,
        rect.width,
        rect.height,
        40,
      );
      positionByIndex.set(draggingVertexIndex, pointerUnitPosition);
      renderer.render();

      if (dragStartMouse) {
        const dragDistance = dragStartMouse.distanceTo(new Vector(mouseX, mouseY));
        if (dragDistance > 3) {
          skipNextClick = true;
        }
      }

      tooltip.style.display = "none";
      return;
    }

    const vertexIndex = getNearestVertex(mouseX, mouseY, rect.width, rect.height);
    if (vertexIndex === null) {
      tooltip.style.display = "none";
      return;
    }

    const deity = deityByIndex.get(vertexIndex);
    if (!deity) {
      tooltip.style.display = "none";
      return;
    }

    const parentCount = commonGreekGods.relationships.filter(
      (relationship) =>
        relationship.type === "parent_of" && relationship.toId === deity.id,
    ).length;
    const childCount = commonGreekGods.relationships.filter(
      (relationship) =>
        relationship.type === "parent_of" && relationship.fromId === deity.id,
    ).length;

    const aliases = deity.aliases?.length
      ? `<div><strong>Aliases:</strong> ${escapeHtml(deity.aliases.join(", "))}</div>`
      : "";

    tooltip.innerHTML = [
      `<div style="font-size:14px;font-weight:700;margin-bottom:4px;">${escapeHtml(deity.name)}</div>`,
      `<div><strong>Category:</strong> ${escapeHtml(formatCategory(deity.category))}</div>`,
      `<div><strong>Domains:</strong> ${escapeHtml(deity.domains.join(", "))}</div>`,
      aliases,
      `<div><strong>Parents in data:</strong> ${parentCount}</div>`,
      `<div><strong>Children in data:</strong> ${childCount}</div>`,
    ].join("");

    tooltip.style.display = "block";
    tooltip.style.left = `${event.clientX + 14}px`;
    tooltip.style.top = `${event.clientY + 14}px`;
  });

  canvas.addEventListener("mousedown", (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const vertexIndex = getNearestVertex(mouseX, mouseY, rect.width, rect.height);
    if (vertexIndex === null) {
      return;
    }

    draggingVertexIndex = vertexIndex;
    dragStartMouse = new Vector(mouseX, mouseY);
    canvas.style.cursor = "grabbing";
  });

  window.addEventListener("mouseup", () => {
    if (draggingVertexIndex !== null) {
      draggingVertexIndex = null;
      dragStartMouse = null;
      canvas.style.cursor = "default";
    }
  });

  canvas.addEventListener("mouseleave", () => {
    if (draggingVertexIndex === null) {
      tooltip.style.display = "none";
    }
  });

  canvas.addEventListener("click", (event) => {
    if (skipNextClick) {
      skipNextClick = false;
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const clickedVertexIndex = getNearestVertex(
      mouseX,
      mouseY,
      rect.width,
      rect.height,
    );

    if (clickedVertexIndex === null) {
      selectedVertexIndex = null;
      highlightedLineageEdgeIndices = new Set<number>();
      renderer.render();
      return;
    }

    selectedVertexIndex = clickedVertexIndex;
    highlightedLineageEdgeIndices = computeLineageEdgeIndices(clickedVertexIndex);
    renderer.render();
  });
}
