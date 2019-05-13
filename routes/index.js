const path = require('path');
const fs = require('fs');
var express = require('express');
var socket = require('socket.io');


var AudioManager = require('../classes/audio_manager.js');

var router = express.Router();
var audioManager = new AudioManager();
var io = socket();
var soundPath = '../audio/sound.mp3';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

io.on('connect', (socket) => {
  console.log(`${socket.id} has connected`);
  // immediately emit current sound at correct time
  audioManager.sendSoundSocket(socket);
});

function sendSound() {
  // Get path to sound file
  console.log('sendSound call');
  var paths = ['/../audio/sound.mp3', '/../audio/sound2.mp3', '/../audio/dirty_baby.mp3', '/../audio/jude_laughing.mp3'];
  soundPath = paths[Math.floor(Math.random()*paths.length)];

  // Override
  // soundPath = '/../audio/mohonga.mp3';

  audioManager.startPlaying(soundPath, io);
  audioManager.on('end', ()=>{
    setTimeout(()=>{
      console.log('sendSound over');
      sendSound()
    }, 7000);
  });
}

function doBlink() {
  function blinkEye(eye) {
    io.emit('blinkEye'+eye);
  }

  setTimeout(()=>{blinkEye('Left')}, (Math.random() * 0.2 * 1000));
  setTimeout(()=>{blinkEye('Right')}, (Math.random() * 0.2 * 1000));

  setTimeout(doBlink, ((Math.random() * 3) +  5) * 1000);
}

doBlink();
sendSound();

router.io = io;

module.exports = router;
