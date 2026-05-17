This folder defines the abstract graph domain model.

Graph.ts contains the core graph container, with vertices and edges represented by Vertex.ts and Edge.ts.

The types in this folder describe graph structure and connectivity, not rendering, styling, layout, or algorithms.

Graph generation, graph analysis, and layout construction live outside this folder so the model can remain reusable across different algorithms and visualizations.

This folder should stay limited to the core graph abstractions: graph, vertex, and edge.