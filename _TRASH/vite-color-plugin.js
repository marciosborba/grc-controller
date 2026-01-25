// Vite plugin to handle color updates during development
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export function colorUpdaterPlugin() {
  return {
    name: 'color-updater',
    configureServer(server) {
      // Handle static colors update endpoint
      server.middlewares.use('/api/update-static-colors', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });

        req.on('end', async () => {
          try {
            const { cssContent, palette } = JSON.parse(body);
            
            if (!cssContent) {
              res.statusCode = 400;
              res.end('CSS content is required');
              return;
            }

            const scriptPath = path.join(process.cwd(), 'scripts', 'update-static-colors.js');
            const command = `node "${scriptPath}" "${cssContent.replace(/"/g, '\\"')}"`;
            
            const { stdout, stderr } = await execAsync(command);
            
            if (stderr) {
              console.warn('Script stderr:', stderr);
            }
            
            console.log('Color update result:', stdout);
            
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              success: true, 
              message: 'Cores aplicadas automaticamente!',
              output: stdout 
            }));
            
            // Trigger HMR reload of the CSS file
            const module = server.moduleGraph.getModuleById('/src/styles/static-colors.css');
            if (module) {
              server.reloadModule(module);
            }
            
          } catch (error) {
            console.error('Error updating colors:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              success: false, 
              error: error.message 
            }));
          }
        });
      });

      // Keep old endpoint for backward compatibility
      server.middlewares.use('/api/update-colors', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });

        req.on('end', async () => {
          try {
            const paletteData = JSON.parse(body);
            const scriptPath = path.join(process.cwd(), 'scripts', 'update-colors.js');
            const paletteJson = JSON.stringify(paletteData);
            
            // Execute the update script
            const command = `node "${scriptPath}" '${paletteJson}'`;
            const { stdout, stderr } = await execAsync(command);
            
            if (stderr) {
              console.warn('Script stderr:', stderr);
            }
            
            console.log('Color update result:', stdout);
            
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              success: true, 
              message: 'Cores atualizadas com sucesso!',
              output: stdout 
            }));
            
            // Trigger HMR reload of the CSS file
            const module = server.moduleGraph.getModuleById('/src/styles/static-colors.css');
            if (module) {
              server.reloadModule(module);
            }
            
          } catch (error) {
            console.error('Error updating colors:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              success: false, 
              error: error.message 
            }));
          }
        });
      });
    }
  };
}