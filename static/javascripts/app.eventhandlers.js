'use strict';

APP.prototype.onWindowResize = function () {
    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
};

APP.prototype.handlerMouseDown = function (event) {
    if (this.aModalIsOpen) {
        event.stopPropagation();
    }
};

APP.prototype.handlerMouseWheel = function (event) {
    event.preventDefault();

    var c = this.camera.position;
    this.light.position.set(c.x + 5, c.y + 5, c.z);
};

APP.prototype.handlerMouseMove = function (event) {
    if (this.aModalIsOpen) {
        event.stopPropagation();
        return;
    }

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
    if (this.aModalIsOpen) {
        event.stopPropagation();
        return;
    }

    event.preventDefault();
};

APP.prototype.handlerKeyUp = function (event) {
    if (this.aModalIsOpen) {
        event.stopPropagation();
        return;
    }

    event.preventDefault();
    if (this.isTweening || this.isUpdating) return;

    switch (event.keyCode) {
        case this.keyEnum.LEFT:
        case this.leftHandKeyEnum.LEFT:
            this.updateModel('left');
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
    //event.preventDefault();
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

APP.prototype.manageMobile = function() {
    var startX,
        startY,
        dX, dY, daX, daY,
        threshold = 150, //required min distance traveled to be considered swipe
        allowedTime = 250, // maximum time allowed to travel that distance
        elapsedTime,
        startTime;
    var valid = true;

    window.addEventListener('touchstart', function(e){
        var numberTouches = e.touches.length;
        valid = (numberTouches > 1);
        if (valid) e.preventDefault();

        var touchobj = e.changedTouches[0];
        dX = 0; dY = 0; daX = 0; daY = 0;
        startX = touchobj.pageX;
        startY = touchobj.pageY;
        startTime = new Date().getTime(); // record time when finger first makes contact with surface
    }, false);

    window.addEventListener('touchmove', function(e){
        if (e.touches.length > 1) {
            e.preventDefault(); // prevent three.js controls
            valid = false;
        }
    }, false);

    var scope = this;
    window.addEventListener('touchend', function(e){
        if (!valid) return;
        e.preventDefault();

        var touchobj = e.changedTouches[0];
        dX = touchobj.pageX - startX; daX = Math.abs(dX);
        dY = touchobj.pageY - startY; daY = Math.abs(dY);

        elapsedTime = new Date().getTime() - startTime; // get time elapsed
        var hasSwiped = elapsedTime <= allowedTime;

        var toRight =   (hasSwiped && daX > threshold && daY <= 100 && dX >= 0);
        var toLeft =    (hasSwiped && daX > threshold && daY <= 100 && dX < 0);
        var toTop =     (hasSwiped && daY > threshold && daX <= 100 && dY < 0);
        var toBottom =  (hasSwiped && daY > threshold && daX <= 100 && dY >= 0);

        var nb = 0;
        if (toRight) nb++; if (toLeft) nb++; if (toTop) nb++; if (toBottom) nb++;
        if (nb === 0) {
        } else if (nb === 1) {
            if (toRight) scope.updateModel('right');
            if (toLeft) scope.updateModel('left');
            if (toTop) scope.updateModel('up');
            if (toBottom) scope.updateModel('down');
        } else {
            console.log("Error in touch swipe detection...");
        }

    }, false);
};