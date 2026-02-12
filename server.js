// Custom server for Hostinger Node.js hosting
// This file is the entry point for Passenger/LiteSpeed
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const path = require("path");

const dev = false;
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT, 10) || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  }).listen(port, hostname, () => {
    console.log(`> SecureCodeReviews ready on http://${hostname}:${port}`);
  });
});
