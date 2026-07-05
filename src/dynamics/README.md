# Dynamics

> How does changing a parameter affect the long-term behavior of a dynamical system?

## Phase 1: Choose one system

* Lotka–Volterra equations

## Phase 2: Build the numerical engine

Write code that

* stores the current state
* advances one timestep
* records the history

Implement one numerical integrator, such as:

* Euler
* Improved Euler
* Runge-Kutta 4 (RK4)

Keep the implementation modular so you can later compare integrators.

## Phase 3: Plot the results

* time series
* phase portrait

## Phase 4: Build controls

Create sliders for

* growth rate
* predation rate
* reproduction rate
* timestep
* initial populations

Create sliders for

* growth rate
* predation rate
* reproduction rate
* timestep
* initial populations

## Phase 5: Ask questions

Examples

* Does increasing the timestep change the apparent stability?
* Does RK4 behave differently from Euler?
* Which parameter has the greatest effect?
* Do nearby initial conditions stay nearby?

These become experiments.

## Phase 6: Measure instead of just looking

Measure

* period
* amplitude
* energy (when appropriate)
* convergence
* numerical error
* runtime

## Phase 7: Keep a lab notebook

Every experiment should record

* Date
* Question
* Parameters
* Observations
* Next Question

## Phase 8: Improve the visualization

Instead of a single chart, imagine a dashboard:

* Parameter Controls
* Phase Portrait
* Time Series
* Statistics

## Phase 9: Extend the mathematics

Add

* Lorenz
* Double pendulum
* Duffing oscillator
* Van der Pol oscillator

> "What is the smallest addition that lets me ask a more interesting question?"

## Architecture

Mathematical Model
        ↓
Numerical Integrator
        ↓
Simulation Engine
        ↓
Recorded State History
        ↓
Visualization & Analysis