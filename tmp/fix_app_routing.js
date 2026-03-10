const fs = require('fs');
const path = 'c:/Users/marci/grc/grc-controller/src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

// Update root index
const oldRoot = '<Route index element={<Navigate to="/dashboard" replace />} />';
const newRoot = '<Route index element={<RootRedirect />} />';
content = content.replace(oldRoot, newRoot);

// Update dashboard guard
const oldGuard = '<ModuleGuard moduleKey="dashboard">';
const newGuard = '<ModuleGuard moduleKey="dashboard" redirectTo="/notifications">';
content = content.replace(oldGuard, newGuard);

fs.writeFileSync(path, content);
console.log('App.tsx updated successfully!');
