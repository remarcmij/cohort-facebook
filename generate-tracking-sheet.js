#!/usr/bin/env node
//
// Generate a printable trainee tracking sheet (HTML → open in browser → Cmd+P to PDF)
//
// INPUT FORMAT (one trainee per line, pipe-delimited):
//
//   Name|Image URL
//
// Example:
//   Jane Doe|https://i.pravatar.cc/512?img=1
//   John Smith|https://i.pravatar.cc/512?img=3
//
// Blank lines are ignored.
//
// USAGE:
//   npm start                                     # reads ./images.txt
//   node generate-tracking-sheet.js trainees.txt   # reads custom file
//

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const inputFile = process.argv[2] || join(__dirname, "images.txt");
const outputFile = join(dirname(inputFile), "tracking-sheet-print.html");

// Parse trainees
const raw = readFileSync(inputFile, "utf-8");
const trainees = raw
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line && line.includes("|"))
  .map((line) => {
    const [name, photo] = line.split("|", 2);
    return { name: name.trim(), photo: (photo || "").trim() };
  })
  .filter((t) => t.name);

if (trainees.length === 0) {
  console.error(`No trainees found in ${inputFile}`);
  process.exit(1);
}

console.log(`Found ${trainees.length} trainees in ${inputFile}`);

const colors = [
  "#6c5ce7", "#00b894", "#e17055", "#0984e3", "#fdcb6e",
  "#e84393", "#00cec9", "#a29bfe", "#55a3e8", "#fd79a8",
  "#74b9ff", "#fab1a0", "#81ecec", "#636e72", "#d63031",
  "#2d3436", "#b2bec3", "#e67e22", "#1abc9c", "#9b59b6",
];

function getInitials(name) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function traineeCard(t, i) {
  const initials = getInitials(t.name);
  const color = colors[i % colors.length];

  return `
    <div class="trainee-card">
      <div class="photo-col">
        <img src="${t.photo}" alt="${t.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div class="fallback" style="background:${color};display:none">${initials}</div>
      </div>
      <div class="info-col">
        <div class="name-row"><span class="trainee-num">${i + 1}.</span> ${t.name}</div>
        <div class="fields-row">
          <div class="field-group">
            <span class="field-label">Attendance:</span>
            <span class="checkbox-option"><span class="box"></span> Present</span>
            <span class="checkbox-option"><span class="box"></span> Absent</span>
            <span class="checkbox-option"><span class="box"></span> Late</span>
          </div>
          <div class="field-group">
            <span class="field-label">Participation:</span>
            <span class="circle-option"><span class="circle"></span> Low</span>
            <span class="circle-option"><span class="circle"></span> Medium</span>
            <span class="circle-option"><span class="circle"></span> High</span>
          </div>
        </div>
        <div class="fields-row">
          <div class="field-group">
            <span class="field-label">Comprehension:</span>
            <span class="circle-option"><span class="circle"></span> Struggling</span>
            <span class="circle-option"><span class="circle"></span> Getting there</span>
            <span class="circle-option"><span class="circle"></span> Solid</span>
          </div>
        </div>
        <div class="notes-label">Notes:</div>
        <div class="notes-area"></div>
      </div>
    </div>`;
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Trainee Tracking Sheet</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #222; padding: 8px; }

  .page-header {
    text-align: center;
    padding: 10px 0 8px;
    border-bottom: 2px solid #333;
    margin-bottom: 10px;
  }
  .page-header h1 { font-size: 16px; margin-bottom: 4px; }
  .session-date { font-size: 13px; }
  .session-date span {
    display: inline-block;
    border-bottom: 1px solid #333;
    width: 200px;
    margin-left: 4px;
  }

  .trainee-card {
    display: flex;
    align-items: flex-start;
    border: 1px solid #999;
    border-radius: 4px;
    padding: 8px 10px;
    margin-bottom: 6px;
    page-break-inside: avoid;
    gap: 12px;
  }

  .photo-col {
    flex: 0 0 100px;
    text-align: center;
  }
  .photo-col img {
    width: 100px; height: 100px;
    border-radius: 50%;
    object-fit: cover;
    display: block;
  }
  .photo-col .fallback {
    width: 100px; height: 100px;
    border-radius: 50%;
    color: #fff;
    font-size: 32px;
    font-weight: bold;
    align-items: center;
    justify-content: center;
    line-height: 100px;
    text-align: center;
  }

  .info-col { flex: 1; min-width: 0; }

  .name-row {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 5px;
    border-bottom: 1px solid #ddd;
    padding-bottom: 3px;
  }
  .trainee-num { color: #888; font-weight: normal; font-size: 11px; margin-right: 4px; }

  .fields-row {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 4px;
  }

  .field-group { display: flex; align-items: center; gap: 3px; }
  .field-label {
    font-weight: bold;
    font-size: 10px;
    text-transform: uppercase;
    color: #555;
    margin-right: 2px;
  }

  .checkbox-option {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    margin-right: 6px;
    font-size: 10px;
  }
  .checkbox-option .box {
    display: inline-block;
    width: 12px; height: 12px;
    border: 1.5px solid #555;
    border-radius: 2px;
  }

  .circle-option {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    margin-right: 6px;
    font-size: 10px;
  }
  .circle-option .circle {
    display: inline-block;
    width: 12px; height: 12px;
    border: 1.5px solid #555;
    border-radius: 50%;
  }

  .notes-label { font-size: 9px; color: #888; padding: 1px 0; }
  .notes-area {
    border: 1px solid #bbb;
    border-radius: 3px;
    height: 1.6cm;
    background:
      repeating-linear-gradient(
        transparent,
        transparent 0.53cm,
        #ddd 0.53cm,
        #ddd calc(0.53cm + 1px)
      );
    margin-top: 2px;
  }

  @media print {
    body { padding: 0; font-size: 10px; }
    .page-header { padding: 6px 0 5px; }
    .trainee-card { margin-bottom: 5px; padding: 6px 8px; }
    .notes-area { height: 1.4cm; }
  }

  @page {
    size: A4 portrait;
    margin: 10mm;
  }
</style>
</head>
<body>

<div class="page-header">
  <h1>HackYourFuture Cohort 55 &mdash; Trainee Tracking Sheet</h1>
  <div class="session-date">Session Date: <span>&nbsp;</span></div>
</div>

${trainees.map((t, i) => traineeCard(t, i)).join("\n")}

</body>
</html>`;

writeFileSync(outputFile, html, "utf-8");
console.log(`Written to ${outputFile}`);

// Auto-open in browser
try {
  if (process.platform === "darwin") {
    execSync(`open "${outputFile}"`);
  } else if (process.platform === "linux") {
    execSync(`xdg-open "${outputFile}"`);
  } else if (process.platform === "win32") {
    execSync(`start "" "${outputFile}"`);
  }
  console.log("Opened in browser. Use Cmd+P (or Ctrl+P) to save as PDF.");
} catch {
  console.log("Could not auto-open. Please open the file manually in your browser.");
}
