# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Run app: `python -m app.main`
- Install dependencies: `pip install -r requirements.txt`
- Format code: `black app/`
- Type checking: `mypy app/`
- Run tests: `pytest tests/`

## Code Style Guidelines
- Use PEP 8 style guide for Python code
- Docstrings: Use Google-style docstrings for functions and classes
- Imports: Group in order: standard library, third-party, local application
- Type annotations: Use Python type hints for function parameters and return values
- Error handling: Use specific exceptions with context in try/except blocks
- Naming: snake_case for variables/functions, PascalCase for classes
- SQLAlchemy: Use declarative models with type annotations
- Flask routes: Include docstrings describing endpoint functionality
- Frontend: Follow consistent indentation in HTML/CSS/JS files