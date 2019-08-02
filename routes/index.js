const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
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

// Initialize firebase app
const serviceAccount = config.private.root + '/gruh-firebase-admin-privkey.json';
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://gruh-a1cf9.firebaseio.com',
  storageBucket: 'gruh-a1cf9.appspot.com'
});

// Share admin with helper classes
audioUploadHelper.setAdmin(admin);
AudioManager.setAdmin(admin);
UploadClient.setAdmin(admin);


/* GET home page. */
router.get('/', function(req, res, next) {
  let renderData = { title: 'Gruh', main: true, info: config.getPublic()};

  // Check for client id (recently made purchase)
  if (req.cookies.clientId) {
    let id = req.cookies.clientId;
    console.log(`Client returning: ${id}`);

    // If purchase was unsuccessful, destroy client
    // Otherwise, load the page with a message and the aId of the client
    if (req.query.purchase_success === 'false') {
      audioUploadHelper.destroyClient(req.cookies.clientId);

      // Reset cookie
      res.clearCookie('clientId');
    } else {
      // Get client
      let client = audioUploadHelper.getClientById(id);

      // If the client exists set render data
      // Otherwise, clear cookies
      // Client will confirm that they have seen the message to clear the cookie in a request to /clearclient?client_id
      if (client) {
        // Make sure client has completed purchase
        if (client.wasCompleted) {
          // Set data to show client
          renderData.info.isClient = true;
          renderData.info.analyticsIdentifier = client.aId;
          renderData.info.clientId = client.id;
        }
      } else {
        res.clearCookie('clientId');
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
          amount: Math.floor(response.price * 100),
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


/* POST request current audio from server */
router.post('/current_audio', function(req, res, next) {
  // res.sendFile('/audio/current_audio.mp3', { root: config.private.root });

  // Send file as data url (base 64)
  res.send({
    b64: fs.readFileSync(config.private.root + '/audio/current_audio.mp3', { encoding: 'base64' })
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


/* POST clear client after message delivered */
router.post('/clearclient', function(req, res, next) {
  if (req.body.clientId) {
    // Destroy client
    let success = audioUploadHelper.destroyClient(req.body.clientId);

    // Reset cookie
    res.clearCookie('clientId');

    res.send({success: success});
  } else {
    res.status(400).send({success: false, error: 'Missing client id'});
  }
});


/* API (Offsite requests) */

// POST retrieve analytics
router.post('/api/analytics', function(req, res, next) {
  if (req.body.analytics_id) {
    let id = req.body.analytics_id;
    AudioManager.getAnalytics(id,
      (data) => {
        res.send(data)
      },
      () => {
        res.status(400).send({message: 'Invalid analytics identifier'});
      }
    );
  } else {
    res.status(400).send({message: 'Missing analytics identifier'});
  }
});

// GET retrieve analytics
router.get('/api/analytics', function(req, res, next) {
  if (req.query.analytics_id) {
    let id = req.query.analytics_id;
    AudioManager.getAnalytics(id,
      (data) => {
        res.send(data)
      },
      () => {
        res.status(400).send({message: 'Invalid analytics identifier'});
      }
    );
  } else {
    res.status(400).send({message: 'Missing analytics identifier'});
  }
});


/* SOCKET.IO SETUP */

// Track number of clients
var clientCount = 0;

// Socket connection
io.on('connect', (socket) => {
  console.log(`${socket.id} has connected`);
  clientCount++;
  // immediately emit current sound at correct time
  audioManager.sendSoundSocket(socket);

  socket.on('disconnect', ()=>{
    clientCount--;
  });
});

// Set up sound intervals
function sendSoundFile() {
  // File
  soundPath = '/../audio/default.mp3';

  audioManager.setAudioFromFile(soundPath);
  audioManager.startPlaying(io);
  audioManager.on('end', ()=>{
    io.emit('stopSound');
    setTimeout(()=>{
      sendSoundFile()
    }, (Math.random() * 5 + 5) * 1000);
  });
}

function sendSoundFirebase() {
  audioManager.setAudioFromStorage((aId)=>{
    audioManager.startPlaying(io);
    audioManager.on('end', ()=>{
      io.emit('stopSound');
      setTimeout(()=>{
        sendSoundFirebase();
      }, (Math.random() * 5 + 5) * 1000);
    });

    // Increment analytics
    AudioManager.updateTimesPlayed(aId, 1);
    AudioManager.updateTimesHeard(aId, clientCount);
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
sendSoundFirebase();

router.io = io;

module.exports = router;
