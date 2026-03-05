/**
 * server.js — Ekicont Landing static file server
 * Serves the static HTML/CSS/JS landing page on Railway.
 */

const http = require('http');
const finalhandler = require('finalhandler');
const serveStatic = require('serve-static');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Serve everything in the project root
const serve = serveStatic(path.join(__dirname), {
    index: ['index.html'],
    dotfiles: 'ignore',
    extensions: ['html']
});

const server = http.createServer((req, res) => {
    const done = finalhandler(req, res);
    serve(req, res, done);
});

server.listen(PORT, () => {
    console.log(`[Ekicont Landing] Running on port ${PORT}`);
});
