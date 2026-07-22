# Dynamics Project

Central question:
How does changing parameters or numerical methods affect the long-term behavior of a dynamical system?

This project starts with Lotka-Volterra and grows into a reusable simulation and analysis toolkit.

## 1) Goals

### Primary goals

- Build a modular simulation pipeline: model, integrator, engine, history, analysis, and visualization.
- Compare numerical integrators under identical conditions.
- Make parameter sweeps fast and interactive.
- Capture results as experiments, not just screenshots.

### Deliverables

- Lotka-Volterra model implementation.
- At least one working integrator (Euler, Improved Euler, or RK4).
- Time series and phase portrait plots.
- Interactive controls for model and solver parameters.
- Basic metrics: period, amplitude, numerical error, and runtime.

### Non-goals for first iteration

- Perfect physical realism.
- Exhaustive UI polish before core analysis works.
- Supporting many systems before one end-to-end workflow is stable.

## 2) Architecture

System flow:

Mathematical Model
-> Numerical Integrator
-> Simulation Engine
-> Recorded State History
-> Visualization and Analysis

Design rules:

- Keep model equations independent from integrator logic.
- Keep integrators swappable through one shared interface.
- Treat history as first-class data for plotting and metrics.

## 3) Development plan

## Phase 1: Select baseline system

Scope:

- Lotka-Volterra equations only.

Done when:

- Equations and parameters are defined in one clear module.

## Phase 2: Numerical engine

Build:

- State container.
- Single-step advance.
- History recording.

Implement:

- One baseline integrator first (recommended: RK4).
- Integrator interface so Euler and Improved Euler can be added later without engine rewrites.

Done when:

- A fixed number of steps runs deterministically and returns full history.

## Phase 3: Core visualization

Build:

- Time series view.
- Phase portrait view.

Done when:

- Both views update from the same simulation history source.

## Phase 4: Controls

Add sliders for:

- Growth rate.
- Predation rate.
- Reproduction rate.
- Time step.
- Initial populations.

Done when:

- Changing any slider triggers a rerun and both plots refresh correctly.

## Phase 5: Experiment prompts

Use prompts such as:

- Does increasing time step change apparent stability?
- Does RK4 behave differently than Euler?
- Which parameter has the strongest effect?
- Do nearby initial conditions diverge or remain close?

Done when:

- At least three prompts can be tested in a repeatable way.

## Phase 6: Measurement layer

Compute and report:

- Period.
- Amplitude.
- Energy-like quantity when meaningful.
- Convergence behavior.
- Numerical error estimate.
- Runtime.

Done when:

- Metrics can be compared across integrators and time steps.

## Phase 7: Lab notebook workflow

Each experiment should record:

- Date.
- Question.
- Parameters.
- Integrator and time step.
- Observations.
- Next question.

Done when:

- Results can be reproduced from notebook entries.

## Phase 8: Dashboard integration

Combine into one view:

- Parameter controls.
- Phase portrait.
- Time series.
- Statistics panel.

Done when:

- A single screen supports run, inspect, and compare.

## Phase 9: Extend to new systems

Add systems incrementally:

- Lorenz.
- Double pendulum.
- Duffing oscillator.
- Van der Pol oscillator.

Guiding principle:

What is the smallest addition that enables a more interesting question?

## 4) Progress tracking

Status legend:

- [ ] Not started
- [~] In progress
- [x] Completed

### Milestones

- [ ] M1: Lotka-Volterra model module
- [ ] M2: Integrator interface + first integrator
- [ ] M3: Simulation engine with history output
- [ ] M4: Time series plot
- [ ] M5: Phase portrait plot
- [ ] M6: Parameter controls wired to rerun
- [ ] M7: Experiment notebook template in use
- [ ] M8: Metrics panel (period, amplitude, error, runtime)
- [ ] M9: Integrator comparison workflow
- [ ] M10: First additional system integrated

### Current sprint

Focus:

- Stand up M1 through M3 with one reliable integrator.

Exit criteria:

- End-to-end run from parameters to stored history.
- Deterministic reruns with the same inputs.

## 5) Suggested experiment template

Use this per run:

- Date:
- Question:
- System:
- Integrator:
- Parameters:
- Time step:
- Duration / steps:
- Observations:
- Metrics:
- Next question:

## 6) Implementation note

Prioritize correctness and modularity before UI complexity. A clean model-integrator-engine boundary will make later comparisons and system extensions much faster.