import firebaseConfig from './firebase-config.js'

import * as firebase from 'firebase/app';
 
import 'firebase/auth';
import 'firebase/database';

// TypeScript interfaces
/*
interface Pixel {
	uid: string;
	timestamp: number;
	color: string;
}

interface Position {
	x: number;
	y: number;
}
*/

// set loading state
const coolDownTime = 500;
	  
// Define variables
let uid;
let coolCount = 0;
let coolInterval;

// I'm adding 5 seconds before I begin downloading
// all the pixels, but only if the pen is running
// as a thumbnail preview. 
// That way I'm hopefully not using up valuable 
// bandwidth on my Firebase account.
let initWait = location.pathname.match(/fullcpgrid/i) ? 5000 : 0;

// Setup Firebase
firebase.initializeApp(firebaseConfig);

// Check if user is logged in
firebase.auth().onAuthStateChanged(function(user) {
	// set uid based on login state
	uid = user ? user.uid : "";

/*
  	if (user) {
		// set logout button
		authButtonText.innerHTML = 'Logout';

		body.classList.replace('logged-out', 'logged-in');
  	} else {
		// set login button
		authButtonText.innerHTML = 'Login';

		body.classList.replace('logged-in', 'logged-out');
  	}

	authButton.addEventListener('click', toggleLogin);
*/
});

// run stage setup
setupColorOptions();

// start listening for new pixels
setTimeout(startListeners, initWait);

// Auth functions
function login() {
	// Use Twitter for login
	const provider = new firebase.auth.TwitterAuthProvider();
	// Open Twitter auth window
	firebase.auth().signInWithPopup(provider).catch(err => console.log('error logging in', err));
}

function logout() {
	firebase.auth().signOut().catch(err => console.error('error logging out', err));
}

function toggleLogin() {
	if (uid) logout();
	else login();
}

// Write pixel to database functions
function writePixel(x, y, z, color) {
	if (uid) {
		console.log('writing pixel...');

		// First we need to get a valid timestamp.
		// To stop spamming the rules on the database 
		// prevent creating a new timestamp within a 
		// set period.
		getTimestamp().then(timestamp => {
			// we've successfully set a new timestamp.
			// This means the cooldown period is
			// over and the user is free to save
			// their new pixel to the database

			const data = {
				uid: uid,
				timestamp: timestamp,
				color: color
			};

			const currentlyWriting = `${x}x${y}x${z}`;

			return firebase.database().ref(`pixel/${currentlyWriting}`).set(data)
				.then(() => {
					startCoolDown();

					console.log('success!');
				}).catch(_ => {
					// Error here is probably due to the internet
					// connection going down between generating
					// the timestamp and saving the pixel.
					// The database has a rule set to check the 
					// timestamp generated and the timestamp 
					// sent with the pixel.

					// It could also be due to usage limits on
					// the free tier of Firebase.
					console.error('could not write pixel');
				})
		}).catch(_ => {
			console.error('you need to wait for cool down period to finish');
		})
	}
}

function startCoolDown() {
	// start a timeout for the cooldown time
	// in milliseconds, the milliseconds are
	// also set in the database rules so removing
	// this code doesn't allow the user to skip
	// cooldown
	setTimeout(endCoolDown, coolDownTime);

	// coolCount (😎) is used to write the countdown
	// clock.
	coolCount = coolDownTime;

	// update countdown clock first
	updateCoolCounter();

	// start an interval to update the countdown
	// clock every second
	clearInterval(coolInterval);
	coolInterval = setInterval(updateCoolCounter, 1000);
}

function updateCoolCounter() {
	// Work out minutes and seconds left from 
	// the remaining milliseconds in coolCount
	const mins = String(Math.floor((coolCount / (1000 * 60)) % 60)),
		  secs = String((coolCount / 1000) % 60);

	// update the cooldown counter in the DOM
	//coolDownText.innerHTML = `${mins}:${secs.toString().padStart(2, '0')}`;

	// remove 1 secound (1000 milliseconds) 
	// ready for the next update.
	coolCount -= 1000;
}

function endCoolDown() {
	// set coolCount to 0, just in case it went
	// over, intervals aren't perfect.
	coolCount = 0;

	// stop the update interval
	clearInterval(coolInterval);
}

function getTimestamp() {
	const ref = firebase.database().ref(`last_write/${uid}`);
	return ref.set(firebase.database.ServerValue.TIMESTAMP)
		.then(() => ref.once('value'))
		.then(timestamp => timestamp.val());
}

function startListeners() {
	console.log('Starting Firebase listeners');

	let placeRef = firebase.database().ref('pixel');

	placeRef.once('value').then(snapshot => {
		const grid = snapshot.val();
		for (let i in grid) {
			renderVoxel(i, grid[i]);
		}

		placeRef.on('child_changed', onChange);
		placeRef.on('child_added', onChange);
	})
	.catch(console.error);
}

function onChange(change) {
	// render the new pixel
	// key will be the grid position,
	// for example "34x764"
	// val will be a pixel object defined
	// by the Pixel interface at the top.
	renderPixel(change.key, change.val());
}

function renderVoxel(pos, pixel) {
	const split = pos.split('x', 2);

	const x = +split[0],
		  y = +split[1],
		  z = +split[2];

    editor.add(new voxelcss.Voxel(x*50, y*50, z*50, 50, {
        mesh: new voxelcss.Mesh(new voxelcss.ColorFace(pixel.color))
    }));
}
