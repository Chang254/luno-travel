# Conventions

This document contains the patterns and practices that should be followed when contributing code

## Folder Structure

Each component should follow the following structure

```
-📁 MyComponent
  -📄 index.tsx // Contains default export
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

## Typing

### Where to store types

Types that are tied to a specific function should live next to that function (e.g React Component props or function parameters).

```
interface MyComponentProps {
  /** Description of prop1 */
  prop1: string
}

export default function MyComponent({ prop1 }: MyComponentProps){
  ...
}
```

Shared types used across multiple functions should be placed in the appropriate /types/*.types.ts file

### Type Inference

Let TypeScript infer types when appropriate (depend on linting for non-obvious cases).

e.g

```
const myNumber = 2
```

Does not need to be typed as a number

## Comments

Do not comment on obvious readable code.  If comments are needed, try to use tsDocs to take advantage of intellisense benefits.

## Styles

Tailwind CSS Styling Conventions

We use Tailwind CSS to style components. All Tailwind class strings must be defined in the appropriate .styles.ts file, rather than written directly in the component's JSX.

```
// Button.styles.ts
export const buttonStyle = 'bg-red-500 mt-5';

// Button.tsx
import { buttonStyle } from './Button.styles';

<Button className={buttonStyle} />
```

Avoid writing raw Tailwind class strings directly in className props. Keep styling definitions separate from component markup to maintain consistency and make styles easier to locate and maintain.


