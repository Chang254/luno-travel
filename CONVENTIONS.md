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

`.styles.ts`, `.helpers.tsx`, and `.actions.ts` are added only as needed — a component with no server actions has no `.actions.ts` file, and so on. `index.tsx` and `MyComponent.tsx` are the only files every component requires.

`index.tsx` should always re-export the component's default export as a default export, not a named one:

```
// index.tsx
export { default } from "./MyComponent";
```

Consumers should always import from the folder (the barrel), never by reaching into the file directly:

```
// Good
import MyComponent from "@/components/MyComponent";

// Avoid
import MyComponent from "@/components/MyComponent/MyComponent";
```

If `MyComponent.actions.ts` creates a Supabase client, follow the same rule as everywhere else: create it inside each action function rather than hoisting it to module scope (see CLAUDE.md, Auth and clients).

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

Omit Obvious Comments: Use comments to provide context that is not available by the code itself.

Leverage TSDoc for Context: When logic requires explanation, document it using TSDoc (/** ... */) instead of standard inline comments when possible. This ensures the context is surfaced directly via editor IntelliSense during asset consumption.

## Styles

Tailwind CSS Styling Conventions

We use Tailwind CSS to style components. All Tailwind class strings must be defined in the appropriate .styles.ts file, rather than written directly in the component's JSX.

```
// Button.styles.ts
export const styles = {
  button: 'bg-red-500 mt-5',
};

// Button.tsx
import { styles } from './Button.styles';

<Button className={styles.button} />
```

Avoid writing raw Tailwind class strings directly in className props. Keep styling definitions separate from component markup to maintain consistency and make styles easier to locate and maintain.

## Testing

Write unit tests for components or functions that contain business logic.  Purely presentational components do not need unit tests.

Tests should mimic real user behavior as closely as possible

• Prefer userEvent over fireEvent: ensures that complete interaction paths (like clicking, typing, or tabbing) fully dispatch all underlying side effects exactly like a human user would experience them.

• Prioritize Visible Element Selectors: Avoid querying internal component states, test IDs, or strict CSS classes unless absolutely necessary. Instead, query elements based on visible text, labels, accessible roles, or placeholders.
