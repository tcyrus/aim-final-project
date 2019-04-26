import { colorPalete } from './lib/constants.js';

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

import firebaseConfig from './lib/firebase-config.js';

firebase.initializeApp(firebaseConfig);

for (let x = -3; x <= 3; x++) {
  for (let y = -3; y <= 3; y++) {
    for (let z = -3; z <= 3; z++) {
      if ([x, y, z].filter(value => (Math.abs(value) === 3)).length > 1) {
          firebase.database().ref(`pixel/${x}x${y}x${z}`)
            .set({ uid: 0, color: colorPalete[Math.floor(Math.random() * colorPalete.length)] })
            .catch(console.error);
      }
    }
  }
}
