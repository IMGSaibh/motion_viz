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
            "args": [
                "backend.main:app",
                "--reload",
                "--app-dir",
                "src"
            ],
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


# Architecture frontend
``` bash
/src
│
├── /api
│   ├── api_file_upload.ts
│   ├── api_motion_config.ts
│
├── /threeJS
│   └── three_manager.ts
│
├── /components
│   ├── /widgets
│   │   ├── MotionConfigWidget.tsx  ← UI only (Presenter)
│   │   ├── FileUploadWidget.tsx    ← UI only (Presenter)
│   │   └── SceneControlsWidget.tsx ← UI only (Presenter)
│   └── WidgetPresenter.tsx         ← UI shell for multiple widgets
│
├── /containers
│   └── WidgetContainer.tsx        ← Central logic + manager + states
│
└── App.tsx                        ← Root

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
    - uses material UI (React)
- ThreeManager 
    - Encapsulates WebGL logic (scene, camera, light, objects, etc.)
- API layer 
    - Handles all backend communication