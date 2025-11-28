# motion_viz

Parsing, conversion and visualization of motion capture files with FastAPI
backend and ThreeJS Engine frontend.

# Requirements

- Python 3.10
- Node.js 18+ (npm)
- Poetry (für Python-Env-Management)
- Visual Studio Build Tools 2022

# Installation (using vs code editor is recommended)

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
├── /api
│   ├── api_1.ts                        ← communication with FastAPI backend
│   ├── api_2.ts                        ← communication with FastAPI backend
│   ├── ...                             ← communication with FastAPI backend
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
│   └── widget_container_1.tsx          ← Central logic + manager + states
│   └── widget_container_2.tsx          ← Central logic + manager + states
│   └── ...
│
├── /context
│   └── context_1.tsx                   ← context objects + dependencies to other modul
│   └── context_2.tsx                   ← context objects + dependencies to other modul
│   └── ...
│
├── app.tsx                             ← contains all containers
│
└── main.tsx                            ← Root
```
