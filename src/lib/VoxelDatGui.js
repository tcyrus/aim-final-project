import * as dat from 'dat.gui';

import { colorPalleteHack } from './helpers.js';
import { colorPalete } from './constants.js';

export default class VoxelDatGui {
  constructor(lightSource, scene, editor) {
    this.gui = new dat.GUI(),

    this.lightSource = lightSource;
    this.scene = scene;
    this.editor = editor;

    this.initLightData();
    this.initCameraData();
    this.initSavingData();
    this.initCubeOptions();

    this.setupLightData();
    this.setupCameraData();
    this.setupSavingData();
    this.setupCubeOptions();
  }

  initLightData(lightSource) {
    this.lightData = {
      x: this.lightSource.getPositionX(),
      y: this.lightSource.getPositionY(),
      z: this.lightSource.getPositionZ(),

      darkness: this.lightSource.getBrightness()[0],
      lightness: this.lightSource.getBrightness()[1],

      travelDistance: this.lightSource.getTravelDistance()
    };
  }

  setupLightData() {
    const lighting = this.gui.addFolder('Light Source');
    lighting.add(this.lightData, 'darkness', 0, 1).step(0.01)
      .onChange(darkness => { this.lightSource.setBrightness(darkness); });
    lighting.add(this.lightData, 'lightness', 0, 1).step(0.01)
      .onChange(lightness => { this.lightSource.setBrightness(null, lightness); });
    lighting.add(this.lightData, 'travelDistance', 0, 2000)
      .onChange(travelDistance => { this.lightSource.setTravelDistance(travelDistance); });

    const updatePosition = () => {
      this.lightSource.setPosition(this.lightData.x, this.lightData.y, this.lightData.z);
    }

    lighting.add(this.lightData, 'x', -500, 500).onChange(updatePosition);
    lighting.add(this.lightData, 'y', -500, 500).onChange(updatePosition);
    lighting.add(this.lightData, 'z', -500, 500).onChange(updatePosition);

    this.lighting = lighting;
  }

  initCameraData() {
    this.cameraData = {
      panX: this.scene.getPanX(),
      panY: this.scene.getPanY(),
      panZ: this.scene.getPanZ(),

      rotationX: this.scene.getRotationX(),
      rotationY: this.scene.getRotationY(),
      rotationZ: this.scene.getRotationZ(),

      zoom: this.scene.getZoom()
    };
  }

  setupCameraData() {
    const camera = this.gui.addFolder('Scene');
    camera.add(this.cameraData, 'panX', -500, 500).listen()
      .onChange(panX => { this.scene.setPanX(panX); });
    camera.add(this.cameraData, 'panY', -500, 500).listen()
      .onChange(panY => { this.scene.setPanY(panY); });
    camera.add(this.cameraData, 'panZ', -500, 500).listen()
      .onChange(panZ => { this.scene.setPanZ(panZ); });
    camera.add(this.cameraData, 'rotationX', -360, 360).listen()
      .onChange(rotationX => { this.scene.setRotationX(rotationX * Math.PI / 180); });
    camera.add(this.cameraData, 'rotationY', -360, 360).listen()
      .onChange(rotationY => { this.scene.setRotationY(rotationY * Math.PI / 180); });
    camera.add(this.cameraData, 'rotationZ', -360, 360).listen()
      .onChange(rotationZ => { this.scene.setRotationZ(rotationZ * Math.PI / 180); });
    camera.add(this.cameraData, 'zoom', 0, 3).listen()
      .onChange(zoom => { this.scene.setZoom(zoom); });

    this.camera = camera;

    this.scene.addEventListener('orbit', event => {
      this.cameraData.rotationX = event.rotation.x * 180 / Math.PI;
      this.cameraData.rotationY = event.rotation.y * 180 / Math.PI;
      this.cameraData.rotationZ = event.rotation.z * 180 / Math.PI;
    });
    this.scene.addEventListener('zoom', event => {
      this.cameraData.zoom = event.zoom;
    });
    this.scene.addEventListener('pan', event => {
      this.cameraData.panX = event.pan.x;
      this.cameraData.panY = event.pan.y;
      this.cameraData.panZ = event.pan.z;
    });
  }

/*
  initSavingData() {
    const editor = this.editor;
    this.savingData = {
//      autosave: editor.autosave,
      saveWorld() { editor.saveWorldToFirebase() },
      loadWorld() { editor.loadWorldFromFirebase() },
      revertToDefault() {
        editor.deleteSave();
        editor.loadWorldFromFirebase();
        //buildCube(editor);
      }
    };
  }

  setupSavingData() {
    const saving = this.gui.addFolder('Save World (Debug)');
//    saving.add(this.savingData, 'autosave')
//      .onChange(autosave => { this.editor.autosave = autosave; });
    saving.add(this.savingData, 'saveWorld');
    saving.add(this.savingData, 'loadWorld');
    saving.add(this.savingData, 'revertToDefault');

    this.saving = saving;
  }
*/

  initCubeOptions() {
    const editor = this.editor;
    this.cubeOptions = {
      color: editor.toolMeshColor
    };
  }

  setupCubeOptions() {
    const cube = this.gui.addFolder('Cube Options');
    colorPalleteHack(cube.add(this.cubeOptions, 'color', colorPalete))
      .onChange(meshColor => { this.editor.toolMeshColor = meshColor; });

    /*
    cube.addColor(cubeOptions, 'color')
      .onChange(meshColor => {
        editor.setToolMesh(new voxelcss.Mesh(new voxelcss.ColorFace(meshColor)));
      });
    */
    this.cube = cube;
  }
}
