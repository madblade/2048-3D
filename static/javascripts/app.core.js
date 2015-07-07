'use strict';

/**
 * App core object
 * @constructor
 */
var APP = APP || {
        'Core': {},
        'Modules': {}
    };

APP.Core = function () {
    this.scene = this.getScene();

    // Set up renderer
    var container = document.getElementById('scene');
    this.renderer = this.getRenderer();
    container.appendChild(this.renderer.view);

    // Set up events
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
    window.addEventListener('mousedown', this.handlerMouseDown.bind(this), false);
    window.addEventListener('mousemove', this.handlerMouseMove.bind(this), false);
    window.addEventListener('mouseup', this.handlerMouseUp.bind(this), false);
    window.addEventListener('keyup', this.handlerKeyUp.bind(this), false);
    window.addEventListener('keydown', this.handlerKeyDown.bind(this), false);

    // Run
    this.run();

    // Animate
    this.animate();
};

APP.Core.prototype.run = function () {

    // Flush scene
    // if (this.scene !== undefined) this.resetScene();

    // Init modules
    this.XModule = new APP.Modules.X(this);

    // Run modules
    this.XModule.run();
};