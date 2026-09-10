import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const DEFAULT_SHEETS_WEB_APP_URL =
  'https://script.google.com/macros/s/AKfycbz8odQurm_YBWJVhMglT8z4NH9d1OO9odFL37laRn9l8mWTn1BpAGiWx_ias0X5606YtQ/exec';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON and URL-encoded bodies
  app.use(express.json({ limit: '25mb' }));
  app.use(express.text({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Google Sheets Sync Server-Side Proxy Endpoint
  // Completely eliminates browser CORS, iframe redirect blocks, and connection dropouts
  app.all('/api/sheets-sync', async (req, res) => {
    try {
      const queryUrl = typeof req.query.url === 'string' ? req.query.url.trim() : '';
      const bodyUrl = req.body && typeof req.body.webAppUrl === 'string' ? req.body.webAppUrl.trim() : '';
      const targetWebAppUrl = queryUrl || bodyUrl || DEFAULT_SHEETS_WEB_APP_URL;

      if (!targetWebAppUrl.startsWith('https://script.google.com/')) {
        return res.status(400).json({
          status: 'error',
          message: 'URL Google Apps Script tidak valid.',
        });
      }

      if (req.method === 'GET') {
        const action = (req.query.action as string) || 'fetch_all';
        const sep = targetWebAppUrl.includes('?') ? '&' : '?';
        const fullUrl = `${targetWebAppUrl}${sep}action=${encodeURIComponent(action)}&t=${Date.now()}`;

        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Google Apps Script merespon dengan status ${response.status}`);
        }

        const data = await response.json();
        return res.json(data);
      } else {
        // POST request (push all or push student)
        let payloadToSend = req.body;
        if (req.body && req.body.payload) {
          payloadToSend = req.body.payload;
        }

        const response = await fetch(targetWebAppUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: typeof payloadToSend === 'string' ? payloadToSend : JSON.stringify(payloadToSend),
        });

        if (!response.ok) {
          throw new Error(`Google Apps Script merespon HTTP ${response.status} saat menyimpan data`);
        }

        const data = await response.json();
        return res.json(data);
      }
    } catch (err: any) {
      console.error('Error in /api/sheets-sync:', err);
      return res.status(500).json({
        status: 'error',
        message: err.message || 'Gagal terhubung ke Google Apps Script',
      });
    }
  });

  // Vite middleware for development or static file serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server siWali running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
