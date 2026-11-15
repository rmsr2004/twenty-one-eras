const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT) || 8000;
const ROOT = __dirname;

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function isHidden(relativePath) {
  return relativePath.split('/').some((part) => part.startsWith('.'));
}

function resolveRequestedFile(requestUrl) {
  const { pathname } = new URL(requestUrl, `http://${HOST}`);
  const relativePath = decodeURIComponent(pathname).replace(/\/$/, '/index.html');
  const filePath = path.join(ROOT, relativePath);

  const isInsideProject = filePath.startsWith(ROOT + path.sep);
  return isInsideProject && !isHidden(relativePath) ? filePath : null;
}

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end(message);
}

async function handleRequest(request, response) {
  let filePath;
  try {
    filePath = resolveRequestedFile(request.url);
  } catch {
    sendText(response, 400, 'Bad request');
    return;
  }

  if (!filePath) {
    sendText(response, 403, 'Forbidden');
    return;
  }

  try {
    const content = await fs.readFile(filePath);
    const contentType = CONTENT_TYPES[path.extname(filePath)] ?? 'application/octet-stream';
    response.writeHead(200, { 'Content-Type': contentType });
    response.end(content);
  } catch {
    sendText(response, 404, 'Not found');
  }
}

http.createServer(handleRequest).listen(PORT, HOST, () => {
  console.log(`twenty one eras running at http://localhost:${PORT}`);
});
