# Do

- Use MUI v7 and ensure all UI code is compatible with the version installed in
  this repository.
- Reuse existing components, hooks, utilities, types, constants, and services
  before creating new ones.
- Follow the existing project structure and naming conventions.
- Keep changes focused on the requested task.
- Prefer small, composable React components.
- Use TypeScript types explicitly for component props, context values, API
  responses, and public functions.
- Keep presentational components free of backend, state-management, and Three.js
  engine logic.
- Keep state local unless it is required by multiple distant components.
- Use existing theme values for colors, spacing, typography, and breakpoints.
- Handle loading, empty, and error states for asynchronous operations.
- Clean up event listeners, subscriptions, timers, animation frames, and
  Three.js resources.
- Preserve existing behavior unless the task explicitly requires changing it.
- Run the smallest relevant validation command after making changes.

# Don't

- Do not hardcode colors. Use the existing MUI theme or project constants.
- Do not hardcode user-facing strings when an existing translation or constants
  mechanism is available.
- do not add new heavy dependencies without approval
- Do not use raw div, span, or similar elements when an existing project or MUI
  component provides the intended behavior.
- Do not create a new component when an equivalent component already exists.
- Do not add new heavy dependencies without approval.
- Do not upgrade MUI, React, TypeScript, or other dependencies unless explicitly
  requested.
- Do not use APIs introduced after MUI v3.
- Do not use any unless no reasonable type is available and the reason is
  documented.
- Do not suppress TypeScript or ESLint errors without explaining the reason.
- Do not modify generated files.
- Do not reformat unrelated files.
- Do not refactor unrelated code as part of a small feature or bug fix.
- Do not place API calls directly inside presentational components.
- Do not expose secrets, tokens, credentials, or private environment values.
- Do not create additional render loops if the existing Three.js engine loop can
  be used.
- Do not mutate React state directly.

# Safety and permissions

## Allowed without asking:

- Read and list repository files.
- Search the codebase.
- Inspect Git history and diffs.
- Run Prettier on files changed for the task.
- Run ESLint on files changed for the task.
- Run TypeScript checks scoped to the affected code when - supported by the
  repository.
- Create or modify source files required for the requested task.

## Ask before:

- Installing, removing, or upgrading packages.
- Modifying package.json or a lockfile for dependency changes.
- Running git push.
- Creating a pull request.
- Deleting or renaming files.
- Running chmod or changing file permissions.
- Running a full production build.
- Running the complete test suite.
- Running end-to-end tests.
- Modifying deployment, infrastructure, or environment - configuration.
- Making database migrations or destructive data changes.
- Changing public APIs used by other parts of the application.

# Never do

- Never commit or expose secrets.
- Never use destructive Git commands such as git reset --hard, git clean -fd, or
  force-push unless explicitly instructed.
- Never overwrite unrelated local changes.
- Never claim that a check passed unless it was actually run successfully.

# Project structure

- src/components/ contains reusable and presentational React components.
- src/components/widgets/ contains UI-only widget components.
- src/containers/ contains feature orchestration, local state, and
  event-handling logic.
- src/context/ contains state shared by multiple distant components.
- src/hooks/ contains reusable React hooks and backend communication.
- src/threeJS/ contains the React-independent Three.js and motion engine.
- src/threeJS/components/ contains Three.js scene objects such as cameras and
  scene - elements.
- src/threeJS/system/ contains rendering, update loops, and engine lifecycle
  logic.
- src/threeJS/motion_loader/ contains motion file parsing and loading.
- src/threeJS/motion_player/ contains motion playback logic.
- src/App.tsx composes application-level containers and providers.
- src/main.tsx is the application entry point.

# Architecture rules

- Components render UI and receive data through props.
- Containers connect UI components to hooks, contexts, and managers.
- Context is only for state that must be shared across multiple distant
  components.
- Do not move local component state into context without a clear need.
- Backend communication belongs in the existing API layer or custom hooks.
- Three.js engine code should remain independent from React where possible.
- React should interact with Three.js through an existing manager, adapter,
  hook, or - context.
- Avoid importing React code into the Three.js engine layer.
- Avoid circular dependencies between components, containers, contexts, hooks,
  and the - engine.

## Simplicity and clean architecture

- Prefer the simplest solution that satisfies the current requirement.
- Do not introduce abstractions for hypothetical future requirements.
- Avoid unnecessary wrappers, factories, managers, hooks, contexts, and utility
  functions.
- Extract shared logic only when it is reused or when extraction clearly
  improves readability or testability.
- Keep modules focused on one responsibility.
- Keep business logic independent from React and UI frameworks where practical.
- Keep presentational components free of API, persistence, and engine
  orchestration logic.
- Dependencies should point inward toward stable domain logic, not outward
  toward UI details.
- Prefer explicit data flow over hidden global state.
- Keep state as close as possible to where it is used.
- Use context only when multiple distant components need the same state.
- Avoid circular dependencies.
- Avoid large components, hooks, contexts, or manager classes with unrelated
  responsibilities.
- Do not create pass-through abstractions that only rename an existing API
  without adding value.
- Follow existing architectural patterns unless they are directly causing the
  problem being solved.
- When a change requires a new abstraction, explain briefly why the existing
  structure is insufficient.

# React and TypeScript conventions

- Use functional components and hooks.
- Prefer named types or interfaces for non-trivial props.
- Keep hooks at the top level of React components and custom hooks.
- Include all required dependencies in effect dependency arrays.
- Memoize values or callbacks only when there is a measurable or structural
  reason.
- Avoid storing values in state when they can be derived from existing props or
  state.
- Use refs for mutable values that should not trigger rendering.
- Use immutable state updates.
- Keep files focused on one primary responsibility.

## React effects

- Use effects only to synchronize React with external systems such as APIs,
  browser APIs, subscriptions, timers, or the Three.js engine.
- Do not use effects for values that can be derived during rendering.
- Do not use effects when the same logic can run directly in an event handler.
- Follow the `react-hooks/exhaustive-deps` rule.
- Include every reactive value used by an effect in its dependency array.
- Do not omit dependencies merely to prevent an effect from running.
- If a dependency causes unnecessary executions, restructure the effect or
  stabilize the value instead of disabling the lint rule.
- Keep each effect focused on one synchronization concern.
- Always clean up subscriptions, listeners, timers, animation frames, and owned
  resources.
- Do not disable React Hooks lint rules without a documented technical reason.

# Backend communication

- Reuse the configured API client, base URL, headers, and authentication
  behavior.
- Do not hardcode backend URLs.
- Type API request and response data.
- Handle request failures explicitly.
- Prevent stale requests from updating unmounted components where relevant.
- Do not silently swallow backend errors.
- Keep transport-level data conversion outside presentational components.

# Three.js lifecycle

- Dispose geometries, materials, textures, render targets, and controls when no
  longer used.
- Remove registered event listeners and updatable objects during cleanup.
- Use the existing engine lifecycle and central update loop.
- Keep file loading, playback, rendering, and UI responsibilities separated.
- Avoid recreating expensive Three.js objects on every React render.
- Document ownership when it is not obvious which module creates and disposes a
  resource.
