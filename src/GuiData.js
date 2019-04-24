import buildCube from './buildCube.js';

export default class GuiData {
  constructor(lightSource, scene, editor) {
    this.setupLightData(lightSource);
    this.setupCameraData(scene);
    this.setupSavingData(editor);
    this.setupCubeOptions(editor);
  }

  setupLightData(lightSource) {
    this.lightData = {
      x: lightSource.getPositionX(),
      y: lightSource.getPositionY(),
      z: lightSource.getPositionZ(),

      darkness: lightSource.getBrightness()[0],
      lightness: lightSource.getBrightness()[1],

      travelDistance: lightSource.getTravelDistance()
    };
  }

  setupCameraData(scene) {
    this.cameraData = {
      panX: scene.getPanX(),
      panY: scene.getPanY(),
      panZ: scene.getPanZ(),

      rotationX: scene.getRotationX(),
      rotationY: scene.getRotationY(),
      rotationZ: scene.getRotationZ(),

      zoom: scene.getZoom()
    };
  }

  setupSavingData(editor) {
    this.savingData = {
      autosave: editor.autosave,
      saveWorld: editor.save,
      loadWorld: editor.load,
      revertToDefault() {
        editor.deleteSave();
        editor.load();
        buildCube(editor);
      }
    };
  }

  setupCubeOptions(editor) {
    this.cubeOptions = {
      color: '#'+editor.getToolMesh().getFront().getHex()
    };
  }
}
