const path = require('path');
const fs = require('fs');
var express = require('express');
var socket = require('socket.io');

const config = require('../config');
var AudioManager = require('../classes/audio_manager');
var audioUploadHelper = require('../classes/audio_upload_helper');

var router = express.Router();
var audioManager = new AudioManager();
var io = socket();
var soundPath = '../audio/sound.mp3';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Gruh', main: true, info: config});
});

/* GET microphone page */
router.get('/you', function(req, res, next) {
  res.render('index', { title: 'Gruh (Your Voice)', main: false, info: config});
});

/* POST audio file to check size & length */
router.post('/audio.check', function(req, res, next) {
  // End if either parameter is null
  audioUploadHelper.processUploadCheckReq(req, (response)=>{
    if (response.success) {
      res.send(response);
    } else {
      res.status(400).send(response);
    }
  })
});

/* POST audio file for upload to database; also return analytics tracker */
router.post('/audio-upload', function(req, res, next) {
  
});

/* GET public files from server */
router.get('/file', function(req, res, next) {
  // Make sure directory is either audio or models
  if (req.query.directory !== 'models' && req.query.directory !== 'audio') {
    res.status(403).send('Only files in the audio and models paths are accessible')
  }

  let fileName = '/' + req.query.directory + '/' + req.query.name;
  res.sendFile(fileName, { root: config.root});
});

io.on('connect', (socket) => {
  console.log(`${socket.id} has connected`);
  // immediately emit current sound at correct time
  audioManager.sendSoundSocket(socket);
});

function sendSound() {
  // Get path to sound file
  // var paths = ['/../audio/sound.mp3', '/../audio/sound2.mp3', '/../audio/dirty_baby.mp3', '/../audio/jude_laughing.mp3'];
  // soundPath = paths[Math.floor(Math.random()*paths.length)];

  // Override
  soundPath = '/../audio/jude_laughing.mp3';

  audioManager.startPlaying(soundPath, io);
  audioManager.on('end', ()=>{
    setTimeout(()=>{
      sendSound()
    }, 7000);
  });
}

function blinkEye(eye) {
  io.emit('blinkEye'+eye, {time: new Date().getTime()});
}

function doBlink() {

  setTimeout(()=>{
    blinkEye('Left');
  }, (Math.random() * 0.2 * 1000));
  setTimeout(()=>{
    blinkEye('Right');
  }, (Math.random() * 0.2 * 1000));

  setTimeout(doBlink, ((Math.random() * 3) +  5) * 1000);
}

doBlink();
sendSound();

router.io = io;

module.exports = router;
