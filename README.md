# motion_viz

Parsing, conversion and visualization of motion capture files with FastAPI backend and ThreeJS Engine frontend.

# Requirements

- Python 3.12+
- Node.js 18+ (npm)
- Poetry (für Python-Env-Management)

# Installation

## Frontend

```bash
cd src/frontend
npm install
```

## Backend

```bash
cd src/motion_viz
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

### create worksapce settings.json for prettier plugin (autoformat code)

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

### frontend

```bash
/src
│
├── /api
│   ├── api_1.ts                        ← communication with FastAPI backend
│   ├── api_2.ts                        ← communication with FastAPI backend
│   ├── ...                             ← communication with FastAPI backend
│
├── /threeJS
│   └── three_manager.ts                ← 3D webgl engine
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
│   └── widget_container.tsx            ← Central logic + manager + states
│
├── app.tsx                             ← contains all containers
|
└── main.tsx                            ← Root
```

# Explanation frontend

- Container
  - Manages state (React useState, useRef, useEffect)
  - Calls APIs (axios)
  - Controls ThreeManager
- Presenter
  - Presents UI
  - Displays input fields, buttons, texts
  - Only calls callback props
  - Uses material UI (Library)
- ThreeManager
  - Encapsulates WebGL logic (scene, camera, light, objects, etc.)
- API layer
  - Handles all backend communication
