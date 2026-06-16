const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const ROOT_DIR = __dirname;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.ogg': 'video/ogg',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // 测试路由
    if (req.url === '/test') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ROOT_DIR, __dirname }));
        return;
    }

    if (req.url === '/api/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const apiUrl = new URL(data.endpoint);

                const postData = JSON.stringify({
                    model: data.model,
                    max_tokens: data.max_tokens || 300,
                    messages: data.messages
                });

                // OpenAI格式：/v1/chat/completions
                const requestPath = '/v1/chat/completions';
                console.log('Making request to:', apiUrl.hostname + requestPath);

                const options = {
                    hostname: apiUrl.hostname,
                    port: apiUrl.port || 443,
                    path: requestPath,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${data.apiKey}`,
                        'Content-Length': Buffer.byteLength(postData)
                    },
                    timeout: 120000,
                    rejectUnauthorized: false
                };

                const proxyReq = https.request(options, (proxyRes) => {
                    let responseData = '';
                    proxyRes.on('data', chunk => responseData += chunk);
                    proxyRes.on('end', () => {
                        console.log('API Response status:', proxyRes.statusCode);
                        console.log('API Response body:', responseData.substring(0, 500));
                        res.writeHead(proxyRes.statusCode, { 'Content-Type': 'application/json' });
                        res.end(responseData);
                    });
                });

                proxyReq.on('timeout', () => {
                    console.log('Request timeout');
                    proxyReq.destroy();
                    if (!res.headersSent) {
                        res.writeHead(504, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Request timeout' }));
                    }
                });

                proxyReq.on('error', (error) => {
                    console.error('Proxy error:', error.message);
                    if (!res.headersSent) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: error.message }));
                    }
                });

                proxyReq.write(postData);
                proxyReq.end();
            } catch (error) {
                console.error('Parse error:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
        return;
    }

    // 去掉查询参数并解码URL
    let urlPath;
    try {
        urlPath = decodeURIComponent(req.url.split('?')[0]);
    } catch (e) {
        urlPath = req.url.split('?')[0];
    }
    let filePath = path.join(ROOT_DIR, urlPath === '/' ? 'index.html' : urlPath);
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    console.log('Request URL:', req.url);
    console.log('File path:', filePath);
    console.log('ROOT_DIR:', ROOT_DIR);

    fs.readFile(filePath, (err, content) => {
        if (err) {
            console.log('Error:', err.message);
            res.writeHead(err.code === 'ENOENT' ? 404 : 500);
            res.end(err.code === 'ENOENT' ? 'Not Found' : 'Server Error');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Quiet Space server running at http://localhost:${PORT}`);
});
