const path = require('path');
const fs = require('fs');
var express = require('express');
var socket = require('socket.io');

require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SK);

const config = require('../config');
var UploadClient = require('../classes/upload_client');
var AudioManager = require('../classes/audio_manager');
var audioUploadHelper = require('../classes/audio_upload_helper');

var router = express.Router();
var audioManager = new AudioManager();
var io = socket();
var soundPath = '../audio/sound.mp3';

/* GET home page. */
router.get('/', function(req, res, next) {
  let renderData = { title: 'Gruh', main: true, info: config.getPublic()};

  // Check for client id (recently made purchase)
  console.log(req.cookies);
  if (req.cookies.clientId) {
    let id = req.cookies.clientId;

    // If purchase was unsuccessful, destroy client
    // Otherwise, load the page with a message and the aId of the client
    if (req.query.purchase_success === 'false') {
      audioUploadHelper.destroyClient(req.cookies.clientId);

      // Reset cookie
      res.cookie('clientId', null);
    } else {
      // Get client
      let client = audioUploadHelper.getClientById(id);
      console.log(client);

      // If the client exists set render data
      // Otherwise, clear cookies
      // Client will confirm that they have seen the message to clear the cookie in a request to /clearclient?client_id
      if (client) {
        // Make sure client has completed purchase
        if (client.wasCompleted) {
          // Set data to show client
          renderData.info.isClient = true;
          renderData.info.analyticsId = client.aId;
          renderData.info.clientId = client.id;
        }
      } else {
        res.cookie('clientId', null);
      }
    }
  }

  // Render page
  res.render('index', renderData);
});

/* GET microphone page */
router.get('/you', function(req, res, next) {
  res.render('index', { title: 'Gruh (Your Voice)', main: false, info: config.getPublic()});
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
      // Round numbers
      let duration = Number((response.duration/1000).toFixed(1));
      let size = Number((response.size).toFixed(3));

      // Create upload client
      let client = audioUploadHelper.registerClient(req.body.b64, req.body.frequencyMultiplier, null);

      // Create session
      stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          name: 'Gruh Zone Upload',
          description: `Upload audio file to Gruh\'s database (${duration} sec, ${size} MB)`,
          images: ['https://www.gruhzone.com/gruh.png'],
          amount: response.price * 100,
          currency: 'usd',
          quantity: 1,
        }],
        success_url: 'https://www.gruhzone.com?purchase_success=true',
        cancel_url: 'https://www.gruhzone.com?purchase_success=false',
      }).then((session)=>{
        // Set client session
        client.setSession(session);

        // Send response, set cookie
        response.session = session;
        res.cookie('clientId', client.id);
        res.send(response);
      });
    } else {
      res.status(400).send(response)
    }
  });
});

/* POST clear client after message delivered */
router.post('/clearclient', function(req, res, next) {
  if (req.body.client_id) {
    // Destroy client
    let success = audioUploadHelper.destroyClient(req.body.client_id);

    // Reset cookie
    res.cookie('clientId', null);

    res.send({success: success});
  } else {
    res.status(400).send({success: false, error: 'Missing client id'});
  }
});

/* GET audio files from server */
router.get('/audio', function(req, res, next) {
  // Make sure file is in audio
  fs.readdir('./audio', function(err, items) {
    if (!items.includes(req.query.name)) {
      res.status(403).send(`${req.query.name} File is not in permitted directory`)
    }

    let fileName = `/audio/${req.query.name}`;
    res.sendFile(fileName, { root: config.private.root});
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
    res.sendFile(fileName, {root: config.private.root});
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
    res.sendFile(fileName, {root: config.private.root});
  });
});

/* GET gruh image */
router.get('/gruh.png', function(req, res, next) {
  res.sendFile('/images/gruh.png', {root: config.private.root});
});

/* STRIPE SESSION COMPLETION */

/* POST Stripe payment webhook */
router.post('/stripe_webhook', function(req, res, next) {
  let event = req.body;

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      audioUploadHelper.onSessionCompleted(event.data.object);
      break;
    default:
      // Unexpected event type
      return res.status(400).end();
  }

  // Return a response to acknowledge receipt of the event
  res.json({received: true});
});


/* Socket.io Setup */

// Socket connection
io.on('connect', (socket) => {
  console.log(`${socket.id} has connected`);
  // immediately emit current sound at correct time
  audioManager.sendSoundSocket(socket);
});

// Set up sound intervals
function sendSound() {
  // Override
  soundPath = '/../audio/jude_laughing.mp3';

  audioManager.startPlaying(soundPath, io);
  audioManager.on('end', ()=>{
    setTimeout(()=>{
      sendSound()
    }, 7000);
  });
}

// Set up blink intervals
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

// Begin intervals
doBlink();
sendSound();

router.io = io;

module.exports = router;
