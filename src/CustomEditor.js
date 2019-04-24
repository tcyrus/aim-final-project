export default class CustomEditor {
  constructor(_world, options) {
    if (_world === undefined) {
      throw 'Editor requires World instance for initialization';
    }

    this.world = _world;
  
    this.autosave = false;
    this.enabled = true;

    this.tool = { mesh: {} };

    this._onVoxelClick = this._onVoxelClick.bind(this)

    this._onTopClick = this._onTopClick.bind(this);
    this._onBottomClick = this._onBottomClick.bind(this);
    this._onFrontClick = this._onFrontClick.bind(this);
    this._onBackClick = this._onBackClick.bind(this);
    this._onLeftClick = this._onLeftClick.bind(this);
    this._onRightClick = this._onRightClick.bind(this);

    this._tryAutoSave = this.tryAutoSave.bind(this);

    if (options !== undefined && options.autosave === true) {
      this.autosave = true;
    }

    this.loadWorldVoxels();
  }
  
  enable() {
    this.enabled = true;
  }
  disable() {
    this.enabled = false;
  }
  isEnabled() {
    return this.enabled;
  }

  enableAutoSave() {
    this.autosave = true;
  }
  disableAutoSave() {
    this.autosave = false;
  }
  canAutoSave() {
    return this.autosave;
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
    return this.world.deleteSave();
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

  getWorld() {
    return this.world;
  }

  getToolMesh(mesh) {
    return this.tool.mesh;
  }
  setToolMesh(mesh) {
    if (mesh === undefined)
      return this.tool.mesh;

    const old = this.tool.mesh;
    this.tool.mesh = mesh;
    return old;
  }

  _bindVoxel(voxel) {
    voxel.addEventListener('VoxelClick', this._onVoxelClick);

    voxel.addEventListener('TopClick', this._onTopClick);
    voxel.addEventListener('BottomClick', this._onBottomClick);
    voxel.addEventListener('FrontClick', this._onFrontClick);
    voxel.addEventListener('BackClick', this._onBackClick);
    voxel.addEventListener('LeftClick', this._onLeftClick);
    voxel.addEventListener('RightClick', this._onRightClick);

    voxel.addEventListener('MeshChange', this._tryAutoSave);
  }

  _unbindVoxel(voxel) {
    voxel.removeEventListener('VoxelClick', this._onVoxelClick);

    voxel.removeEventListener('TopClick', this._onTopClick);
    voxel.removeEventListener('BottomClick', this._onBottomClick);
    voxel.removeEventListener('FrontClick', this._onFrontClick);
    voxel.removeEventListener('BackClick', this._onBackClick);
    voxel.removeEventListener('LeftClick', this._onLeftClick);
    voxel.removeEventListener('RightClick', this._onRightClick);
  }
  
  _onVoxelClick(event) {
    if (!this.enabled) return;
    const { target } = event;
    this.remove(target);
  }

  _onTopClick(event) {
    if (!this.enabled) return;
    const { target } = event;
    this._doAddativeShift(target, 0, 1, 0);
  }
  _onBottomClick(event) {
    if (!this.enabled) return;
    const { target } = event;
    this._doAddativeShift(target, 0, -1, 0);
  }
  _onFrontClick(event) {
    if (!this.enabled) return;
    const { target } = event;
    this._doAddativeShift(target, 0, 0, 1);
  }
  _onBackClick(event) {
    if (!this.enabled) return;
    const { target } = event;
    this._doAddativeShift(target, 0, 0, -1);
  }
  _onLeftClick(event) {
    if (!this.enabled) return;
    const { target } = event;
    this._doAddativeShift(target, -1, 0, 0);
  }
  _onRightClick(event) {
    if (!this.enabled) return;
    const { target } = event;
    this._doAddativeShift(target, 1, 0, 0);
  }
  _doAddativeShift(voxel, x, y, z) {
    const newVoxel = voxel.clone();
    const dim = newVoxel.getDimension();

    newVoxel.setMesh(this.tool.mesh);
    newVoxel.translate(x*dim, y*dim, z*dim);

    this.add(newVoxel);
  }

  loadWorldVoxels() {
    this.world.getVoxels().forEach(voxel => { this._bindVoxel(voxel); });
  }
}
