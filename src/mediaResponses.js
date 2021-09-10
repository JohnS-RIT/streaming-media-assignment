const fs = require('fs'); // pull in the file system module
const path = require('path');

function loadPage(request, response, file, mediaType) {
  fs.stat(file, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        response.writeHead(404);
      }
      return response.end(err);
    }

    let { range } = request.headers;

    if (!range) {
      range = 'bytes=0-';
    }

    const positions = range.replace(/bytes=/, '').split('-');

    let start = parseInt(positions[0], 10);

    const total = stats.size;
    const end = positions[1] ? parseInt(positions[1], 10) : total - 1;

    if (start > end) {
      start = end - 1;
    }

    const chunksize = (end - start) + 1;

    response.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': mediaType,
    });

    const stream = fs.createReadStream(file, { start, end });
    stream.on('open', () => {
      stream.pipe(response);
    });

    stream.on('error', (streamErr) => {
      response.end(streamErr);
    });

    return stream;
  });
}

const getParty = (request, response) => {
  const file = path.resolve(__dirname, '../client/party.mp4');
  loadPage(request, response, file, 'video/mp4');
};

const getBling = (request, response) => {
  const file = path.resolve(__dirname, '../client/bling.mp3');
  loadPage(request, response, file, 'audio/mpeg');
};

const getBird = (request, response) => {
  const file = path.resolve(__dirname, '../client/bird.mp4');
  loadPage(request, response, file, 'video/mp4');
};

module.exports.getParty = getParty;
module.exports.getBling = getBling;
module.exports.getBird = getBird;
