# Conventions

This document contains the patterns and practices that should be followed when contributing code

## Folder Structure

Each component should follow the following structure

```
-📁 MyComponent
  -📄 index.ts // Contains default export
  -📄 MyComponent.styles.ts // Contains tailwind strings
  -📄 MyComponent.helpers.tsx // Utils and custom hooks consumed by MyComponent
  -📄 MyComponent.actions.ts // Server Actions consumed by MyComponent
  -📄 MyComponent.tsx // React Component
```
The goal of this structure is for the React component to be deterministic by extracting all complex calculations into pure utility functions and wrapping state changes inside custom hooks. This ensures your component file contains minimal procedural logic, resulting in predictable and human readable UI outcome

If a component is a child of another component, it should be nested inside of its parent's folder

```
-📁 MyComponent
  -📁 MyChildComponent
```

If a component is a shared child of two components, it should live next to both of its parents

```
-📁 Parent 1
-📁 Parent 2
-📁 Child
```

Shared utils, components, and actions should live at the appropriate root level folder (e.g /components)


