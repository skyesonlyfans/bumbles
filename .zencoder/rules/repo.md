---
description: Repository Information Overview
alwaysApply: true
---

# Bumbles Evolution Simulator Information

## Summary
Bumbles is a React-based evolution simulator that models the behavior and lifecycle of creatures called "Bumbles". The application features a complex simulation with various environmental factors, creature genetics, and interactive elements. It includes features like day/night cycles, vampire traits, water sources, and pet companions called "Chuddles".

## Structure
- **app/**: Contains the main application component (app.tsx)
- **components/**: UI components organized by functionality
  - **ui/**: Reusable UI components like buttons, cards, and tabs
- **lib/**: Utility functions and helpers

## Language & Runtime
**Language**: TypeScript/JavaScript
**Version**: TypeScript 5.5.3
**Package Manager**: Bun
**Build System**: Not explicitly defined, likely uses Bun's built-in bundler

## Dependencies
**Main Dependencies**:
- React 18.3.1
- React DOM 18.3.1
- Radix UI components (@radix-ui/react-*)
- Lucide React 0.446.0
- Class Variance Authority 0.7.0
- CLSX 2.1.1
- Tailwind Merge 2.5.2
- React Icons 5.5.0
- Canvas Confetti 1.9.3

**Development Dependencies**:
- ESLint 9.11.1
- TypeScript 5.5.3
- Tailwind CSS 3.4.13
- PostCSS 8.4.47
- Autoprefixer 10.4.20
- TypeScript ESLint 8.7.0

## Build & Installation
```bash
# Install dependencies
bun install

# Lint the codebase
bun run lint
```

## Main Files & Resources
**Application Entry Point**: app/app.tsx
**UI Components**: components/ui/*.tsx
**Utility Functions**: lib/utils.ts

The main application (app.tsx) implements a complex simulation with:
- Creature genetics and behavior modeling
- Environmental factors (temperature, humidity, wind)
- Day/night cycles
- Interactive canvas-based visualization
- Statistics tracking and display
- Settings management for simulation parameters