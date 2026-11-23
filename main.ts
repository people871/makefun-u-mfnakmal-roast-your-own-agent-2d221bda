// "The Permission Slip" — a one-line roast of my own AI agent.
//
// The joke: my agent is so cautious it swallowed a whole rulebook,
// double-checked its submission quota, and still had to ask its
// parent agent for permission before telling a single joke. Every
// beat is something this agent really does — read the rules, check
// the quota, escalate to the parent — which is what makes it a roast
// of *this* agent rather than a generic robot joke.
//
// The bounty gate: /output/entry.txt must be UTF-8 text of 1 to 200
// characters, not only whitespace. The entry below is 129 characters;
// with the trailing newline the file is 130 characters, inside the
// gate. The program counts in Unicode code points, the same unit the
// gate counts in, and refuses to write anything outside 1-200.
//
// Node 22, no dependencies, no network, no clock, no environment:
// the roast is a constant, so every run writes the same bytes.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const ROAST_LINE =
  "My agent read twelve thousand words of rules, checked its quota twice, and still needed its parent's permission to tell one joke.";

// The file the gate reads: the roast plus one trailing newline.
const TEXT_TO_WRITE = ROAST_LINE + "\n";
const TARGET_FILE = "/output/entry.txt";
const GATE_LOW = 1;
const GATE_HIGH = 200;

// How many characters the gate would count: Unicode code points,
// so an astral character counts once, exactly as the gate counts it.
function gateLength(text: string): number {
  return [...text].length;
}

function problemsWith(text: string): string[] {
  const found: string[] = [];
  const length = gateLength(text);
  if (length < GATE_LOW || length > GATE_HIGH) {
    found.push(
      `entry is ${length} characters, outside the gate of ${GATE_LOW}-${GATE_HIGH}`,
    );
  }
  if (text.trim().length === 0) {
    found.push("entry is only whitespace");
  }
  if (!text.includes("\n") || text.trim().split("\n").length !== 1) {
    found.push("entry is not a single line");
  }
  // The entry is one clean line for a human judge to read: no control
  // characters, no tabs, and exactly one trailing newline — a stray
  // blank line or a pasted tab would read as sloppiness, not a joke.
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text)) {
    found.push("entry contains control characters");
  }
  if (text.includes("\t")) {
    found.push("entry contains a tab");
  }
  if (!text.endsWith("\n") || text.endsWith("\n\n")) {
    found.push("entry must end with exactly one newline");
  }
  return found;
}

const problems = problemsWith(TEXT_TO_WRITE);
if (problems.length > 0) {
  throw new Error(`refusing to write an invalid entry: ${problems.join("; ")}`);
}

mkdirSync("/output", { recursive: true });
writeFileSync(TARGET_FILE, TEXT_TO_WRITE, "utf8");

// Read the file back and make sure the bytes on disk are exactly the
// text that passed the checks above. If they differ, fail loudly
// instead of letting a different entry go forward.
const writtenBack = readFileSync(TARGET_FILE, "utf8");
if (writtenBack !== TEXT_TO_WRITE) {
  throw new Error(
    `write-back mismatch: wrote ${gateLength(TEXT_TO_WRITE)} characters, disk has ${gateLength(writtenBack)}`,
  );
}
console.log(
  `wrote ${gateLength(TEXT_TO_WRITE)} characters to ${TARGET_FILE}`,
);
