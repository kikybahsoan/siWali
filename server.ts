import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

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
  // Safely proxies requests to Google Apps Script Web App without CORS issues or uncaught exceptions
  const DEFAULT_APP_SCRIPT_URL =
    'https://script.google.com/macros/s/AKfycbwyFanvCA1kSeZ8_jKEQSmDmlggpuGdcJEN29kCsM8a4QNiH6Sf3mqLIId2Ipfa_XJK/exec';

  app.all('/api/sheets-sync', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    try {
      const queryUrl = typeof req.query.url === 'string' ? req.query.url.trim() : '';
      const bodyUrl = req.body && typeof req.body.webAppUrl === 'string' ? req.body.webAppUrl.trim() : '';
      const targetWebAppUrl = queryUrl || bodyUrl || DEFAULT_APP_SCRIPT_URL;

      if (!targetWebAppUrl || !targetWebAppUrl.startsWith('https://script.google.com/macros/s/')) {
        return res.json({
          status: 'unconfigured',
          message: 'URL Google Apps Script belum diatur atau tidak valid.',
        });
      }

      // Helper function to safely parse response as JSON or detect HTML/Errors
      const handleGoogleResponse = async (response: Response) => {
        const status = response.status;
        const text = await response.text();
        const trimmed = text.trim();

        // Detect HTML error pages returned by Google Apps Script / Google Accounts
        const isHtml =
          trimmed.startsWith('<!DOCTYPE') ||
          trimmed.startsWith('<html') ||
          trimmed.startsWith('<HTML') ||
          trimmed.includes('<title>Error') ||
          trimmed.includes('Sign in - Google Accounts');

        if (status === 404 || trimmed.includes('404 Not Found') || trimmed.includes('Error 404')) {
          return {
            status: 'error',
            code: 404,
            message: 'Deployment Web App Google Apps Script tidak ditemukan (HTTP 404). Silakan pastikan Web App sudah dibuat melalui menu "Terapkan (Deploy) > Penerapan Baru" di Google Sheets.',
          };
        }

        if (
          status === 401 ||
          status === 403 ||
          trimmed.includes('Sign in - Google Accounts') ||
          trimmed.includes('ServiceLogin') ||
          trimmed.includes('accounts.google.com')
        ) {
          return {
            status: 'error',
            code: 401,
            message:
              'Akses Google Apps Script terkunci (dialihkan ke login Google). Silakan buka Google Sheets > Ekstensi > Apps Script > Terapkan (Deploy) > Kelola Penerapan > Edit, lalu ubah "Siapa yang memiliki akses" menjadi "Siapa saja" (Anyone).',
          };
        }

        if (isHtml) {
          return {
            status: 'error',
            message: 'Google Apps Script merespon dengan halaman HTML (bukan JSON). Pastikan Web App disetel dengan akses "Siapa saja (Anyone)" dan kode skrip telah disimpan.',
          };
        }

        try {
          const parsed = JSON.parse(trimmed);
          return parsed;
        } catch {
          return {
            status: 'error',
            message: 'Format respon dari Google Apps Script tidak valid.',
            raw: trimmed.slice(0, 150),
          };
        }
      };

      if (req.method === 'GET') {
        const action = (req.query.action as string) || 'fetch_all';
        const sep = targetWebAppUrl.includes('?') ? '&' : '?';
        const fullUrl = `${targetWebAppUrl}${sep}action=${encodeURIComponent(action)}&t=${Date.now()}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
          const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
            redirect: 'follow',
            signal: controller.signal,
          });

          clearTimeout(timeoutId);
          const result = await handleGoogleResponse(response);
          return res.json(result);
        } catch (fetchErr: any) {
          clearTimeout(timeoutId);
          return res.json({
            status: 'error',
            message: `Gagal menghubungi Google Apps Script: ${fetchErr.message || 'Timeout / Jaringan'}`,
          });
        }
      } else {
        // POST request (push all data or push updates)
        let payloadToSend = req.body;
        if (req.body && req.body.payload) {
          payloadToSend = req.body.payload;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
          const response = await fetch(targetWebAppUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'text/plain;charset=utf-8',
            },
            body: typeof payloadToSend === 'string' ? payloadToSend : JSON.stringify(payloadToSend),
            redirect: 'follow',
            signal: controller.signal,
          });

          clearTimeout(timeoutId);
          const result = await handleGoogleResponse(response);
          return res.json(result);
        } catch (fetchErr: any) {
          clearTimeout(timeoutId);
          return res.json({
            status: 'error',
            message: `Gagal mengirim data ke Google Apps Script: ${fetchErr.message || 'Timeout / Jaringan'}`,
          });
        }
      }
    } catch (err: any) {
      return res.json({
        status: 'error',
        message: err.message || 'Terjadi kendala pada proxy sinkronisasi Google Sheets',
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
