export default function buildCube(editor) {
  const initColor = '#'+editor.getToolMesh().getFront().getHex();

  for (let x = -3; x <= 3; x++) {
    for (let y = -3; y <= 3; y++) {
      for (let z = -3; z <= 3; z++) {
        if ([x, y, z].filter(value => (Math.abs(value) === 3)).length > 1) {
          editor.add(new voxelcss.Voxel(x*50, y*50, z*50, 50, {
            mesh: new voxelcss.Mesh(new voxelcss.ColorFace(initColor))
          }));
        }
      }
    }
  }
}
