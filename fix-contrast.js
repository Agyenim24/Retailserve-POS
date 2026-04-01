const fs = require('fs');
const path = require('path');

const fileFixes = [
  // 1. Pale gray text in light mode -> darker gray
  { match: /text-slate-400 dark:text-slate-400/g, replace: 'text-slate-500 dark:text-slate-400' },
  // 2. Sometimes people use `text-slate-400` alone for subtitles, make it 500
  // but let's only do it if it's not followed by a dark modifier.
  { match: /text-slate-400(?!\s*dark:)/g, replace: 'text-slate-500 dark:text-slate-400' },
  // 3. Any text-slate-300 should be darker in light mode
  { match: /text-slate-300 dark:text-slate-300/g, replace: 'text-slate-500 dark:text-slate-300' },
  { match: /text-slate-300(?!\s*dark:)/g, replace: 'text-slate-500 dark:text-slate-300' },
  // 4. Any rogue text-slate-200 without a dark modifier (we fixed one, maybe there are more)
  // { match: /text-slate-200(?!\s*dark:)/g, replace: 'text-slate-800 dark:text-slate-200' }, it's too risky because of dark:text-slate-200 could be matched if the lookahead fails due to being earlier in the class string. Actually, "text-slate-200 dark:text-slate-500" would fail. It's safer to avoid this broad lookahead. Let's just do it manually.
];

function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      // Specifically target the fixed pattern
      content = content.replace(/text-slate-400 dark:text-slate-400/g, 'text-slate-500 dark:text-slate-400');
      // Fix instances where it's text-slate-400 followed by " on strings or backticks, or spaces at the end of className
      content = content.replace(/text-slate-400"/g, 'text-slate-500 dark:text-slate-400"');
      content = content.replace(/text-slate-400'/g, "text-slate-500 dark:text-slate-400'");
      content = content.replace(/text-slate-400\s+"/g, 'text-slate-500 dark:text-slate-400"');
      content = content.replace(/text-slate-400\s+'$/g, 'text-slate-500 dark:text-slate-400\'');

      content = content.replace(/text-slate-300 dark:text-slate-300/g, 'text-slate-500 dark:text-slate-300');
      content = content.replace(/text-slate-300"/g, 'text-slate-500 dark:text-slate-300"');
      content = content.replace(/text-slate-300'/g, "text-slate-500 dark:text-slate-300'");

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log('Fixed:', fullPath);
      }
    }
  }
}

processDir('./pages');
processDir('./components');
console.log('Done fixing contrast!');
