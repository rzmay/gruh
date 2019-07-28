const path = require('path');
const fs = require('fs');
var express = require('express');
var socket = require('socket.io');

require('dotenv').config();

const keyPublishable = process.env.PUBLISHABLE_KEY;
const keySecret = process.env.SECRET_KEY;
const stripe = require('stripe')(process.env.STRIPE_SK_TEST);

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

/* POST audio file for upload to database */
router.post('/audio.upload', function(req, res, next) {
  // Get upload data
  audioUploadHelper.processUploadCheckReq(req, (response)=>{
    if (response.success) {
      // Create session
      stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          name: 'Upload Audio to Gruh',
          description: `Upload ${response.duration/1000} seconds of audio (${response.size} MB) to the Gruh Zone database`,
          images: ['https://www.gruhzone.com/gruh.png'],
          amount: response.price * 100,
          currency: 'usd',
          quantity: 1,
        }],
        success_url: 'https://www.gruhzone.com/?upload=true&tracker=unavailable',
        cancel_url: 'https://www.gruhzone.com',
      })
        .then((session)=>{
          res.send(session)
        });
    } else {
      res.status(400).send(response)
    }
  });
});

/* GET audio files from server */
router.get('/audio', function(req, res, next) {
  // Make sure file is in audio
  fs.readdir('./audio', function(err, items) {
    if (!items.includes(req.query.name)) {
      res.status(403).send(`${req.query.name} File is not in permitted directory`)
    }

    let fileName = `/audio/${req.query.name}`;
    res.sendFile(fileName, { root: config.root});
  });
});

/* GET models from server */
router.get('/model', function(req, res, next) {
  // Make sure file is in models
  fs.readdir('./models', function(err, items) {
    if (!items.includes(req.query.name)) {
      res.status(403).send(`${req.query.name} File is not in permitted directory`)
    }

    let fileName = `/models/${req.query.name}`;
    res.sendFile(fileName, {root: config.root});
  });
});

/* GET videos from server */
router.get('/video', function(req, res, next) {
  // Make sure file is in models
  fs.readdir('./videos', function(err, items) {
    if (!items.includes(req.query.name)) {
      res.status(403).send(`${req.query.name} File is not in permitted directory`)
    }

    let fileName = `/videos/${req.query.name}`;
    res.sendFile(fileName, {root: config.root});
  });
});

/* GET gruh image */
router.get('/gruh.png', function(req, res, next) {
  res.sendFile('/images/gruh.png', {root: config.root});
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
