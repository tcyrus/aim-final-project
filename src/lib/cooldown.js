import { coolDownTime } from './constants.js';

const coolDownText = document.getElementById('cooldown');

let coolInterval;
let coolCount = 0;

export default function startCoolDown() {
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
	coolDownText.innerHTML = `${mins}:${secs.toString().padStart(2, '0')}`;

	// remove 1 secound (1000 milliseconds) 
	// ready for the next update.
	coolCount -= 1000;
}

function endCoolDown() {
	// set coolCount to 0, just in case it went
	// over, intervals aren't perfect.
	coolCount = 0;

	coolDownText.innerHTML = '0:00';

	// stop the update interval
	clearInterval(coolInterval);
}