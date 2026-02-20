# Cohort Facebook

Generate a printable trainee tracking sheet for HackYourFuture classroom sessions. Each trainee gets a card with their photo, name, and fields to mark by hand: attendance, participation, comprehension, and notes.

## Setup

Copy the example file and add your trainee data:

```bash
cp images.example.txt images.txt
```

## Usage

```bash
npm start
```

This generates `tracking-sheet-print.html` and opens it in your browser. Use **Cmd+P** (or Ctrl+P) to save as PDF.

To use a different input file:

```bash
node generate-tracking-sheet.js path/to/trainees.txt
```

## Input format

Edit your local `images.txt` with one trainee per line, pipe-delimited (this file is gitignored for privacy):

```
Name|Image URL
```

Example:

```
Atiqa Naseer|https://ca.slack-edge.com/T0EJTUQ87-U0A794RJWK0-b9f000c4d4c7-512
Mo|https://ca.slack-edge.com/T0EJTUQ87-U04V0H49BHP-532773ea0ef1-512
```

Blank lines are ignored. If an image URL fails to load, a colored circle with the trainee's initials is shown as a fallback.

> **Note:** Slack CDN image URLs expire over time. If photos stop loading, grab fresh URLs from Slack and update `images.txt`.
