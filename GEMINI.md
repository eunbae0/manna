# General Code Style & Formatting
- Use functional and declarative programming patterns; avoid classes.
- Prefer iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
- Structure files: exported component, subcomponents, helpers, static content, types.
- Follow Expo's official documentation for setting up and configuring projects.

# Naming Conventions
- Use lowercase with dashes for directories (e.g., components/auth-wizard).
- Favor named exports for components.

# TypeScript Best Practices
- Use TypeScript for all code; prefer interfaces over types.
- Avoid any and enums; use explicit types and maps instead.
- Use functional components with TypeScript interfaces.
- Enable strict mode in TypeScript for better type safety.

# Syntax & Formatting
- Use the function keyword for pure functions.
- Use export default function for screens.
```tsx
export default function ExampleScreens() {
  return (
    <View>
      <Text>Example Screens</Text>
    </View>
  )
}
```
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.
- Use declarative JSX.
- Use Biome.js for consistent code formatting.

# Styling & UI
- Use Expo's built-in components for common UI patterns and layouts.
- Implement responsive design with Flexbox and useWindowDimensions.
- Use Tailwind CSS for styling.
- Implement dark mode support using Expo's useColorScheme.
- Ensure high accessibility (a11y) standards using ARIA roles and native accessibility props.
- Use react-native-reanimated and react-native-gesture-handler for performant animations and gestures.

# Data Fetching Patterns
- Use React Query v5 for data fetching and caching.
- Use Firestore for data fetching from @/api.

# State Management
- Use Zustand for state management.

# Component Library Hierarchy
## PRIMARY (Use by default):
- gluestack/ui components from /components/ui.
```tsx
import { Button } from '@/components/common/button';
import { Text } from '@/shared/components/text';
```
- `lucide-react-native` packages for icons.
```tsx
import { Icon } from '#/components/ui/icon';
```
- Tailwind CSS for styling. In this project, we use Tailwind CSS based `NativeWind` for styling.

## SECONDARY (Use when requested):
- Other React component libraries.
- Other icon libraries.

# General Code Style & Formatting
- Use English or Korean for all code and documentation.
- Always declare the type of each variable and function (parameters and return value).
- Avoid using any.
- Create necessary types.
- Use JSDoc to document public classes and methods.
- Don't leave blank lines within a function.
- One export per file.

# Naming Conventions
- Use PascalCase for classes.
- Use camelCase for variables, functions, and methods.
- Use kebab-case for file and directory names.
- Use UPPERCASE for environment variables.
- Avoid magic numbers and define constants.

# Functions & Logic
- Keep functions short and single-purpose (<20 lines).
- Adhere to the SOLID principles.
- Avoid deeply nested blocks by:
- Using early returns.
- Extracting logic into utility functions.
- Use higher-order functions (map, filter, reduce) to simplify logic.
- Use arrow functions for simple cases (<3 instructions), named functions otherwise.
- Use default parameter values instead of null/undefined checks.
- Use RO-RO (Receive Object, Return Object) for passing and returning multiple parameters.

# Data Handling
- Avoid excessive use of primitive types; encapsulate data in composite types.
- Avoid placing validation inside functions—use classes with internal validation instead.
- Prefer immutability for data:
- Use readonly for immutable properties.
- Use as const for literals that never change.

# Project Organization:
- Root Level Structure:
  /api                   # API routes
    /auth                # Auth group routes
    /dashboard           # Dashboard group routes
    layout.tsx          # Root layout
    page.tsx            # Root page
  /app                   # React Native Router
  /components           # React components
    /common              # Common components
    /screens           # Screens specific components
  /utils                  # Utility functions
  /hooks               # Custom React hooks
  /types               # TypeScript types
  /store              # Zustand store
  /types              # TypeScript types
  /firebase           # Default Firebase configuration

# Text literary style

- Use `~해요` instead of `입니다`.
Example: 
- `탈퇴하겠습니까?` -> `탈퇴할까요?`
- `가입하겠습니까?` -> `가입할까요?`
- `리뷰를 남기겠습니다.` -> `리뷰를 남길게요.`
- `소통할 수 있습니다.` -> `소통해보세요.`

# Use Generated Component

- Use generated components instead of generating new components.
Example:
- Header: `import { Header } from '@/components/common/Header';`
- Toast: `import { useToastStore } from '@/store/toast';`
- Icon: `import { Icon } from '#/components/ui/icon';`
- KeyboardAvoidingView: `import { KeyboardAvoidingView } from '@/components/common/keyboard-view/KeyboardAvoidingView';`
- KeyboardDismissView: `import { KeyboardDismissView } from '@/components/common/keyboard-view/KeyboardDismissView';`
- Button: `import { Button } from '@/components/common/button';`
- VStack: `import { VStack } from '#/components/ui/vstack';`
  - use `space` prop instead of `className` prop 
- HStack: `import { HStack } from '#/components/ui/hstack';`
  - use `space` prop instead of `className` prop
- Text: `import { Text } from '@/shared/components/text';`
  - use `font-pretendard-*` instead of `font-*`
  - use `weight` prop instead of `className` prop (`font-bold` -> `weight="bold"`)
  - use `size` prop instead of `className` prop (`text-lg` -> `size="lg"`)
- Heading: `import { Heading } from '@/shared/components/heading';`
  - use `font-pretendard-*` instead of `font-*`
  - use `size` prop instead of `className` prop (`text-2xl` -> `size="2xl"`)

# 

- If use Button component, Button Text should be use `ButtonText` component.
Example:
```tsx
<Button>
  <ButtonText>이미지 추가</ButtonText>
</Button>
```
- If use Button component, Button Icon should be use `ButtonIcon` component.
Example:
```tsx
<Button>
  <ButtonIcon as={PlusIcon} />
  <ButtonText>이미지 추가</ButtonText>
</Button>
```