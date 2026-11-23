const fs = require("node:fs");
const vm = require("node:vm");

const context = vm.createContext({
  sh(values) {
    const copy = [...values];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
});

for (const file of ["questions.js", "questions-extra.js", "questions-curated.js"]) {
  vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
}

const questions = vm.runInContext("Q", context);
const seen = new Set();
const categories = new Map();
const errors = [];

questions.forEach((q, index) => {
  const label = `#${index + 1}`;
  if (!Array.isArray(q) || ![5, 6].includes(q.length)) {
    errors.push(`${label}: invalid row shape`);
    return;
  }
  const [category, level, prompt, options, correctIndex] = q;
  if (!category || !prompt || !Array.isArray(options) || options.length !== 4) {
    errors.push(`${label}: missing category, prompt, or four options`);
    return;
  }
  if (new Set(options).size !== 4 || options.some(option => !String(option).trim())) {
    errors.push(`${label}: duplicate or empty options`);
  }
  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) {
    errors.push(`${label}: invalid correct answer index`);
  }
  const key = String(prompt)
    .replace(/[أإآ]/g, "ا")
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .trim();
  if (seen.has(key)) errors.push(`${label}: duplicate question text`);
  seen.add(key);
  categories.set(category, (categories.get(category) || 0) + 1);
});

if (errors.length) {
  console.error(errors.slice(0, 30).join("\n"));
  console.error(`Validation failed: ${errors.length} issue(s) across ${questions.length} questions.`);
  process.exit(1);
}

console.log(`Validated ${questions.length} questions across ${categories.size} categories.`);
for (const [category, count] of [...categories].sort((a, b) => b[1] - a[1])) {
  console.log(`- ${category}: ${count}`);
}
