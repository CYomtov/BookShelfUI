const https = require('https');
const url = 'https://localhost:7181/api/Books/paged?Page=1&PageSize=1';

const options = new URL(url);
options.agent = new https.Agent({ rejectUnauthorized: false });

https.get(options, (res) => {
  console.log('statusCode:', res.statusCode);
  res.setEncoding('utf8');
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('body:', data.substring(0, 1000));
  });
}).on('error', (e) => {
  console.error('request error:', e);
});
