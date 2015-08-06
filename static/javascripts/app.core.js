'use strict';

/**
 * App core object
 * @constructor
 */
var APP = APP || {};

APP = function () {
    if (!Detector.webgl) Detector.addGetWebGLMessage();

    this.scene = this.getScene();

    // Detect language (fr/us)
    this.language = window.navigator.userLanguage || window.navigator.language;
    this.initKeyboard(this.language);

    // Set up renderer
    this.container = document.getElementById('container');
    this.renderer = this.getRenderer();
    this.container.appendChild(this.renderer.domElement);

    // Set up camera
    this.camera = this.getCamera();

    // Set up controls
    this.controls = this.getControls();

    // Set up mouse
    this.mouse = {x:0, y:0};
    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;

    // Set up light
    this.light = new THREE.PointLight( 0xffffff );
    this.light.position.set(this.camera.position.x+5, this.camera.position.y+5, this.camera.position.z);
    this.scene.add(this.light);

    // Set up events
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
    window.addEventListener('mousedown', this.handlerMouseDown.bind(this), false);
    window.addEventListener('mousemove', this.handlerMouseMove.bind(this), false);
    window.addEventListener('mousewheel', this.handlerMouseWheel.bind(this), false);
    window.addEventListener('DOMMouseScroll', this.handlerMouseWheel.bind(this), false);
    window.addEventListener('mouseup', this.handlerMouseUp.bind(this), false);
    window.addEventListener('keyup', this.handlerKeyUp.bind(this), false);
    window.addEventListener('keydown', this.handlerKeyDown.bind(this), false);

    // Run
    this.currentId = 0;
    this.run();

    // Animate
    this.animate();

    this.isTweening = false;
    this.isUpdating = false;
    this.someOneHasMoved = false;
    this.cubesToDelete = [];
    this.cubesToCreate = [];
    this.numberOfActiveTweens = 0;
};

APP.prototype.run = function () {

    this.meshes = [];

    // Draw cubes
    for (var z=0; z<4; z+=1)
        for (var y=0; y<4; y+=1)
            for (var x=0; x<4; x+=1)
                {
                    //this.addCube(x, y, z, /*Math.pow(2, i++)*/2)
                }

    for (var i=0; i<3; ++i) {
        this.addNewElement();
    }
    // Draw bounding box
    this.getBoundingBox();
};

APP.prototype.initKeyboard = function(language) {
    if (language == undefined || language != "fr") {
        this.leftHandKeyEnum.FORWARD = this.keyEnum.W;
        this.leftHandKeyEnum.BACKWARDS = this.keyEnum.S;
        this.leftHandKeyEnum.LEFT =this.keyEnum.A;
        this.leftHandKeyEnum.RIGHT = this.keyEnum.D;
    } else {
        this.leftHandKeyEnum.FORWARD = this.keyEnum.Z;
        this.leftHandKeyEnum.BACKWARDS = this.keyEnum.S;
        this.leftHandKeyEnum.LEFT =this.keyEnum.Q;
        this.leftHandKeyEnum.RIGHT = this.keyEnum.D;
    }
    this.leftHandKeyEnum.WITHIN = this.keyEnum.E;
    this.leftHandKeyEnum.WITHOUT = this.keyEnum.C;
};

APP.prototype.getIJKGeneric = function(dimension, variant, invariantOne, invariantTwo) {

    switch (dimension) {
        case 'x': return this.getIJK(variant, invariantOne, invariantTwo);

        case 'y': return this.getIJK(invariantOne, variant, invariantTwo);

        case 'z': return this.getIJK(invariantOne, invariantTwo, variant);
    }
};

APP.prototype.setMetaIJKGeneric = function(dimension, object, value) {
    switch (dimension) {
        case 'x':
            object.meta.i = value;
            object.meta.nx = value*1.1;
            break;

        case 'y':
            object.meta.j = value;
            object.meta.ny = value*1.1;
            break;

        case 'z':
            object.meta.k = value;
            object.meta.nz = value*1.1;
            break;
    }
};

APP.prototype.setMetaIJKFromObject = function(dimension, receiver, giver, direction, overrides) {
    var multiplier = direction == '+' ? 1 : -1;
    var offsetIJK = overrides ? 0 : 1;
    var offsetXYZ = 1.1*offsetIJK;

    switch (dimension) {
        case 'x':
            receiver.meta.i = giver.meta.i + multiplier*offsetIJK;
            receiver.meta.nx = giver.meta.nx + multiplier*offsetXYZ;
            break;

        case 'y':
            receiver.meta.j = giver.meta.j + multiplier*offsetIJK;
            receiver.meta.ny = giver.meta.ny + multiplier*offsetXYZ;
            break;

        case 'z':
            receiver.meta.k = giver.meta.k + multiplier*offsetIJK;
            receiver.meta.nz = giver.meta.nz + multiplier*offsetXYZ;
            break;
    }
};

APP.prototype.getCurrentMetaXYZ = function (dimension, object) {
    switch (dimension) {
        case 'x':
            return object.meta.nx;
            break;

        case 'y':
            return object.meta.ny;
            break;

        case 'z':
            return object.meta.nz;
            break;
    }
};

APP.prototype.getNextMetaXYZ = function (dimension, direction, object) {
    var multiplier = direction == '+' ? 1 : -1;
    var offsetXYZ = 1.1*multiplier;
    switch (dimension) {
        case 'x':
            return object.meta.nx + offsetXYZ;
            break;

        case 'y':
            return object.meta.ny + offsetXYZ;
            break;

        case 'z':
            return object.meta.nz + offsetXYZ;
            break;
    }
};

APP.prototype.initGen = function(dimension, direction, object) {
    var factor = direction == '+' ? 1 : -1;
    switch (dimension) {
        case 'x': return object.meta.i + factor;

        case 'y': return object.meta.j + factor;

        case 'z': return object.meta.k + factor;
    }
};

APP.prototype.stopGen = function(direction, value) {
    switch (direction) {
        case '+':
            return value <= 3;
        case '-':
            return value >= 0;
    }
};

APP.prototype.applyGen = function (direction, value) {
    return (direction == '+' ? value + 1 : value - 1);
};

APP.prototype.loopFactor = function(dimension, direction) {

    var variant, invariantOne, invariantTwo;
    var first, second, third, fourth;
    for (invariantOne=0; invariantOne<4; ++invariantOne) { for (invariantTwo=0; invariantTwo<4; ++invariantTwo) {

        // FIRST TWO
        for (variant = (direction=='+'?0:4); this.stopGen(direction, variant); variant = this.applyGen(direction, variant)) {
            first = this.getIJKGeneric(dimension, variant, invariantOne, invariantTwo);
            if (first !== undefined) break;
        } if (first === undefined) continue;

        this.setMetaIJKGeneric(dimension, first, direction=='+' ? 0 : 3);
        this.setupTween(first.position, dimension, direction=='+' ? 0 : 3.3);

        for (variant=this.initGen(dimension, direction, first); this.stopGen(direction, variant); variant = this.applyGen(direction, variant)) {
            second = this.getIJKGeneric(dimension, variant, invariantOne, invariantTwo);
            if (second !== undefined) break;
        }

        if (second === undefined) {
            continue;
        } else if (second.meta.val === first.meta.val) {
            //console.log("theres a second " + "(x=" + second.meta.i + ", y=" + second.meta.j + ", z=" + second.meta.k + ")");
            this.setMetaIJKFromObject(dimension, second, first, direction, true);
            second.meta.fused = true;
            this.cubesToDelete.push(second);
            this.cubesToDelete.push(first);
            this.cubesToCreate.push(first.meta);
            this.setupTween(second.position, dimension, this.getCurrentMetaXYZ(dimension, first));
        } else {
            this.setMetaIJKFromObject(dimension, second, first, direction, false);
            this.setupTween(second.position, dimension, this.getNextMetaXYZ(dimension, direction, first));
        }

        // LAST TWO
        for (variant=this.initGen(dimension, direction, second); this.stopGen(direction, variant); variant = this.applyGen(direction, variant)) {
            third = this.getIJKGeneric(dimension, variant, invariantOne, invariantTwo);
            if (third !== undefined) break;
        } if (third === undefined) continue;

        if ((!second.meta.fused) && (second.meta.val == third.meta.val)) {
            this.setMetaIJKFromObject(dimension, third, second, direction, true);
            third.meta.fused = true;
            this.cubesToDelete.push(third);
            this.cubesToDelete.push(second);
            this.cubesToCreate.push(second.meta);
            this.setupTween(third.position, dimension, this.getCurrentMetaXYZ(dimension, second));
        } else {
            this.setMetaIJKFromObject(dimension, third, second, direction, false);
            this.setupTween(third.position, dimension, this.getNextMetaXYZ(dimension, direction, second));
        }

        for (variant=this.initGen(dimension, direction, third); this.stopGen(direction, variant); variant = this.applyGen(direction, variant)) {
            fourth = this.getIJKGeneric(dimension, variant, invariantOne, invariantTwo);
            if (fourth !== undefined) break;
        }

        if (fourth !== undefined) {
            if ((!third.meta.fused) && (fourth.meta.val === third.meta.val)) {
                this.setMetaIJKFromObject(dimension, fourth, third, direction, true);
                this.cubesToDelete.push(fourth);
                this.cubesToDelete.push(third);
                this.cubesToCreate.push(fourth.meta);
                this.setupTween(fourth.position, dimension, this.getCurrentMetaXYZ(dimension, third));
            } else {
                this.setMetaIJKFromObject(dimension, fourth, third, direction, false);
                this.setupTween(fourth.position, dimension, this.getNextMetaXYZ(dimension, direction, third));
            }
        }

    }}

    this.defuse();
};

APP.prototype.updateModel = function (direction) {
    this.isUpdating = true;
    this.cubesToDelete = [];
    this.cubesToCreate = [];

    switch(direction) {
        case 'left':
            this.loopFactor('x', '+');
            break;

        case 'right':
            this.loopFactor('x', '-');
            break;


        case 'down':
            this.loopFactor('y', '+');
            break;

        case 'up':
            this.loopFactor('y', '-');
            break;


        case 'in':
            this.loopFactor('z', '+');
            break;

        case 'out':
            this.loopFactor('z', '-');
            break;

        default:
            break;
    }

    this.isUpdating = false;
};

APP.prototype.getIJK = function(i, j, k) {
    var currentMesh;
    for (var meshId in this.meshes) {
        currentMesh = this.meshes[meshId];
        if (currentMesh.meta.i === i && currentMesh.meta.j === j && currentMesh.meta.k === k)
            return currentMesh;
    }

    return undefined;
};
