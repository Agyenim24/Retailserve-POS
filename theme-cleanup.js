const fs = require('fs');
const path = require('path');

const applyReplaces = (content) => {
  let updated = content;
  
  const replacements = [
    { from: /dark:border-slate-300 dark:border-slate-700\/50/g, to: 'dark:border-slate-700/50' },
    { from: /dark:text-slate-500 dark:text-slate-400/g, to: 'dark:text-slate-400' },
    { from: /dark:text-slate-700 dark:text-slate-300/g, to: 'dark:text-slate-300' },
    { from: /dark:text-slate-400 dark:text-slate-500/g, to: 'dark:text-slate-500' },
    { from: /dark:hover:bg-slate-200 dark:hover:bg-slate-600/g, to: 'dark:hover:bg-slate-600' },
    { from: /dark:bg-slate-100 dark:bg-slate-700\/50/g, to: 'dark:bg-slate-700/50' },
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
        console.log('Fixed:', fullPath);
      }
    }
  });
}

walk('./pages');
walk('./components');
