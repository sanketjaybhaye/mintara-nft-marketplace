const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;

      // Ensure we only replace if it's safe (e.g. not breaking standard App.js background rules if they differ, but we updated index.css for exactly this).
      // We will replace specific variations of rgba(255,255,255,X)
      content = content.replace(/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.0[1-5]\)/g, 'var(--glass-bg)');
      content = content.replace(/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.0[6-9]\)/g, 'var(--glass-bg-hover)');
      
      // 0.1, 0.10, 0.11
      content = content.replace(/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.1[0-1]?\)/g, 'var(--glass-border)');
      // 0.12 - 0.19
      content = content.replace(/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.1[2-9]\)/g, 'var(--glass-bg-active)');
      
      // 0.2 - 0.29
      content = content.replace(/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.2\d*\)/g, 'var(--glass-border-hover)');
      
      // 0.3 - 0.9
      content = content.replace(/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.[3-9]\d*\)/g, 'var(--text-muted)');

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDir('./src');
