'use strict';

/**
 * Render scene with camera pov
 */
APP.prototype.render = function () {
    var delta = this.clock.getDelta();
    this.renderer.render(this.scene, this.camera);
};

/**
 * Animate scene
 */
APP.prototype.animate = function () {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
    this.stats.update();
    this.controls.update();
    TWEEN.update();
};