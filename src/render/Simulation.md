# Simulation + Animation Notes for Force-Directed Layouts

This is a pre-architecture design brief for a small but robust library.
The aim is to surface key decisions and define clear success criteria before implementation.

## 1) Goals and non-goals

### Goals (v1)

- Stable and predictable force-directed layouts for medium-sized graphs.
- Smooth animation in the browser with clear control over time stepping.
- Deterministic behavior when desired (same seed, same output).
- Simple embedding API for pages/components with room for advanced tuning.

### Performance targets (initial, adjustable after benchmarking)

- 60 FPS while animating graphs up to about 500 nodes / 1000 edges on baseline laptop hardware.
- 30+ FPS while animating graphs up to about 2000 nodes / 4000 edges with default forces.
- Drag interaction latency below 16 ms for typical graphs in the first target range.

### Non-goals (v1)

- A full physics engine.
- A full scene graph/rendering framework.
- Perfect scalability to huge graphs (for example 100k+ nodes).
- Every possible layout family in v1.

## 2) Core architecture framing questions

- Is simulation responsible only for positions, or also velocities/constraints/metadata?
- Is rendering fully decoupled from simulation (recommended), or partially integrated?
- Is the simulation engine pull-based (consumer asks for next state) or push-based (engine emits ticks)?
- Do we need both imperative API and declarative configuration API from day one?
- Do we optimize for readability-first or throughput-first as the primary default?

## 3) Success criteria before coding

Define measurable targets up front.

- Determinism: same graph + parameters + seed should produce equivalent final positions within epsilon.
- Stability: average kinetic energy should decay and stay below settle threshold for N consecutive ticks.
- Performance: maintain smooth interaction at target node/edge counts on baseline hardware.
- UX: drag interactions should feel responsive while preserving global layout coherence.
- API quality: small surface area, clear defaults, no hidden global state.

### Definition of done for v1

- Core forces and fixed-step simulation loop implemented.
- Settled-state detection with documented numeric threshold.
- Determinism mode verified by automated tests.
- Public API documented with at least one integration example.
- Benchmarks captured for target graph sizes.

## 4) Architecture design outline (high-level components)

- Graph state model: canonical in-memory representation of nodes, edges, and simulation attributes (position, velocity, mass, fixed state).
- Simulation engine: owns tick lifecycle, integration, force application, damping/cooling, and settled-state detection.
- Force subsystem: pluggable force interfaces plus built-in v1 forces (repulsion, link, center, optional collision).
- Scheduler and timing: fixed-step stepping policy, frame accumulator, and runtime controls for start/stop/pause/resume.
- Interaction controller: drag/fix/unfix flows, reheating policy, and safe runtime graph updates.
- Public API layer: small, stable surface for creation, configuration, lifecycle control, and state access.
- Observability and diagnostics: metrics/events for tick cost, alpha/energy, and debug hooks for profiling and troubleshooting.
- Validation and safety layer: input/config validation, runtime guards, and predictable failure behavior.
- Rendering integration boundary: explicit contract for how renderers consume positions and publish interaction intent.
- Optional worker adapter (v2): thread boundary abstraction for simulation offload without changing core API semantics.

## 5) API header (v1 draft)

This is the high-level public API surface aligned to the architecture components above.

### Key methods

- `createSimulation(graph, config)`: Create a simulation instance with validated graph/config input.
- `simulation.start()`: Start continuous ticking using the configured scheduler.
- `simulation.stop()`: Stop ticking and freeze simulation progression.
- `simulation.step(steps?)`: Advance by a deterministic number of fixed ticks.
- `simulation.on(event, handler)`: Subscribe to lifecycle/diagnostic events (`tick`, `settled`, `error`).
- `simulation.off(event, handler)`: Unsubscribe an event handler.
- `simulation.setForces(forceMap)`: Replace or update active force pipeline.
- `simulation.updateGraph(patch)`: Add/remove/update nodes and edges safely at runtime.
- `simulation.setNodeFixed(nodeId, fixed, position?)`: Toggle fixed state for interactions such as drag.
- `simulation.reheat(alpha?)`: Raise simulation energy for post-interaction reflow.
- `simulation.getState()`: Return the current simulation state view for rendering.
- `simulation.getMetrics()`: Return lightweight diagnostics (alpha, energy, tick duration).
- `simulation.dispose()`: Tear down internal resources and event subscriptions.

### Key types

- `SimulationConfig`: Top-level configuration (time step, damping, settle thresholds, determinism settings).
- `SimulationHandle`: Runtime control interface returned by `createSimulation`.
- `SimulationState`: Canonical node/edge state used by simulation and renderer integration.
- `SimulationNode`: Per-node simulation attributes (`id`, `x`, `y`, `vx`, `vy`, `mass`, `fixed`).
- `SimulationEdge`: Per-edge attributes (`source`, `target`, `length`, `stiffness`, `weight`).
- `Force`: Pluggable force contract applied each tick.
- `ForceContext`: Tick-scoped context passed to forces (state access, alpha, dt, scratch buffers).
- `TickEvent`: Emitted per tick with timing and state metadata.
- `SettledEvent`: Emitted when settle criteria are met.
- `SimulationMetrics`: Debug/perf counters (energy, max velocity, tick cost).
- `GraphPatch`: Runtime graph mutation payload for safe dynamic updates.

### Notes on API boundaries

- API layer owns lifecycle, configuration, and event contracts.
- Simulation engine owns state mutation and stepping semantics.
- Renderer consumes state snapshots/views but does not mutate core state directly.
- Interaction controller operations should route through API methods, not direct state writes.

## 6) Data model decisions

### Node/edge representation

- Internal storage: object arrays vs typed arrays (or hybrid).
- Required node attributes: `id`, `x`, `y`, `vx`, `vy`, `mass`, `fixed` flags.
- Optional node attributes: `radius`, cluster/group IDs, user data payload.
- Edge attributes: source/target references, spring length, stiffness, weight.

### Mutation model

- In-place mutation for performance vs immutable snapshots for debugging.
- If in-place, how do we expose read-only views to consumers?
- How do we support dynamic graph updates: add/remove nodes and edges during runtime?

## 7) Simulation loop decisions

### Time integration

- Integrator choice: explicit Euler, semi-implicit Euler, Verlet, RK2.
- Fixed time step (recommended for determinism) vs variable time step.
- Strategy for frame-rate drift: accumulator pattern with max substeps.

### Force pipeline

- Force ordering policy: does order matter and should it be documented?
- Built-in forces for v1: many-body/repulsion, link/spring, centering (or gravity-to-origin), collision avoidance, optional directional constraints.
- Plugin force interface for custom forces.

### Stability controls

- Damping / friction model.
- Temperature / alpha cooling schedule.
- Maximum velocity clamp to prevent blowups.
- Guard rails for NaN/Infinity state recovery.

## 8) Determinism and reproducibility

- Seeded pseudo-random generator abstraction (no direct `Math.random` in core).
- Deterministic iteration order over nodes/edges.
- Floating point caveats across browsers/devices.
- Snapshot format for replaying and debugging simulation runs.

## 9) Performance strategy

### Early performance questions

- Do we need Barnes-Hut or grid partitioning in v1, or can we defer?
- Is collision broad phase required immediately?
- What target graph sizes define "fast enough" for first release?

### Practical optimizations

- Minimize allocations inside tick loop.
- Reuse buffers for forces and intermediate vectors.
- Prefer numeric loops over callback-heavy iteration in hot paths.
- Isolate expensive optional features behind explicit flags.

## 10) Concurrency and thread model

- Should simulation run on main thread first, then optional Web Worker mode?
- If Worker mode exists: define state transfer format (structured clone vs transferable buffers), tick cadence/message protocol, and drag/fix interaction handling across the thread boundary.

## 11) API shape sketch

### Candidate top-level API

- `createSimulation(graph, config)`
- `simulation.step(n?)`
- `simulation.start()` / `simulation.stop()`
- `simulation.on("tick", handler)`
- `simulation.on("settled", handler)`
- `simulation.setForces(...)`
- `simulation.updateGraph(...)`
- `simulation.getState()`

### API questions

- Should `tick` events include full state or only dirty/changed data?
- Should animation clock be internal or externally driven by requestAnimationFrame?
- How should "fixed" nodes be represented and updated during drag?

## 12) Animation and interaction thinking

- Define ownership of animation timing clearly (renderer vs simulation).
- Handle pause/resume and tab throttling behavior explicitly.
- Drag interaction policy: decide whether to reheat on drag start, pin during drag, and cool down after release.
- Transition rules for entering/exiting settled state.

## 13) Error handling and robustness

- Runtime validation layer for config.
- Clear error messages for invalid graphs (missing nodes, self-loops if disallowed, etc).
- Defensive checks in development mode, stripped or reduced in production mode.
- What should happen if a force throws during a tick?

## 14) Testing plan before implementation

### Unit tests

- Force math correctness on simple known setups.
- Integrator correctness and damping behavior.
- Deterministic seeded runs.

### Property/invariant tests

- No NaN/Infinity positions or velocities.
- Fixed nodes remain fixed.
- Energy trends decrease under damping.

### Visual/regression tests

- Snapshot layouts at fixed tick counts for reference graphs.
- Optional pixel tests for renderer integration pages.

## 15) Observability and debug tooling

- Debug metrics per tick: alpha, total energy, max velocity, frame cost.
- Optional dev overlay for force vectors and bounding volumes.
- Event hooks for custom logging and profiling.

## 16) Versioning and extensibility

- Define stable core interfaces early (`Force`, `Integrator`, `SimulationState`).
- Keep internals private so optimizations do not break public contracts.
- Start with semver discipline from first public version.

## 17) Practical v1 scope proposal

Keep v1 intentionally small:

- Main-thread simulation.
- Fixed-step semi-implicit Euler.
- Repulsion + link + center + optional collision.
- Seeded determinism mode.
- Minimal evented API.
- Integration in existing graph pages.

Defer to v2:

- Worker mode.
- Advanced constraints.
- Spatial acceleration structures if benchmarks demand them.
- Rich plugin ecosystem.

## 18) Open questions to answer now

- What graph sizes do we need to support comfortably in this project?
- Is deterministic replay a hard requirement or a nice-to-have?
- Should renderer consume mutable references or snapshots?
- Which existing library ergonomics do we want to mirror or avoid?
- How much of configuration should be runtime-tunable vs fixed at creation?
- What does "settled" mean numerically for our use cases?

### Decisions to lock before coding starts

- Internal data model choice: object arrays, typed arrays, or hybrid.
- Time stepping model: fixed step only vs fixed step + variable render interpolation.
- Event model: push (`on("tick")`) only vs also pull (`step()` and state reads).
- State ownership boundary between simulation and renderer.

## 19) Suggested implementation sequence

1. Define simulation state types and seeded RNG abstraction.
2. Implement tick loop with fixed-step integrator and damping.
3. Add repulsion and link forces.
4. Add center force and optional collision.
5. Add event hooks and settled-state detection.
6. Add drag/fixed-node interaction hooks.
7. Write deterministic and invariant tests.
8. Benchmark on representative graphs and tune defaults.

## 20) Risks worth watching early

- API drift from adding too many configuration options too soon.
- Non-determinism introduced by iteration order or browser timing.
- Over-coupling simulation and renderer, making testing harder.
- Performance regressions caused by allocations in hot loops.
- Fragile behavior on dynamic graph updates if invariants are unclear.
