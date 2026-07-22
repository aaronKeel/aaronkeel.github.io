# Step One: Start Small

The first goal is a thin end-to-end slice: one system, one integrator, one history output.

## Scope

- System: Lotka-Volterra only.
- Integrator: choose one baseline method, preferably RK4.
- Output: simulation history that can be plotted later.
- Success check: the same inputs always produce the same trajectory.

## Initial steps

1. Define the shared types.
- State: prey and predator populations.
- Parameters: growth rate, predation rate, reproduction rate.
- Simulation config: time step, step count, initial state.
- History point: time plus a state snapshot.

2. Implement the model derivative function.
- Keep it pure and model-specific.
- It should accept state and parameters, then return the derivatives.

3. Implement one integrator step.
- Start with RK4 if you want a stable baseline.
- Keep the integrator model-agnostic so it can be reused later.

4. Build the simulation runner.
- Advance the state for N steps.
- Record every step into history.
- Return the full history as the main result.

5. Add a quick validation check.
- Run one known scenario with a small time step.
- Log the first and last few samples.
- Confirm the result looks stable before adding visualization.

6. Wire the first chart.
- Start with a time series.
- Add a phase portrait after the simulation path is working.
- Both charts should use the same history output.

## Done when

- One Lotka-Volterra simulation runs end to end.
- The engine and integrator are separate from the model equations.
- The output is ready for visualization and later comparison between integrators.
