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

APP.prototype.handlerMouseWheel = function (event) {
    event.preventDefault();

    var c = this.camera.position;
    this.light.position.set(c.x + 5, c.y + 5, c.z);
};

APP.prototype.handlerMouseMove = function () {
    this.mouse.x = ( event.clientX - this.windowHalfX );
    this.mouse.y = ( event.clientY - this.windowHalfY );

    var c = this.camera.position;
    this.light.position.set(c.x + 5, c.y + 5, c.z);

    var x = 1.65 - c.x,
        y = 1.65 - c.y,
        z = 1.65 - c.z;

    if (z < 0 && Math.abs(z) > Math.abs(x)) {
        // Right hand
        this.keyEnum.LEFT = 37;
        this.keyEnum.RIGHT = 39;
        this.keyEnum.IN = 33;
        this.keyEnum.OUT = 34;

        // Left hand
        if (this.language == "fr") {
            this.leftHandKeyEnum.LEFT = this.keyEnum.Q;
            this.leftHandKeyEnum.RIGHT = this.keyEnum.D;
            this.leftHandKeyEnum.WITHIN = this.keyEnum.E;
            this.leftHandKeyEnum.WITHOUT = this.keyEnum.C;
            this.leftHandKeyEnum.FORWARD = this.keyEnum.Z;
            this.leftHandKeyEnum.BACKWARDS = this.keyEnum.S;
        } else {
            this.leftHandKeyEnum.LEFT = this.keyEnum.A;
            this.leftHandKeyEnum.RIGHT = this.keyEnum.D;
            this.leftHandKeyEnum.WITHIN = this.keyEnum.E;
            this.leftHandKeyEnum.WITHOUT = this.keyEnum.C;
            this.leftHandKeyEnum.FORWARD = this.keyEnum.W;
            this.leftHandKeyEnum.BACKWARDS = this.keyEnum.S;
        }

    } else if (x < 0 && Math.abs(x) > Math.abs(z)) {

        this.keyEnum.LEFT = 33;
        this.keyEnum.RIGHT = 34;
        this.keyEnum.IN = 39;
        this.keyEnum.OUT = 37;

        if (this.language == "fr") {
            this.leftHandKeyEnum.LEFT = this.keyEnum.E;
            this.leftHandKeyEnum.RIGHT = this.keyEnum.C;
            this.leftHandKeyEnum.WITHIN = this.keyEnum.D;
            this.leftHandKeyEnum.WITHOUT = this.keyEnum.Q;
            this.leftHandKeyEnum.FORWARD = this.keyEnum.Z;
            this.leftHandKeyEnum.BACKWARDS = this.keyEnum.S;
        } else {
            this.leftHandKeyEnum.LEFT = this.keyEnum.E;
            this.leftHandKeyEnum.RIGHT = this.keyEnum.C;
            this.leftHandKeyEnum.WITHIN = this.keyEnum.D;
            this.leftHandKeyEnum.WITHOUT = this.keyEnum.A;
            this.leftHandKeyEnum.FORWARD = this.keyEnum.W;
            this.leftHandKeyEnum.BACKWARDS = this.keyEnum.S;
        }
    } else if (z > 0 && Math.abs(z) > Math.abs(x)) {

        this.keyEnum.LEFT = 39;
        this.keyEnum.RIGHT = 37;
        this.keyEnum.IN = 34;
        this.keyEnum.OUT = 33;

        if (this.language == "fr") {
            this.leftHandKeyEnum.LEFT = this.keyEnum.D;
            this.leftHandKeyEnum.RIGHT = this.keyEnum.Q;
            this.leftHandKeyEnum.WITHIN = this.keyEnum.C;
            this.leftHandKeyEnum.WITHOUT = this.keyEnum.E;
            this.leftHandKeyEnum.FORWARD = this.keyEnum.Z;
            this.leftHandKeyEnum.BACKWARDS = this.keyEnum.S;
        } else {
            this.leftHandKeyEnum.LEFT = this.keyEnum.D;
            this.leftHandKeyEnum.RIGHT = this.keyEnum.A;
            this.leftHandKeyEnum.WITHIN = this.keyEnum.C;
            this.leftHandKeyEnum.WITHOUT = this.keyEnum.E;
            this.leftHandKeyEnum.FORWARD = this.keyEnum.W;
            this.leftHandKeyEnum.BACKWARDS = this.keyEnum.S;
        }

    } else if (x > 0 && Math.abs(x) > Math.abs(z)) {
        this.keyEnum.LEFT = 34;
        this.keyEnum.RIGHT = 33;
        this.keyEnum.IN = 37;
        this.keyEnum.OUT = 39;

        if (this.language == "fr") {
            this.leftHandKeyEnum.LEFT = this.keyEnum.C;
            this.leftHandKeyEnum.RIGHT = this.keyEnum.E;
            this.leftHandKeyEnum.WITHIN = this.keyEnum.Q;
            this.leftHandKeyEnum.WITHOUT = this.keyEnum.D;
            this.leftHandKeyEnum.FORWARD = this.keyEnum.Z;
            this.leftHandKeyEnum.BACKWARDS = this.keyEnum.S;
        } else {
            this.leftHandKeyEnum.LEFT = this.keyEnum.C;
            this.leftHandKeyEnum.RIGHT = this.keyEnum.E;
            this.leftHandKeyEnum.WITHIN = this.keyEnum.A;
            this.leftHandKeyEnum.WITHOUT = this.keyEnum.D;
            this.leftHandKeyEnum.FORWARD = this.keyEnum.W;
            this.leftHandKeyEnum.BACKWARDS = this.keyEnum.S;
        }
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
        case this.leftHandKeyEnum.LEFT:
            this.updateModel('left');
            console.log("left");
            break;
        case this.keyEnum.RIGHT:
        case this.leftHandKeyEnum.RIGHT:
            this.updateModel('right');
            break;

        case this.keyEnum.UP:
        case this.leftHandKeyEnum.FORWARD:
            this.updateModel('up');
            break;
        case this.keyEnum.DOWN:
        case this.leftHandKeyEnum.BACKWARDS:
            this.updateModel('down');
            break;

        case this.keyEnum.IN:
        case this.leftHandKeyEnum.WITHIN:
            this.updateModel('in');
            break;
        case this.keyEnum.OUT:
        case this.leftHandKeyEnum.WITHOUT:
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

    IN: 33,
    OUT: 34,

    UP: 38,
    DOWN: 40,

    // US/FR
    Z: 90,
    S: 83,
    Q: 81,
    D: 68,

    W: 87,
    A: 65,

    E: 69,
    C: 67
};

APP.prototype.leftHandKeyEnum = {
    FORWARD: 0,
    BACKWARDS: 0,
    LEFT: 0,
    RIGHT: 0,

    WITHIN: 0,
    WITHOUT: 0
};