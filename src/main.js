import './styles/style.scss';

import '../node_modules/voxel.css/dist/voxelcss.js';
import CustomEditor from './lib/CustomEditor.js';

import { colorPalete } from './lib/constants.js';
//import { buildCube } from './lib/helpers.js';

import VoxelDatGui from './lib/VoxelDatGui.js';

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

import firebaseConfig from './lib/firebase-config.js';

firebase.initializeApp(firebaseConfig);

voxelcss.Editor = CustomEditor;

window.addEventListener('load', () => {
  const scene = new voxelcss.Scene();
  scene.rotate(-Math.PI / 5, Math.PI / 4, 0);
  scene.attach(document.body);

  const world = new voxelcss.World(scene, 'World');
  const editor = new voxelcss.Editor(world);

  const lightSource = new voxelcss.LightSource(300, 300, 300, 750, 0.5, 1);
  scene.addLightSource(lightSource);

  //editor.load();

  editor.toolMeshColor = colorPalete[0];

  if (world.getVoxels().length === 0) {
    editor.loadWorldFromFirebase();
    //buildCube(editor);
  }

  const voxelGui = new VoxelDatGui(lightSource, scene, editor);
  voxelGui.cube.open();
});