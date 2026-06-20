export type DeityCategory =
  | "primordial"
  | "titan"
  | "olympian"
  | "chthonic"
  | "minor";

export interface DeityNode {
  id: string;
  name: string;
  category: DeityCategory;
  domains: string[];
  aliases?: string[];
}

export type RelationshipType = "parent_of" | "consort_of";

export interface DeityRelationship {
  fromId: string;
  toId: string;
  type: RelationshipType;
  source: string;
}

export interface DeityDataset {
  nodes: DeityNode[];
  relationships: DeityRelationship[];
}
