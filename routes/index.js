const express = require('express');
const randomString = require('randomstring');
const router = express.Router();
const path = require('path');

/* GET Models */
router.get('/asset/model/:model', (req, res) => {
  switch (req.params.model) {
    case 'gruh':
      res.sendFile('gruh.glb', { root: path.join(__dirname, '../assets') });
      break;
    default:
      res.send(new Error(`Unexpected model request: ${req.params.model}`));
  }
});


/* GET Home Page */
router.get('/*', (req, res) => {
  res.sendFile('index.html', { root: path.join(__dirname, '../dist') });
});

/* POST Upload Audio */
router.post('/upload', (req, res) => {
  if (req.files == null) {
    res.status(400).json({ msg: 'No file uploaded' });
    return;
  }

  const { file } = req.files;
  const name = randomString.generate({ length: 8, charset: 'alphabetic', capitalization: 'uppercase' });
  file.mv(`${__dirname}/../assets/audio/${name}`, (err) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      res.json({ success: true, id: name });
    }
  });
});

module.exports = router;
