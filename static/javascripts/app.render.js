'use strict';

/**
 * Render scene with camera pov
 */
APP.Core.prototype.render = function () {
    this.renderer.render(this.scene);
};

/**
 * Animate scene
 */
APP.Core.prototype.animate = function () {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
    this.XModule.update();
};