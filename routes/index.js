var express = require('express');
const path = require("path");
var socket = require('socket.io');
var fs = require('fs');

const { getAudioDurationInSeconds } = require('get-audio-duration');

var router = express.Router();

function base64_encode(file) {
  // read binary data
  var bitmap = fs.readFileSync(path.resolve(__dirname, file));
  // convert binary data to base64 encoded string
  return new Buffer(bitmap).toString('base64');
}

var soundPath = '../audio/sound.mp3';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var io = socket();

io.on('connect', (socket) => {
  console.log(`${socket.id} has connected`)
});

function sendSound() {
  var paths = ['../audio/sound.mp3', '../audio/sound2.mp3'];
  soundPath = paths[Math.floor(Math.random()*paths.length)];

  // Override
  soundPath = '../audio/jude_laughing.mp3';

  let b64 = base64_encode(soundPath);
  io.emit('playSound', b64);

  getAudioDurationInSeconds(path.resolve(__dirname, soundPath)).then((duration) => {
    setTimeout(()=>{sendSound()}, 7000 + (duration*1000));
  });
}

function doBlink() {
  function blinkEye(eye) {
    io.emit('blinkEye'+eye);
  }

  setTimeout(()=>{blinkEye('Left')}, (Math.random() * 0.2 * 1000));
  setTimeout(()=>{blinkEye('Right')}, (Math.random() * 0.2 * 1000));

  console.log(((Math.random() * 2) +  3) * 1000);
  setTimeout(doBlink, ((Math.random() * 3) +  5) * 1000);
}

doBlink();
sendSound();

router.io = io;

module.exports = router;
