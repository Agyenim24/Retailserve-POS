const fs = require('fs');
const path = require('path');

const applyReplaces = (content) => {
  let updated = content;
  
  // Safe replacements using positive lookbehinds and lookaheads, or just word boundaries.
  // We make sure not to replace if `dark:` is already there. Wait, there is no `dark:` initially in the project.
  
  const replacements = [
    { from: /\btext-white\b/g, to: 'text-slate-900 dark:text-white' },
    { from: /\btext-slate-400\b/g, to: 'text-slate-500 dark:text-slate-400' },
    { from: /\btext-slate-300\b/g, to: 'text-slate-700 dark:text-slate-300' },
    { from: /\btext-slate-500\b/g, to: 'text-slate-400 dark:text-slate-500' },
    { from: /\bborder-slate-700\/50\b/g, to: 'border-slate-200 dark:border-slate-700/50' },
    { from: /\bborder-slate-700\b/g, to: 'border-slate-300 dark:border-slate-700' },
    { from: /\bborder-slate-600\b/g, to: 'border-slate-300 dark:border-slate-600' },
    { from: /\bbg-slate-700\/50\b/g, to: 'bg-slate-100 dark:bg-slate-700/50' },
    { from: /\bhover:bg-slate-600\b/g, to: 'hover:bg-slate-200 dark:hover:bg-slate-600' },
    { from: /\bhover:text-white\b/g, to: 'hover:text-slate-900 dark:hover:text-white' },
    { from: /\bbg-black\/60\b/g, to: 'bg-slate-900/40 dark:bg-black/60' },
  ];

  for (const { from, to } of replacements) {
    updated = updated.replace(from, to);
  }
  
  return updated;
}

const walk = (dir) => {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next')) {
         walk(fullPath);
      }
    } else if (fullPath.endsWith('.js')) {
      const original = fs.readFileSync(fullPath, 'utf8');
      const updated = applyReplaces(original);
      if (original !== updated) {
        fs.writeFileSync(fullPath, updated, 'utf8');
        console.log('Updated:', fullPath);
      }
    }
  });
}

walk('./pages');
walk('./components');
