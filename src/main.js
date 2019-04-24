import './styles/style.scss';

import '../node_modules/voxel.css/dist/voxelcss.js';
import CustomEditor from './lib/CustomEditor.js';

import { buildCube } from './lib/helpers.js';
import { colorPalete } from './lib/constants.js';

import VoxelDatGui from './lib/VoxelDatGui.js';

if (!window.voxelcss) window.voxelcss = {};
voxelcss.Editor = CustomEditor;

window.addEventListener('load', () => {
  const scene = new voxelcss.Scene();
  scene.rotate(-Math.PI / 5, Math.PI / 4, 0);
  scene.attach(document.body);

  const world = new voxelcss.World(scene, 'World');
  const editor = new voxelcss.Editor(world);
  editor.autosave = true;

  const lightSource = new voxelcss.LightSource(300, 300, 300, 750, 0.2, 1);
  scene.addLightSource(lightSource);

  editor.load();

  editor.toolMeshColor = colorPalete[15];

  if (world.getVoxels().length === 0) {
    buildCube(editor);
  }

  const voxelGui = new VoxelDatGui(lightSource, scene, editor);
  voxelGui.cube.open();
});