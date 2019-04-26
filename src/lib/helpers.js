import { colorPalete } from './constants.js';

export function buildCube(editor) {
  let initColor;

  for (let x = -3; x <= 3; x++) {
    for (let y = -3; y <= 3; y++) {
      for (let z = -3; z <= 3; z++) {
        if ([x, y, z].filter(value => (Math.abs(value) === 3)).length > 1) {
          initColor = colorPalete[Math.floor(Math.random() * colorPalete.length)];
          editor.add(new voxelcss.Voxel(x*50, y*50, z*50, 50, {
            mesh: new voxelcss.Mesh(new voxelcss.ColorFace(initColor))
          }));
        }
      }
    }
  }
}

export function colorPalleteHack(controller) {
  const wrapper = controller.domElement,
        select = wrapper.children[0];

  const wrapper2 = controller.__li.cloneNode(true);
  let t = wrapper2.querySelector('.property-name');
  t.parentNode.removeChild(t);
  t = wrapper2.querySelector('select');
  t.parentNode.removeChild(t);

  controller.__radios = Array.prototype.map.call(select.children, (option, i) => {
    const tmp1 = wrapper2.cloneNode(true);

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = option.name;
    radio.value = option.value;
    radio.checked = option.selected;

    radio.addEventListener('change', e => {
      option.selected = true;
      controller.setValue(e.target.value);
    });

    const label = document.createElement('label');
    label.appendChild(radio);
    label.appendChild(document.createTextNode(option.innerText));

    tmp1.querySelector('.c').appendChild(label);

    wrapper.parentNode.parentNode.parentNode.appendChild(tmp1);

    return label;
  }).map(label => {
    label.style.display = 'inline-block';
    const radio = label.children[0];
    radio.nextSibling.remove();

    const span = document.createElement('span');
    span.style.background = radio.value;
    span.style.paddingRight = '4em';
    span.style.marginRight = '.5em';
    label.appendChild(span);
  });

  wrapper.removeChild(select);
  return controller;
}
