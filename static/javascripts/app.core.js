'use strict';

/**
 * App core object
 * @constructor
 */
var APP = APP || {};

APP = function () {
    if (!Detector.webgl) Detector.addGetWebGLMessage();

    this.scene = this.getScene();

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

    // Set up clock
    this.clock = new THREE.Clock();

    // Set up stats
    this.stats = this.getStats();
    this.container.appendChild(this.stats.domElement);

    // Set up light
    this.light = new THREE.PointLight( 0xffffff );
    this.light.position.set(this.camera.position.x+5, this.camera.position.y+5, this.camera.position.z);
    this.scene.add(this.light);

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

    this.isTweening = false;
    this.isUpdating = false;
    this.cubesToDelete = [];
    this.cubesToCreate = [];
    this.numberOfActiveTweens = 0;
};

APP.prototype.run = function () {

    this.meshes = [];

    // Draw cubes
    for (var z=0; z<1; z+=1)
        for (var y=0; y<1; y+=1)
            for (var x=0; x<1; x+=1)
                //this.addCube(x, y, z, /*Math.pow(2, i++)*/64)
                {}

    for (var i=0; i<10; ++i) {
        this.addNewElement();
    }
    // Draw bounding box
    this.addBoundingBox();
};

APP.prototype.addBoundingBox = function() {
    var material = new THREE.LineBasicMaterial({color: 0x0000ff});
    var geometry = new THREE.Geometry();
    var min = -.1-.5;
    var max = 4.4-.5;
    geometry.vertices.push(new THREE.Vector3(min, min, min));
    geometry.vertices.push(new THREE.Vector3(min, min, max));
    geometry.vertices.push(new THREE.Vector3(min, max, max));
    geometry.vertices.push(new THREE.Vector3(min, max, min));
    geometry.vertices.push(new THREE.Vector3(min, min, min));

    geometry.vertices.push(new THREE.Vector3(max, min, min));
    geometry.vertices.push(new THREE.Vector3(max, max, min));
    geometry.vertices.push(new THREE.Vector3(min, max, min));
    geometry.vertices.push(new THREE.Vector3(max, max, min));

    geometry.vertices.push(new THREE.Vector3(max, max, max));
    geometry.vertices.push(new THREE.Vector3(max, min, max));
    geometry.vertices.push(new THREE.Vector3(min, min, max));
    geometry.vertices.push(new THREE.Vector3(min, max, max));

    geometry.vertices.push(new THREE.Vector3(max, max, max));
    geometry.vertices.push(new THREE.Vector3(max, min, max));
    geometry.vertices.push(new THREE.Vector3(max, min, min));

    var line = new THREE.Line(geometry, material);
    this.scene.add(line);
};

APP.prototype.addCube = function (i, j, k, value) {
    var normalized = 2*Math.log(value)/(64*Math.log(2));

    var b = Math.max(0, 255 * (1 - normalized))/256;
    var r = Math.max(0, 255 * (normalized - 1))/256;
    var g = (1 - b - r);

    var material = new THREE.MeshLambertMaterial({ color: new THREE.Color(r, g, b) });
    var geometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(i*1.1, j*1.1, k*1.1);
    mesh.meta = {i:i, j:j, k:k, val:value, nx:i*1.1, ny:j*1.1, nz:k*1.1, fused: false};

    this.scene.add(mesh);
    this.meshes.push(mesh);
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
            return value < 4;
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

        for (variant=this.initGen(dimension, direction, first); this.stopGen(direction, variant); variant = this.applyGen(direction, variant)) {
            second = this.getIJKGeneric(dimension, variant, invariantOne, invariantTwo);
            if (second !== undefined) break;
        }

        this.setupTween(first.position, dimension, direction=='+' ? 0 : 3.3);
        this.setMetaIJKGeneric(dimension, first, direction=='+' ? 0 : 3);

        if (second === undefined) {
            continue;
        } else if (second.meta.val === first.meta.val) {
            this.setMetaIJKFromObject(dimension, second, first, direction, true);
            second.meta.fused = true;
            this.cubesToDelete.push(second);
            this.cubesToDelete.push(first);
            this.cubesToCreate.push(first.meta);
            this.setupTween(second.position, dimension, this.getCurrentMetaXYZ(dimension, first));
        } else {
            this.setupTween(second.position, dimension, this.getNextMetaXYZ(dimension, direction, first));
            this.setMetaIJKFromObject(dimension, second, first, direction, false);
        }

        // LAST TWO
        for (variant=this.initGen(dimension, direction, second); this.stopGen(direction, variant); variant = this.applyGen(direction, variant)) {
            third = this.getIJKGeneric(dimension, variant, invariantOne, invariantTwo);
            if (third !== undefined) break;
        } if (third === undefined) continue;

        for (variant=this.initGen(dimension, direction, third); this.stopGen(direction, variant); variant = this.applyGen(direction, variant)) {
            fourth = this.getIJKGeneric(dimension, variant, invariantOne, invariantTwo);
            if (fourth !== undefined) break;
        }

        if (!second.meta.fused && second.meta.val == third.meta.val) {
            this.setMetaIJKFromObject(dimension, third, second, direction, true);
            third.meta.fused = true;
            this.cubesToDelete.push(third);
            this.cubesToDelete.push(second);
            this.cubesToCreate.push(second.meta);
            this.setupTween(third.position, dimension, this.getCurrentMetaXYZ(dimension, second));
        } else {
            this.setupTween(third.position, dimension, this.getNextMetaXYZ(dimension, direction, second));
            this.setMetaIJKFromObject(dimension, third, second, direction, false);
        }

        if (fourth !== undefined) {
            if (!third.meta.fused && fourth.meta.val === third.meta.val) {
                this.setupTween(fourth.position, dimension, this.getCurrentMetaXYZ(dimension, third));
                this.setMetaIJKFromObject(dimension, fourth, third, direction, true);
                this.cubesToDelete.push(fourth);
                this.cubesToDelete.push(third);
                this.cubesToCreate.push(fourth.meta);
            } else {
                this.setupTween(fourth.position, dimension, this.getNextMetaXYZ(dimension, direction, third));
                this.setMetaIJKFromObject(dimension, fourth, third, direction, false);
            }
        }

    }}
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

    this.defuse();
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
