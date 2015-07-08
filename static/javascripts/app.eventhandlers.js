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
};

APP.prototype.handlerMouseUp = function (event) {
    event.preventDefault();
};

APP.prototype.handlerKeyUp = function (event) {
    event.preventDefault();

    if (event.keyCode == 38) this.setupTween(this.mesh.position, 'x', -100);
    if (event.keyCode == 40) this.setupTween(this.mesh.position, 'x', +100);
};

APP.prototype.handlerKeyDown = function (event) {
    event.preventDefault();
};