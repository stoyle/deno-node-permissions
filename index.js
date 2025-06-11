// A simple proxy server that demonstrates permissions in Node.js and Deno
// Will fail if permissions aren't explicitly granted

// Detect environment
const isDeno = typeof Deno !== 'undefined';

// Main function to start the server
async function startServer() {
  let http, fs, https;
  
  if (isDeno) {
    // Deno imports
    http = await import("node:http");
    https = await import("node:https");
    fs = {
      readFileSync: (path) => new TextDecoder().decode(Deno.readFileSync(path))
    };
  } else {
    // Node.js imports
    http = require('http');
    https = require('https');
    fs = require('fs');
  }

  // Create a simple HTTP server
  const server = http.createServer(async (req, res) => {
    // Read from filesystem - will fail without proper permissions
    const fileContent = fs.readFileSync('./local-file.txt');
    
    // Fetch from example.com - will fail without proper permissions
    const exampleContent = await fetchUrl('https://example.com', https);
    
    // If we get here, both operations succeeded
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write(`File content:\n${fileContent}\n\n`);
    res.write(`Example.com content (first 150 chars):\n${exampleContent.slice(0, 150)}...\n`);
    res.end();
  });

  // Start the server
  const PORT = 3000;
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
  });
}

// Helper function to fetch URL content
function fetchUrl(url, https) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve(data);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Start the server - if this fails, the whole application will crash
startServer();