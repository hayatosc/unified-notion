# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`unified-notion` is a TypeScript monorepo that provides tools for converting Notion content to Markdown Abstract Syntax Tree (MDAST) format. The project consists of two main packages:

- `notion-to-mdast`: Transforms Notion blocks to MDAST format
- `remark-plugin-notion`: Remark plugin for processing Notion content

## Workspace Structure

This is a pnpm workspace with packages organized under `packages/`. Each package has its own build configuration using Rolldown (a Vite-compatible bundler) instead of traditional bundlers.

## Commands

### Testing
- `pnpm test` - Run tests with Vitest in watch mode
- `pnpm test:run` - Run tests once

### Building Packages
- `cd packages/notion-to-mdast && pnpm build` - Build the notion-to-mdast package
- `cd packages/remark-plugin-notion && pnpm build` - Build the remark-plugin-notion package

Each package uses Rolldown with TypeScript declaration generation.

## Key Architecture

### Type System
- Core Notion API types are defined in `utils/notion.ts` using Zod schemas
- Both TypeScript interfaces and Zod runtime validation are provided
- All Notion block types are comprehensively typed (paragraphs, headings, lists, etc.)

### Transformation Pipeline
1. `notion-to-mdast/index.ts`: Entry point that validates Notion API responses
2. `notion-to-mdast/src/transform.ts`: Core transformation logic from Notion blocks to MDAST
3. Handles complex cases like list grouping, rich text formatting, and nested content

### Build System
- Uses Rolldown instead of traditional bundlers
- Configuration in `rolldown.config.mjs` files
- Outputs ESM format with TypeScript declarations and sourcemaps
- The root package.json overrides Vite with `rolldown-vite` for compatibility

### Package Dependencies
- `unified` ecosystem for AST manipulation
- `zod` for runtime type validation
- `@types/mdast` and `@types/unist` for AST typing
- `vitest` for testing