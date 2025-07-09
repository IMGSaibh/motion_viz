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