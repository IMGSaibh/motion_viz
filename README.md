# motion_viz

Parsing, conversion and visualization of motion capture files with FastAPI
backend and ThreeJS Engine frontend.

# Requirements

- Python 3.10
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

# Architecture - React Container-Presenter-Pattern -

### backend

```bash
/api
├── api_1.py
├── api_2.py
├── api_3.py
├── ...
/motion_parser
├── bvh_parser.py
├── pv_parser.py
├── ...
main.py
```

### frontend

```bash
/src
│
|── /api
|   |── api_response.ts                 ← shared HTTP response handling and validation
|   |── motion_api.ts                   ← motion-related FastAPI requests
|   └── labels_api.ts                   ← label-related FastAPI requests
|
|── /hooks
|   |── use_bvh_conversion.ts           ← React Query mutation orchestration
|   |── use_motion_files.ts             ← React Query motion-file query
|   └── use_*.ts                        ← feature-specific React Query hooks
|
|── /utils
|   └── api_url.ts                      ← API base URL construction
|
│
├── /threeJS                            ← 3D webgl engine
│   └── three_manager.ts                ← 3D webgl engine manager to use in react and frontend
│   └──/components                      ← 3D webgl engine (camera, scene, ...)
│   └──/system                          ← 3D webgl engine (renderer, engine loop, holds all updatable objects)
│   └──/motion_loader                   ← loads motion files (bvh, mvnx, ...)
│   └──/motion_player                   ← plays a motion file (bvh, fbx, npy, ...)
│
├── /components
│   ├── /widgets
│   │   ├── widget_1.tsx                ← UI only (Presenter)
│   │   ├── widget_2.tsx                ← UI only (Presenter)
│   │   └── widget_3.tsx                ← UI only (Presenter)
│   │   └── ....
│   └── widget_presenter_1.tsx          ← UI shell for multiple widgets
│   └── widget_presenter_2.tsx          ← UI shell for multiple widgets
│   └── widget_presenter_3.tsx          ← UI shell for multiple widgets
│   └── ...                             ← UI shell for multiple widgets
│
├── /containers
│   └── container_widgetname_1.tsx      ← maintains local state + calls backend + passes data to presenter
│   └── container_widgetname_2.tsx      ← maintains local state + calls backend + passes data to presenter
│   └── container_widgetname_2.tsx      ← container also can uses contexts
│   └── ...
│
├── /context
│   └── context_1.tsx                   ← Components must access the same data + state management
│   └── context_2.tsx                   ← Components must access the same data + state management
│   └── ...
│
├── app.tsx                             ← contains all containers
│
└── main.tsx                            ← Root
```

- Container
  - maintains local state
  - calls hooks or backend functions
  - is familiar with the Three.js manager
  - handles events
  - passes data as props to presenter components
  - This component controls this specific area of the interface
  - It is therefore associated with a specific feature or UI area
- Context
  - This data and states should be available for multiple components in the
    component tree.
