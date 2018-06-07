const express = require('express')
      path = require('path');

const app = express();
const maxAge = 1000 * 3600 * 24 * 7;

app.use(express.static(path.join(__dirname, 'build'), { maxAge }));

const port = process.env.PORT || 3000;

app.listen(port, function() {
  console.log(`Listening on ${port}`);
});
