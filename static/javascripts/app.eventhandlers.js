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

    this.light.position.set(this.camera.position.x+1, this.camera.position.y+1, this.camera.position.z);
};

APP.prototype.handlerMouseUp = function (event) {
    event.preventDefault();
};

APP.prototype.handlerKeyUp = function (event) {
    event.preventDefault();
    if (this.isTweening) return;

    var m;
    switch (event.keyCode) {
        case 37: // LEFT
            for (var meshId in this.meshes) {
                m = this.meshes[meshId];
                this.setupTween(m.position, 'x', m.position.x - 1.1);
            }
            break;
        case 39: // RIGHT
            for (var meshId in this.meshes) {
                m = this.meshes[meshId];
                this.setupTween(m.position, 'x', m.position.x + 1.1);
            }
            break;

        case 38: // UP
            for (var meshId in this.meshes) {
                m = this.meshes[meshId];
                this.setupTween(m.position, 'y', m.position.y + 1.1);
            }
            break;
        case 40: // DOWN
            for (var meshId in this.meshes) {
                m = this.meshes[meshId];
                this.setupTween(m.position, 'y', m.position.y - 1.1);
            }
            break;

        case 33: // IN
            for (var meshId in this.meshes) {
                m = this.meshes[meshId];
                this.setupTween(m.position, 'z', m.position.z - 1.1);
            }
            break;
            break;
        case 34: // OUT
            for (var meshId in this.meshes) {
                m = this.meshes[meshId];
                this.setupTween(m.position, 'z', m.position.z + 1.1);
            }
            break;
            break;
    }
};

APP.prototype.handlerKeyDown = function (event) {
    event.preventDefault();
};