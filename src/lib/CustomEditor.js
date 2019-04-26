import firebase from 'firebase/app';
import deepEqual from 'deep-equal';

import { voxelDim } from './constants.js'

export default class CustomEditor {
  constructor(_world, options) {
    if (_world === undefined) {
      throw 'Editor requires World instance for initialization';
    }

    this.world = _world;
  
    this.autosave = false;

    this.tool = { mesh: {} };

    this.setupVoxelHelpers();

    if (options !== undefined && options.autosave === true) {
      this.autosave = true;
    }

    this.uid = "";

    firebase.auth().onAuthStateChanged(user => {
      // set uid based on login state
      this.uid = user ? user.uid : "";
    });

    window.addEventListener('keydown', e => {
      if ((e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) && (e.target.nodeName === 'BODY')) {
        e.preventDefault();
        this.logout();
        return false;
      }
    }, true);

    this.startFirebaseListeners();
    this.loadWorldVoxels();
  }

  setupVoxelHelpers() {
    const _onVoxelClick = event => {
      if (!this.enabled) {
        this.login();
        return;
      }
      this._doRemove(event.target);
    }
    const _onTopClick = event => {
      if (!this.enabled) {
        this.login();
        return;
      }
      this._doAddativeShift(event.target, 0, 1, 0);
    }
    const _onBottomClick = event => {
      if (!this.enabled) {
        this.login();
        return;
      }
      this._doAddativeShift(event.target, 0, -1, 0);
    }
    const _onFrontClick = event => {
      if (!this.enabled) {
        this.login();
        return;
      }
      this._doAddativeShift(event.target, 0, 0, 1);
    }
    const _onBackClick = event => {
      if (!this.enabled) {
        this.login();
        return;
      }
      this._doAddativeShift(event.target, 0, 0, -1);
    }
    const _onLeftClick = event => {
      if (!this.enabled) {
        this.login();
        return;
      }
      this._doAddativeShift(event.target, -1, 0, 0);
    }
    const _onRightClick = event => {
      if (!this.enabled) {
        this.login();
        return;
      }
      this._doAddativeShift(event.target, 1, 0, 0);
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

  get enabled() {
    return !!this.uid;
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
    return `#${this.tool.mesh.getFront().getHex()}`;
  }
  set toolMeshColor(color) {
    this.tool.mesh = new voxelcss.Mesh(new voxelcss.ColorFace(color));
  }

  _doRemove(voxel) {
    const { x, y, z } = voxel.getPosition();

    firebase.database().ref(`pixel/${x/voxelDim}x${y/voxelDim}x${z/voxelDim}`)
            .remove()
            .then(() => { this.remove(voxel); }).catch(console.error);
  }

  _doAddativeShift(voxel, dx, dy, dz) {
    const newVoxel = voxel.clone();
    const dim = newVoxel.getDimension();

    newVoxel.setMesh(this.tool.mesh);
    newVoxel.translate(dx*dim, dy*dim, dz*dim);

    const { x, y, z } = newVoxel.getPosition();

    firebase.database().ref(`pixel/${x/voxelDim}x${y/voxelDim}x${z/voxelDim}`)
            .set({ uid: this.uid, color: this.toolMeshColor })
            .then(() => { this.add(newVoxel); }).catch(console.error);
  }

  loadWorldVoxels() {
    this.world.getVoxels().forEach(this._bindVoxel);
  }

  login() {
    // Use Google for login
    const provider = new firebase.auth.GoogleAuthProvider();
    // Open Auth window
    firebase.auth().signInWithPopup(provider).catch(err => console.error('error logging in', err));
  }
  logout() {
    firebase.auth().signOut().catch(err => console.error('error logging out', err));
  }

  saveWorldToFirebase() {
    this.world.getVoxels().forEach(voxel => {
      const { x, y, z } = voxel.getPosition();

      firebase.database().ref(`pixel/${x/voxelDim}x${y/voxelDim}x${z/voxelDim}`)
          .set({ uid: this.uid, color: `#${voxel.getMesh().getFront().getHex()}` })
          .catch(console.error);
    });
  }

  loadWorldFromFirebase() {
    const placeRef = firebase.database().ref('pixel');

    placeRef.once('value').then(snapshot => {
      const grid = snapshot.val();

      Object.entries(grid).forEach(([ pos, { color } ]) => {
        const [x, y, z] = pos.split('x', 3).map(x => +x);

        this.add(new voxelcss.Voxel(x*voxelDim, y*voxelDim, z*voxelDim, voxelDim, {
          mesh: new voxelcss.Mesh(new voxelcss.ColorFace(color))
        }));
      });
    }).catch(console.error);
  }

  startFirebaseListeners() {
    const removeVoxel = pos => {
      const [x, y, z] = pos.split('x', 3).map(x => +x);

      this.world.getVoxels()
                .filter(voxel => deepEqual(voxel.getPosition(), {x: x*voxelDim, y: y*voxelDim, z: z*voxelDim}))
                .forEach(voxel => this.remove(voxel));
    };

    const renderVoxel = (pos, pixel) => {
      const [x, y, z] = pos.split('x', 3).map(x => +x);

      this.add(new voxelcss.Voxel(x*voxelDim, y*voxelDim, z*voxelDim, voxelDim, {
        mesh: new voxelcss.Mesh(new voxelcss.ColorFace(pixel.color))
      }));
    };

    const placeRef = firebase.database().ref('pixel');

    placeRef.once('value').then(snapshot => {
      const onChange = change => { renderVoxel(change.key, change.val()); };
      const onRemove = change => { removeVoxel(change.key); };

      placeRef.on('child_changed', onChange);
      placeRef.on('child_added', onChange);
      placeRef.on('child_removed', onRemove);
    }).catch(console.error);
  }
}
