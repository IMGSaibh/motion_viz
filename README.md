# motion_viz

Parsing, conversion and visualization of motion capture files with FastAPI backend and ThreeJS Engine frontend.

## Voraussetzungen

- Python 3.12+
- Node.js 18+ (npm)
- Poetry (für Python-Env-Management)

## Installation

### Frontend
```bash
cd src/frontend
npm install
```
### Backend

```bash
cd src/motion_viz
poetry install
```

### create launch.json
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

### Commands

start server
``` bash
npm run dev
```

start tTyp‑checker parallel 
``` bash
npm run type-check -- --watch
```

# Architecture
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
│   └── WidgetContainer.tsx        ← Zentrale Logik + Manager + States
│
└── App.tsx                        ← Root

```

# Explanation
- Container	- Verwaltet Zustand (React useState, useRef, useEffect)
- Ruft APIs auf (axios)
- Steuert ThreeManager Presenter - Präsentiert UI
- Zeigt Eingabefelder, Buttons, Texte
- Ruft nur Callback-Props auf
- ThreeManager - Kapselt WebGL-Logik (Scene, Kamera, Licht, Objekte, usw.)
- api-Layer	- Kümmert sich um alle Backend-Kommunikation