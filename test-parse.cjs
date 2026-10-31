const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/gemini-parse',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log(data));
});

req.write(JSON.stringify({
  imageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  prompt: 'Phân tích hóa đơn này'
}));
req.end();
