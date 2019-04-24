import '../node_modules/voxel.css/dist/voxel.css';
import './style.scss';

import * as dat from 'dat.gui';

import '../node_modules/voxel.css/dist/voxelcss.js';
import CustomEditor from './CustomEditor.js';

import colorPalleteHack from './colorPalleteHack.js';
import buildCube from './buildCube.js';
import GuiData from './GuiData.js';

if (!window.voxelcss) window.voxelcss = {};
voxelcss.Editor = CustomEditor;

var scene,
    world,
    editor,
    lightSource;

const colorPalete = [
  "#000000",
  "#dc322f",
  "#859900",
  "#b58900",
  "#268bd2",
  "#d169d1",
  "#2aa198",
  "#b0b0b0",
  "#5d5d5d",
  "#e09690",
  "#cdee69",
  "#ffe377",
  "#9cd9f0",
  "#fbb1f9",
  "#77dfd8",
  "#f7f7f7"
];

window.addEventListener('load', () => {
  scene = new voxelcss.Scene();
  scene.rotate(-Math.PI / 5, Math.PI / 4, 0);
  scene.attach(document.body);

  world = new voxelcss.World(scene, 'World');
  editor = new voxelcss.Editor(world);
  editor.autosave = true;

  lightSource = new voxelcss.LightSource(300, 300, 300, 750, 0.2, 1);
  scene.addLightSource(lightSource);

  editor.load();

  editor.setToolMeshColor(colorPalete[15]);

  if (world.getVoxels().length === 0) {
    buildCube(editor);
  }

  setupGUI();
});

function setupGUI() {
  const gui = new dat.GUI(),
        data = new GuiData(lightSource, scene, editor);

  const lighting = gui.addFolder('Light Source');
  lighting.add(data.lightData, 'darkness', 0, 1).step(0.01).onChange(darkness => {
    lightSource.setBrightness(darkness);
  });
  lighting.add(data.lightData, 'lightness', 0, 1).step(0.01).onChange(lightness => {
    lightSource.setBrightness(null, lightness);
  });
  lighting.add(data.lightData, 'travelDistance', 0, 2000).onChange(travelDistance => {
    lightSource.setTravelDistance(travelDistance);
  });
  lighting.add(data.lightData, 'x', -500, 500).onChange(updatePosition);
  lighting.add(data.lightData, 'y', -500, 500).onChange(updatePosition);
  lighting.add(data.lightData, 'z', -500, 500).onChange(updatePosition);

  function updatePosition() {
    lightSource.setPosition(data.lightData.x, data.lightData.y, data.lightData.z);
  }

  const camera = gui.addFolder('Scene');
  camera.add(data.cameraData, 'panX', -500, 500).listen().onChange(updatePan);
  camera.add(data.cameraData, 'panY', -500, 500).listen().onChange(updatePan);
  camera.add(data.cameraData, 'panZ', -500, 500).listen().onChange(updatePan);
  camera.add(data.cameraData, 'rotationX', -360, 360).listen().onChange(updateRotation);
  camera.add(data.cameraData, 'rotationY', -360, 360).listen().onChange(updateRotation);
  camera.add(data.cameraData, 'rotationZ', -360, 360).listen().onChange(updateRotation);
  camera.add(data.cameraData, 'zoom', 0, 3).listen().onChange(zoom => {
    scene.setZoom(zoom);
  });

  scene.addEventListener('orbit', event => {
    data.cameraData.rotationX = event.rotation.x * 180 / Math.PI;
    data.cameraData.rotationY = event.rotation.y * 180 / Math.PI;
    data.cameraData.rotationZ = event.rotation.z * 180 / Math.PI;
  });
  scene.addEventListener('zoom', event => {
    data.cameraData.zoom = event.zoom;
  });
  scene.addEventListener('pan', event => {
    data.cameraData.panX = event.pan.x;
    data.cameraData.panY = event.pan.y;
    data.cameraData.panZ = event.pan.z;
  });

  function updateRotation() {
    scene.setRotation(data.cameraData.rotationX * Math.PI / 180, data.cameraData.rotationY * Math.PI / 180, data.cameraData.rotationZ * Math.PI / 180);
  }

  function updatePan() {
    scene.setPan(data.cameraData.panX, data.cameraData.panY, data.cameraData.panZ);
  }

  const saving = gui.addFolder('Save World');
  saving.add(data.savingData, 'autosave').onChange(autosave => { editor.autosave = autosave; });
  saving.add(data.savingData, 'saveWorld');
  saving.add(data.savingData, 'loadWorld');
  saving.add(data.savingData, 'revertToDefault');

  const cube = gui.addFolder('Cube Options');
  colorPalleteHack(cube.add(data.cubeOptions, 'color', colorPalete)).onChange(meshColor => {
    editor.setToolMeshColor(meshColor);
  });

/*
  cube.addColor(cubeOptions, 'color').onChange(meshColor => {
    editor.setToolMesh(new voxelcss.Mesh(new voxelcss.ColorFace(meshColor)));
  });
*/

  cube.open();
}
