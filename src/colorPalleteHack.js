export default function colorPalleteHack(controller) {
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
