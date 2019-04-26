# AIM Final Project

> "This world is but a canvas to our imagination."
> -- Henry David Thoreau

This project uses Firebase, voxel.css, and dat.gui to create something akin to a Voxel-based /r/place.

Due to limitations in voxel.css and dat.gui, my code does some injection and live modification to the base libraries (this is all handled as part of bundling, so there are no security risks with this).

Firebase can be configured using Firebase CLI. I am excluding the file `src/lib/firebase_config.js`.

The boilerplate code is taken from rollup-starter-app.

## License

[MIT](LICENSE).
