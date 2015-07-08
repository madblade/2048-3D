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
    var i = 1;

    // Draw cubes
    for (var z=0; z<4; z+=1)
        for (var y=0; y<4; y+=1)
            for (var x=0; x<4; x+=1)
                this.addCube(x, y, z, /*Math.pow(2, i++)*/64)

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
    mesh.cubePosition = {i:i, j:j, k:k, val:value};

    this.scene.add(mesh);
    this.meshes.push(mesh);
};

APP.prototype.updateModel = function (direction) {
    this.isUpdating = true;
    this.cubesToDelete = [];
    this.cubesToCreate = [];

    switch(direction) {
        case 'left':
            // X : invariants : Y, Z

            for (var y=0; y<4; ++y) { for (var z=0; z<4; ++z) {

                // FIRST TWO
                var first;
                var x;
                for (x=0; x<4; ++x) {
                    first = this.getIJK(x, y, z);
                    if (first !== undefined) break;
                }
                if (first === undefined) continue;

                var second;
                for (x=first.cubePosition.i+1; x<4; ++x) {
                    second = this.getIJK(x, y, z);
                    if (second !== undefined) break;
                }
                if (second === undefined) {
                    this.setupTween(first.position, 'x', 0);
                    first.cubePosition.i = 0;
                    this.numberOfActiveTweens ++;
                    continue;
                }

                // Fusion
                if (second.cubePosition.val === first.cubePosition.val) {
                    this.cubesToDelete.push(second);
                    this.cubesToDelete.push(first);
                    this.cubesToCreate.push(first.cubePosition);
                    this.setupTween(second.position, 'x', first.position.x);
                }

                // Juxtaposition
                else {
                    this.setupTween(second.position, 'x', first.position.x+1.1);
                    second.cubePosition.i = first.cubePosition.i+1;
                }
                this.numberOfActiveTweens ++;

                // LAST TWO
                var third;
                for (x=second.cubePosition.i+1; x<4; ++x) {
                    third = this.getIJK(x, y, z);
                    if (third !== undefined) break;
                }
                if (third === undefined) continue;

                var fourth;
                for (x=third.cubePosition.i+1; x<4; ++x) {
                    fourth = this.getIJK(x, y, z);
                    if (fourth !== undefined) break;
                }
                if (fourth === undefined) {
                    this.setupTween(third.position, 'x', second.position.x+1.1);
                    third.cubePosition.i = second.cubePosition.i+1;
                    this.numberOfActiveTweens ++;
                    continue;
                }

                // Fusion
                if (fourth.cubePosition.val === third.cubePosition.val) {
                    this.cubesToDelete.push(fourth);
                    this.cubesToDelete.push(third);
                    this.cubesToCreate.push(third.cubePosition);
                    this.setupTween(fourth.position, 'x', third.position.x);
                }

                // Juxtaposition
                else {
                    this.setupTween(fourth.position, 'x', third.position.x+1.1);
                    fourth.cubePosition.i = third.cubePosition.i+1;
                }
                this.numberOfActiveTweens ++;

            }}

            break;

        case 'right':
            for (var y=0; y<4; ++y) { for (var z=0; z<4; ++z) {

                // FIRST TWO
                var first;
                var x;
                for (x=3; x>=0; --x) {
                    first = this.getIJK(x, y, z);
                    if (first !== undefined) break;
                }
                if (first === undefined) continue;

                var second;
                for (x=first.cubePosition.i-1; x>=0; --x) {
                    second = this.getIJK(x, y, z);
                    if (second !== undefined) break;
                }
                if (second === undefined) {
                    this.setupTween(first.position, 'x', 3.3);
                    first.cubePosition.i = 3;
                    this.numberOfActiveTweens++;
                    continue;
                }

                if (second.cubePosition.val === first.cubePosition.val) {
                    this.cubesToDelete.push(second);
                    this.cubesToDelete.push(first);
                    this.cubesToCreate.push(first.cubePosition);
                    this.setupTween(second.position, 'x', first.position.x);
                } else {
                    this.setupTween(second.position, 'x', first.position.x-1.1);
                    second.cubePosition.i = first.cubePosition.i-1;
                }
                this.numberOfActiveTweens ++;

                // LAST TWO
                var third;
                for (x=second.cubePosition.i-1; x>=0; --x) {
                    third = this.getIJK(x, y, z);
                    if (third !== undefined) break;
                }
                if (third === undefined) continue;

                var fourth;
                for (x=third.cubePosition.i-1; x>=0; --x) {
                    fourth = this.getIJK(x, y, z);
                    if (fourth !== undefined) break;
                }
                if (fourth === undefined) {
                    this.setupTween(third.position, 'x', second.position.x-1.1);
                    third.cubePosition.i = second.cubePosition.i-1;
                    this.numberOfActiveTweens ++;
                    continue;
                }

                // Fusion
                if (fourth.cubePosition.val === third.cubePosition.val) {
                    this.cubesToDelete.push(fourth);
                    this.cubesToDelete.push(third);
                    this.cubesToCreate.push(third.cubePosition);
                    this.setupTween(fourth.position, 'x', third.position.x);
                }

                // Juxtaposition
                else {
                    this.setupTween(fourth.position, 'x', third.position.x-1.1);
                    fourth.cubePosition.i = third.cubePosition.i-1;
                }
                this.numberOfActiveTweens ++;

            }}

            break;

        /////////////////////////////////////////////////////////////////////////
        case 'down':
            // Y : invariants : X, Z

            for (var x=0; x<4; ++x) { for (var z=0; z<4; ++z) {
                var first;
                var y;
                for (y=0; y<4; ++y) {
                    first = this.getIJK(x, y, z);
                    if (first !== undefined) break;
                }
                if (first === undefined) continue;

                var second;
                for (y=first.cubePosition.j+1; y<4; ++y) {
                    second = this.getIJK(x, y, z);
                    if (second !== undefined) break;
                }
                if (second === undefined) {
                    this.setupTween(first.position, 'y', 0);
                    first.cubePosition.j = 0;
                    this.numberOfActiveTweens ++;
                    continue;
                }

                if (second.cubePosition.val === first.cubePosition.val) {
                    this.cubesToDelete.push(second);
                    this.cubesToDelete.push(first);
                    this.cubesToCreate.push(first.cubePosition);
                    this.setupTween(second.position, 'y', first.position.y);
                } else {
                    this.setupTween(second.position, 'y', first.position.y+1.1);
                    second.cubePosition.j = first.cubePosition.j+1;
                }
                this.numberOfActiveTweens ++;

                var third;
                for (y=second.cubePosition.j+1; y<4; ++y) {
                    third = this.getIJK(x, y, z);
                    if (third !== undefined) break;
                }
                if (third === undefined) continue;

                var fourth;
                for (y=third.cubePosition.j+1; y<4; ++y) {
                    fourth = this.getIJK(x, y, z);
                    if (fourth !== undefined) break;
                }
                if (fourth === undefined) {
                    this.setupTween(third.position, 'y', second.position.y+1.1);
                    third.cubePosition.j = second.cubePosition.j+1;
                    this.numberOfActiveTweens ++;
                    continue;
                }

                if (fourth.cubePosition.val === third.cubePosition.val) {
                    this.cubesToDelete.push(fourth);
                    this.cubesToDelete.push(third);
                    this.cubesToCreate.push(third.cubePosition);
                    this.setupTween(fourth.position, 'y', third.position.y);
                } else {
                    this.setupTween(fourth.position, 'y', third.position.y+1.1);
                    fourth.cubePosition.j = third.cubePosition.j+1;
                }
                this.numberOfActiveTweens ++;

            }}
            break;

        case 'up':
            for (var x=0; x<4; ++x) { for (var z=0; z<4; ++z) {

                var first;
                var y;
                for (y=3; y>=0; --y) {
                    first = this.getIJK(x, y, z);
                    if (first !== undefined) break;
                }
                if (first === undefined) continue;

                var second;
                for (y=first.cubePosition.j-1; y>=0; --y) {
                    second = this.getIJK(x, y, z);
                    if (second !== undefined) break;
                }
                if (second === undefined) {
                    this.setupTween(first.position, 'y', 3.3);
                    first.cubePosition.j = 3;
                    this.numberOfActiveTweens++;
                    continue;
                }

                if (second.cubePosition.val === first.cubePosition.val) {
                    this.cubesToDelete.push(second);
                    this.cubesToDelete.push(first);
                    this.cubesToCreate.push(first.cubePosition);
                    this.setupTween(second.position, 'y', first.position.y);
                } else {
                    this.setupTween(second.position, 'y', first.position.y-1.1);
                    second.cubePosition.j = first.cubePosition.j-1;
                }
                this.numberOfActiveTweens ++;

                var third;
                for (y=second.cubePosition.j-1; y>=0; --y) {
                    third = this.getIJK(x, y, z);
                    if (third !== undefined) break;
                }
                if (third === undefined) continue;

                var fourth;
                for (y=third.cubePosition.j-1; y>=0; --y) {
                    fourth = this.getIJK(x, y, z);
                    if (fourth !== undefined) break;
                }
                if (fourth === undefined) {
                    this.setupTween(third.position, 'y', second.position.y-1.1);
                    third.cubePosition.j = second.cubePosition.j-1;
                    this.numberOfActiveTweens ++;
                    continue;
                }

                if (fourth.cubePosition.val === third.cubePosition.val) {
                    this.cubesToDelete.push(fourth);
                    this.cubesToDelete.push(third);
                    this.cubesToCreate.push(third.cubePosition);
                    this.setupTween(fourth.position, 'y', third.position.y);
                } else {
                    this.setupTween(fourth.position, 'y', third.position.y-1.1);
                    fourth.cubePosition.j = third.cubePosition.j-1;
                }
                this.numberOfActiveTweens ++;

            }}
            break;


        // Z : invariants : X, Y
        case 'in':
            for (var x=0; x<4; ++x) { for (var y=0; y<4; ++y) {
                var first;
                var z;
                for (z=0; z<4; ++z) {
                    first = this.getIJK(x, y, z);
                    if (first !== undefined) break;
                }
                if (first === undefined) continue;

                var second;
                for (z=first.cubePosition.k+1; z<4; ++z) {
                    second = this.getIJK(x, y, z);
                    if (second !== undefined) break;
                }
                if (second === undefined) {
                    this.setupTween(first.position, 'z', 0);
                    first.cubePosition.k = 0;
                    this.numberOfActiveTweens ++;
                    continue;
                }

                if (second.cubePosition.val === first.cubePosition.val) {
                    this.cubesToDelete.push(second);
                    this.cubesToDelete.push(first);
                    this.cubesToCreate.push(first.cubePosition);
                    this.setupTween(second.position, 'z', first.position.z);
                } else {
                    this.setupTween(second.position, 'z', first.position.z+1.1);
                    second.cubePosition.k = first.cubePosition.k+1;
                }
                this.numberOfActiveTweens ++;

                var third;
                for (z=second.cubePosition.k+1; z<4; ++z) {
                    third = this.getIJK(x, y, z);
                    if (third !== undefined) break;
                }
                if (third === undefined) continue;

                var fourth;
                for (z=third.cubePosition.k+1; z<4; ++z) {
                    fourth = this.getIJK(x, y, z);
                    if (fourth !== undefined) break;
                }
                if (fourth === undefined) {
                    this.setupTween(third.position, 'z', second.position.z+1.1);
                    third.cubePosition.k = second.cubePosition.k+1;
                    this.numberOfActiveTweens ++;
                    continue;
                }

                if (fourth.cubePosition.val === third.cubePosition.val) {
                    this.cubesToDelete.push(fourth);
                    this.cubesToDelete.push(third);
                    this.cubesToCreate.push(third.cubePosition);
                    this.setupTween(fourth.position, 'z', third.position.z);
                } else {
                    this.setupTween(fourth.position, 'z', third.position.z+1.1);
                    fourth.cubePosition.k = third.cubePosition.k+1;
                }
                this.numberOfActiveTweens ++;

            }}
            break;

        case 'out':
            console.log("out1");
            for (var x=0; x<4; ++x) { for (var y=0; y<4; ++y) {

                var first;
                var z;
                for (z=3; z>=0; --z) {
                    first = this.getIJK(x, y, z);
                    if (first !== undefined) break;
                }
                if (first === undefined) continue;

                var second;
                for (z=first.cubePosition.k-1; z>=0; --z) {
                    second = this.getIJK(x, y, z);
                    if (second !== undefined) break;
                }
                if (second === undefined) {
                    this.setupTween(first.position, 'z', 3.3);
                    first.cubePosition.k = 3;
                    this.numberOfActiveTweens++;
                    continue;
                }

                if (second.cubePosition.val === first.cubePosition.val) {
                    this.cubesToDelete.push(second);
                    this.cubesToDelete.push(first);
                    this.cubesToCreate.push(first.cubePosition);
                    this.setupTween(second.position, 'z', first.position.z);
                } else {
                    this.setupTween(second.position, 'z', first.position.z-1.1);
                    second.cubePosition.k = first.cubePosition.k-1;
                }
                this.numberOfActiveTweens ++;

                var third;
                for (z=second.cubePosition.k-1; z>=0; --z) {
                    third = this.getIJK(x, y, z);
                    if (third !== undefined) break;
                }
                if (third === undefined) continue;

                var fourth;
                for (z=third.cubePosition.k-1; z>=0; --z) {
                    fourth = this.getIJK(x, y, z);
                    if (fourth !== undefined) break;
                }
                if (fourth === undefined) {
                    this.setupTween(third.position, 'z', second.position.z-1.1);
                    third.cubePosition.k = second.cubePosition.k-1;
                    this.numberOfActiveTweens ++;
                    continue;
                }

                if (fourth.cubePosition.val === third.cubePosition.val) {
                    this.cubesToDelete.push(fourth);
                    this.cubesToDelete.push(third);
                    this.cubesToCreate.push(third.cubePosition);
                    this.setupTween(fourth.position, 'z', third.position.z);
                } else {
                    this.setupTween(fourth.position, 'z', third.position.z-1.1);
                    fourth.cubePosition.k = third.cubePosition.k-1;
                }
                this.numberOfActiveTweens ++;
            }}

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
        if (currentMesh.cubePosition.i === i && currentMesh.cubePosition.j === j && currentMesh.cubePosition.k === k)
            return currentMesh;
    }

    return undefined;
};
