export default class CustomEditor {
  constructor(_world, options) {
    if (_world === undefined) {
      throw 'Editor requires World instance for initialization';
    }

    this.world = _world;
  
    this.autosave = false;
    this.enabled = true;

    this.tool = { mesh: {} };

    this.setupVoxelHelpers();

    if (options !== undefined && options.autosave === true) {
      this.autosave = true;
    }

    this.loadWorldVoxels();
  }

  setupVoxelHelpers() {
    const _onVoxelClick = event => {
      if (!this.enabled) return;
      const { target } = event;
      this.remove(target);
    }
    const _onTopClick = event => {
      if (!this.enabled) return;
      const { target } = event;
      this._doAddativeShift(target, 0, 1, 0);
    }
    const _onBottomClick = event => {
      if (!this.enabled) return;
      const { target } = event;
      this._doAddativeShift(target, 0, -1, 0);
    }
    const _onFrontClick = event => {
      if (!this.enabled) return;
      const { target } = event;
      this._doAddativeShift(target, 0, 0, 1);
    }
    const _onBackClick = event => {
      if (!this.enabled) return;
      const { target } = event;
      this._doAddativeShift(target, 0, 0, -1);
    }
    const _onLeftClick = event => {
      if (!this.enabled) return;
      const { target } = event;
      this._doAddativeShift(target, -1, 0, 0);
    }
    const _onRightClick = event => {
      if (!this.enabled) return;
      const { target } = event;
      this._doAddativeShift(target, 1, 0, 0);
    }

    const _tryAutoSave = this.tryAutoSave.bind(this);

    this._bindVoxel = voxel => {
      voxel.addEventListener('VoxelClick', _onVoxelClick);

      voxel.addEventListener('TopClick', _onTopClick);
      voxel.addEventListener('BottomClick', _onBottomClick);
      voxel.addEventListener('FrontClick', _onFrontClick);
      voxel.addEventListener('BackClick', _onBackClick);
      voxel.addEventListener('LeftClick', _onLeftClick);
      voxel.addEventListener('RightClick', _onRightClick);

      voxel.addEventListener('MeshChange', _tryAutoSave);
    }

    this._unbindVoxel = voxel => {
      voxel.removeEventListener('VoxelClick', _onVoxelClick);

      voxel.removeEventListener('TopClick', _onTopClick);
      voxel.removeEventListener('BottomClick', _onBottomClick);
      voxel.removeEventListener('FrontClick', _onFrontClick);
      voxel.removeEventListener('BackClick', _onBackClick);
      voxel.removeEventListener('LeftClick', _onLeftClick);
      voxel.removeEventListener('RightClick', _onRightClick);
    }
  }

  tryAutoSave() {
    if (this.autosave) this.save();
  }
  save() {
    this.world.save();
  }
  load() {
    const response = this.world.load();
    this.loadWorldVoxels();
    return response;
  }

  isSaved() {
    return this.world.isSaved();
  }
  deleteSave() {
    this.world.deleteSave();
  }
  export() {
    return this.world.export();
  }

  import(string) {
    const response = world.import(string);
    this.loadWorldVoxels();
    return response;
  }
  
  add(voxel) {
    this._bindVoxel(voxel);
    const response = this.world.add(voxel);

    this.tryAutoSave();
    return response;
  }
  remove(voxel) {
    const success = this.world.remove(voxel);
    if (this.success) this._unbindVoxel(voxel);

    this.tryAutoSave();
    return success;
  };

  get toolMesh() {
    return this.tool.mesh;
  }
  set toolMesh(mesh) {
    this.tool.mesh = mesh;
  }

  get toolMeshColor() {
    return '#'+this.tool.mesh.getFront().getHex();
  }
  set toolMeshColor(color) {
    this.tool.mesh = new voxelcss.Mesh(new voxelcss.ColorFace(color));
  }

  _doAddativeShift(voxel, x, y, z) {
    const newVoxel = voxel.clone();
    const dim = newVoxel.getDimension();

    newVoxel.setMesh(this.tool.mesh);
    newVoxel.translate(x*dim, y*dim, z*dim);

    this.add(newVoxel);
  }

  loadWorldVoxels() {
    this.world.getVoxels().forEach(this._bindVoxel);
  }
}
