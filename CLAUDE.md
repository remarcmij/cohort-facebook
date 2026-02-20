# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A zero-dependency Node.js ESM script that generates a printable HTML trainee tracking sheet for HackYourFuture classroom sessions. The teacher prints it and fills in fields by hand during class.

## Commands

- `npm start` — reads `images.txt`, generates `tracking-sheet-print.html`, and opens it in the browser
- `node generate-tracking-sheet.js <file>` — use a custom input file instead of `images.txt`

There are no build steps, linters, or tests.

## Architecture

Single-file project (`generate-tracking-sheet.js`):
1. Parses `images.txt` (pipe-delimited `Name|Image URL`, one per line)
2. Generates a self-contained HTML string with inline CSS, print-optimized for A4 portrait
3. Writes `tracking-sheet-print.html` and auto-opens it in the default browser

The generated HTML includes per-trainee cards with: circular photo (100px, with colored-initials fallback on image error), attendance checkboxes, participation/comprehension circle selectors, and a lined notes area.

## Key Constraints

- Zero dependencies — only Node.js built-in modules (`node:fs`, `node:path`, `node:child_process`, `node:url`)
- ESM (`"type": "module"` in package.json)
- Generated output (`tracking-sheet-print.html`, `*.pdf`) is gitignored
- Slack CDN image URLs expire; the fallback initials mechanism handles broken images
