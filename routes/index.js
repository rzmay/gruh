const express = require('express');
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

module.exports = router;
