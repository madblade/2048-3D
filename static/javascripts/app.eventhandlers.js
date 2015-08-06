'use strict';

APP.prototype.onWindowResize = function () {
    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
};

APP.prototype.handlerMouseDown = function (event) {
    event.preventDefault();
};

APP.prototype.handlerMouseWheel = function(event) {
    event.preventDefault();

    console.log("coucou");
    var c = this.camera.position;
    this.light.position.set(c.x+5, c.y+5, c.z);
};

APP.prototype.handlerMouseMove = function () {
    this.mouse.x = ( event.clientX - this.windowHalfX );
    this.mouse.y = ( event.clientY - this.windowHalfY );

    var c = this.camera.position;
    this.light.position.set(c.x+5, c.y+5, c.z);

    var x = 1.65 - c.x,
        y = 1.65 - c.y,
        z = 1.65 - c.z;

    if (z < 0 && Math.abs(z) > Math.abs(x)) {
        this.keyEnum = {
            LEFT: 37,
            RIGHT: 39,
            IN: 33,
            OUT: 34,
            UP: 38,
            DOWN: 40
        };
    } else if (x < 0 && Math.abs(x) > Math.abs(z)) {
        this.keyEnum = {
            LEFT: 33,
            RIGHT: 34,
            IN: 39,
            OUT: 37,
            UP: 38,
            DOWN: 40
        };
    } else if (z > 0 && Math.abs(z) > Math.abs(x)) {
        this.keyEnum = {
            LEFT: 39,
            RIGHT: 37,
            IN: 34,
            OUT: 33,
            UP: 38,
            DOWN: 40
        };
    } else if (x > 0 && Math.abs(x) > Math.abs(z)) {
        this.keyEnum = {
            LEFT: 34,
            RIGHT: 33,
            IN: 37,
            OUT: 39,
            UP: 38,
            DOWN: 40
        };
    }

};

APP.prototype.handlerMouseUp = function (event) {
    event.preventDefault();
};

APP.prototype.handlerKeyUp = function (event) {
    event.preventDefault();
    if (this.isTweening || this.isUpdating) return;

    switch (event.keyCode) {
        case this.keyEnum.LEFT:
            this.updateModel('left');
            break;
        case this.keyEnum.RIGHT:
            this.updateModel('right');
            break;

        case this.keyEnum.UP:
            this.updateModel('up');
            break;
        case this.keyEnum.DOWN:
            this.updateModel('down');
            break;

        case this.keyEnum.IN:
            this.updateModel('in');
            break;
        case this.keyEnum.OUT:
            this.updateModel('out');
            break;
    }
};

APP.prototype.handlerKeyDown = function (event) {
    event.preventDefault();
};

APP.prototype.keyEnum = {
    LEFT: 37,
    RIGHT: 39,

    UP: 38,
    DOWN: 40,

    IN: 33,
    OUT: 34
};