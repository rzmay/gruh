const MerchTag = require('./classes/merch_tag');

let config = {
	'root': __dirname,
	'permittedFrequencyMultipliers': [
		1,
		2,
		5,
		10
	],
	'maxFileSize': 1,
	'maxAudioDuration': 15000,
	credits: [
		{
			name: 'Robert May',
			page: 'https://github.com/robertmay2003',
			role: 'Backend, Sound design, Graphics'
		},
		{
			name: 'Thomas Shaw',
			page: 'https://github.com/printer83mph',
			role: 'Graphics'
		},
		{
			name: 'Kevin MacLeod',
			page: 'https://incompetech.com/',
			role: 'Music',
			license: 'Available under the Creative Commons Attribution 3.0 Unported license',
			licenseURL: 'https://creativecommons.org/licenses/by/3.0/'
		}
	]
};

config.featuredMerch = [
	new MerchTag(
		'https://vangogh.teespring.com/v3/image/QNq9ZFCh5ZB4k-C5U27pIHzzTG0/480/560.jpg',
		'3D Gruh v1',
		'The funnyman meets the third dimension',
		'https://teespring.com/3d-gruh-v1'
	).compressed(),
	new MerchTag(
		'https://vangogh.teespring.com/v3/image/w1s7RNLIj_joNsS2dsmjlzcOWDM/480/560.jpg',
		'Great Hawk Gruh',
		'The classic funnyman takes to the skies!',
		'https://teespring.com/great-hawk-gruh'
	).compressed(),
	new MerchTag(
		'https://vangogh.teespring.com/v3/image/TRDFLT6Y6gL57ULYZFJMtA--7aM/480/560.jpg',
		'Base & Dark Gruh',
		'Original funnyman on the front, dark secrets of a darker past on the back.',
		'https://teespring.com/base-dark-gruh'
	).compressed(),
	new MerchTag(
		'https://vangogh.teespring.com/v3/image/RBnqkCwsErLgpraeENQ0PctNGxo/480/560.jpg',
		'Bold Gruh',
		'Represent the funnyman with pride.',
		'https://teespring.com/bold-gruh'
	).compressed()
];


config.description = 'Gruh is an project inspired by ideas of censorship,' +
	' free speech, and the role that perspective plays in the way we perceive' +
	' the opinions of others.\n' +
	' Our culture is often quick to judge the arguments' +
	' of others, not by the validity and strength of their evidence and reasoning, but by' +
	' the experience or lack thereof that we assume they have due to their personal' +
	' histories. Persuasive and well-crafted arguments are too often dismissed due to' +
	' no reason other than one\'s conscious or subconscious personal prejudices.\n' +
	' Gruh is a platform on which anyone can speak their mind with anonymity' +
	' through a 15 second audio file. Whether they choose to tell a joke or voice their' +
	' opinion, individuals can share whatever they like without fear of consequences or' +
	' censorship. Whatever the ideas of the general public may be, they can be made known' +
	' through the lifeless tongue of Gruh.';

config.shortDescription = 'Gruh is a platform on which you can exercise your right of' +
	' free speech by uploading any audio file for Gruh to say with complete anonymity.';

module.exports = config;