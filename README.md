# motion_viz

Parsing, conversion and visualization of motion capture files with FastAPI
backend and ThreeJS Engine frontend.

# Requirements

- Python >=3.12
- Node.js 18+ (npm)
- Poetry (for Python environment management)
- Visual Studio Build Tools 2022

# Installation (using vs code editor is recommended)

## Create data folder

```bash
mkdir data
```

## Frontend

```bash
cd src/frontend
npm install
```

## Backend

```bash
cd src/backend
poetry install
```

## create launch.json

```json
{
  "version": "0.2.0",
  "compounds": [
    {
      "name": "Run Backend + Frontend",
      "configurations": ["Run FastAPI (uvicorn)", "Vite Frontend"]
    }
  ],
  "configurations": [
    {
      "name": "Run FastAPI (uvicorn)",
      "type": "debugpy",
      "request": "launch",
      "module": "uvicorn",
      "args": ["backend.main:app", "--reload", "--app-dir", "src"],
      "cwd": "${workspaceFolder}",
      "env": {
        "PYTHONPATH": "${workspaceFolder}/src"
      },
      "console": "integratedTerminal"
    },
    {
      "name": "Vite Frontend",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}/src/frontend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "console": "integratedTerminal"
    }
  ]
}
```

## Optional

- Install packages:
  - ESlint
  - Prettier - Code Formatter
  - Even Better TOML

### create workspace settings.json for prettier plugin (autoformat code)

```json
{
  "editor.formatOnSave": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### create .prettierrc file in root of worksapce for prettier plugin (autoformat code)

```json
{
  "tabWidth": 2,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "jsxSingleQuote": false,
  "printWidth": 100
}
```

# Hotkeys

The active profile is shown in the top bar. The application starts with the RULA
profile active.

## Available in both profiles

| Key                          | Action                                                       |
| ---------------------------- | ------------------------------------------------------------ |
| `Tab`                        | Switch between the Play and RULA profiles                    |
| `Space`                      | Play or pause the motion                                     |
| `Left Arrow` / `Right Arrow` | Move one frame backward or forward                           |
| `S`                          | Stop playback and return to frame 0                          |
| `R`                          | Reset the engine, current motion, labels and selections      |
| `P`                          | Toggle the frame-preview rendering                           |
| `D`                          | Print the Three.js scene components to the developer console |

## RULA profile

The number keys use a two-step workflow: first select a RULA category, then
select a feature in that category.

| Key      | Action at category selection                                |
| -------- | ----------------------------------------------------------- |
| `1`      | Upper arm                                                   |
| `2`      | Lower arm                                                   |
| `3`      | Wrist                                                       |
| `4`      | Neck                                                        |
| `5`      | Trunk                                                       |
| `6`      | Legs                                                        |
| `Escape` | Cancel the active category and return to category selection |
| `Enter`  | Save the current RULA label                                 |

Available feature keys after selecting a category:

| Category  | Primary feature | Optional feature toggle |
| --------- | --------------- | ----------------------- |
| Upper arm | `1`-`5`         | `6`-`8`                 |
| Lower arm | `1`-`3`         | -                       |
| Wrist     | `1`-`3`         | `4`                     |
| Neck      | `1`-`4`         | `5`-`6`                 |
| Trunk     | `1`-`4`         | `5`-`6`                 |
| Legs      | `1`             | -                       |

Dragging on the frame slider in the RULA profile creates a label range. With a
range selected, `Left Arrow` and `Right Arrow` extend its left and right edges.
Hold `Ctrl` with the arrow key to move the opposite edge inward.

# Architecture - React Container-Presenter Pattern

The FastAPI backend exposes feature-oriented routers and serves the data files
used by the frontend. The React frontend separates HTTP transport,
orchestration, presentation and the React-independent Three.js engine.

### backend

```text
src/backend/
|-- api/                 # FastAPI routers for files, conversion, labels and training
|-- json_schema/         # label schema and schema helpers
`-- main.py              # FastAPI setup, static mounts and router registration
```

### frontend

```text
src/frontend/src/
|-- api/
|   |-- api_motion_files.ts   # motion-file and conversion requests
|   |-- api_motion_labels.ts  # label requests
|   `-- api_response.ts       # shared response validation
|-- hooks/                    # feature-specific React Query hooks
|-- container/                # state, event handling and feature orchestration
|-- components/
|   |-- presenter/            # layout and composition of UI widgets
|   |-- widgets/              # slider and label-list UI
|   |-- widgets_topbar/       # top-bar UI
|   `-- widgets_ergo_methods/ # ergonomic-method controls
|-- context/                  # state shared by distant components
|-- domain/                   # UI-independent types and label/hotkey rules
|-- threeJS/
|   |-- components/           # cameras and scene objects
|   |-- system/               # renderer, resize handling and engine loop
|   |-- motion_loader/        # BVH, FBX and NPY loading
|   |-- motion_player/        # BVH, FBX and NPY playback
|   `-- three_js_manager.ts   # interface between React and the Three.js engine
|-- utils/                    # shared frontend utilities
|-- app.tsx                   # providers, scene and application containers
`-- main.tsx                  # React entry point
```

Containers connect contexts, hooks and the Three.js manager to presenters.
Presenters compose UI-only widgets. API calls stay in `api/` and are exposed to
containers through hooks; Three.js lifecycle and playback logic remain in
`threeJS/`.
