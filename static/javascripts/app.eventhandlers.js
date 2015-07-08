'use strict';

APP.prototype.onWindowResize = function () {
    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
};

APP.prototype.handlerMouseDown = function (event) {
    // this.simpleClick = true;
};

APP.prototype.handlerMouseMove = function () {
    this.mouse.x = ( event.clientX - this.windowHalfX );
    this.mouse.y = ( event.clientY - this.windowHalfY );

    this.light.position.set(this.camera.position.x+5, this.camera.position.y+5, this.camera.position.z);
};

APP.prototype.handlerMouseUp = function (event) {
    event.preventDefault();
};

APP.prototype.handlerKeyUp = function (event) {
    event.preventDefault();
    if (this.isTweening || this.isUpdating) return;

    switch (event.keyCode) {
        case 37: // LEFT
            this.updateModel('left');
            break;
        case 39: // RIGHT
            this.updateModel('right');
            break;

        case 38: // UP
            this.updateModel('up');
            break;
        case 40: // DOWN
            this.updateModel('down');
            break;

        case 33: // IN
            this.updateModel('in');
            break;
        case 34: // OUT
            this.updateModel('out');
            break;
    }
};

APP.prototype.handlerKeyDown = function (event) {
    event.preventDefault();
};