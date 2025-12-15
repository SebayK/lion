# Project Overview

This project, known as "Lion," is a monorepo containing a set of highly performant, accessible, and flexible Web Components. The components are designed to be unopinionated and white-label, providing a foundational layer that can be extended to create custom design systems. The project uses `lit` for creating web components and is structured as an npm monorepo with workspaces. The documentation is built using two static site generators: Astro and Rocket.

# Building and Running

## Development

There are two development servers available, one for Astro and one for Rocket.

- **Start Rocket dev server**:
  ```bash
  npm start
  ```
- **Start Astro dev server**:
  ```bash
  npm run start:astro
  ```

## Build

To build the project, which includes building both the Astro and Rocket sites, run the following command:

```bash
npm run build
```

## Testing

The project has both browser and node-based tests.

- **Run all tests**:
  ```bash
  npm test
  ```
- **Run browser tests**:
  ```bash
  npm run test:browser
  ```
- **Run node tests**:
  ```bash
  npm run test:node
  ```

# Development Conventions

## Linting

The project uses ESLint and Prettier for code formatting and linting.

- **Run all linters**:
  ```bash
  npm run lint
  ```
- **Format files**:
  ```bash
  npm run format
  ```

## Commits

This project uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

## Monorepo Structure

The project is a monorepo using npm workspaces. The main packages are located in the `packages` and `packages-node` directories.

- `packages/ui`: Contains the Lion web components.
- `packages/ajax`: A small wrapper around `fetch`.
- `packages/singleton-manager`: A manager for singleton instances.
- `packages-node/*`: Node.js packages used for documentation generation and other build-time tasks.
