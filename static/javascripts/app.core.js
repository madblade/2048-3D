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

APP.prototype.loopFactor = function(dimension, direction) {

    var variant, invariantOne, invariantTwo;
    var first, second, third, fourth;
    for (invariantOne=0; invariantOne<4; ++invariantOne) { for (invariantTwo=0; invariantTwo<4; ++invariantTwo) {

        // FIRST TWO
        for (variant=0; variant<4; ++variant) {
            first = this.getIJKGeneric(dimension, variant, invariantOne, invariantTwo);
            if (first !== undefined) break;
        } if (first === undefined) continue;

        for (variant=first.meta.i+1; variant<4; ++variant) {
            second = this.getIJKGeneric(dimension, variant, invariantOne, invariantTwo);
            if (second !== undefined) break;
        }

        if (second === undefined) {
            this.setupTween(first.position, dimension, direction=='+' ? 0 : 3.3);
            this.setMetaIJKGeneric(dimension, first, direction=='+' ? 0 : 3.3);
            this.numberOfActiveTweens++;
            continue;

        } else if (second.meta.val === first.meta.val) {
            this.setMetaIJKFromObject(dimension, second, first, direction, true);
            second.meta.fused = true;
            this.cubesToDelete.push(second);
            this.cubesToDelete.push(first);
            this.cubesToCreate.push(first.meta);
            this.setupTween(second.position, dimension, first.meta.nx);
        } else {
            this.setMetaIJKFromObject(dimension, second, first, direction, true);
            this.setupTween(second.position, dimension, first.meta.nx+1.1);
        }
        this.numberOfActiveTweens++;

        // LAST TWO
        for (variant=second.meta.i+1; variant<4; ++variant) {
            third = this.getIJKGeneric(dimension, variant, invariantOne, invariantTwo);
            if (third !== undefined) break;
        } if (third === undefined) continue;

        for (variant=third.meta.i+1; variant<4; ++variant) {
            fourth = this.getIJKGeneric(dimension, variant, invariantOne, invariantTwo);
            if (fourth !== undefined) break;
        }

        if (!second.meta.fused && second.meta.val == third.meta.val) {
            this.setupTween(third.position, dimension, second.meta.nx);
            this.setMetaIJKFromObject(dimension, third, second, direction, true);
            third.meta.fused = true;
        } else {
            this.setupTween(third.position, dimension, second.meta.nx+1.1);
            third.meta.i = second.meta.i+1;
            third.meta.nx = second.meta.nx+1.1;
        }
        this.numberOfActiveTweens ++;

        if (fourth !== undefined) {
            if (!second.meta.fused && second.meta.val == third.meta.val) {
                this.setupTween(third.position, dimension, second.meta.nx);
                this.setMetaIJKFromObject(dimension, third, second, direction, true);

                this.setupTween(fourth.position, dimension, third.meta.nx+1.1);
                this.setMetaIJKFromObject(dimension, third, second, direction, false);

                this.numberOfActiveTweens += 2;

            } else {
                if (!third.meta.fused && fourth.meta.val === third.meta.val) {
                    this.setupTween(fourth.position, dimension, third.meta.nx);
                    this.setMetaIJKFromObject(dimension, fourth, third, direction, true);
                    this.cubesToDelete.push(fourth);
                    this.cubesToDelete.push(third);
                    this.cubesToCreate.push(fourth.meta);
                } else {
                    this.setupTween(fourth.position, dimension, third.meta.nx+1.1);
                    this.setMetaIJKFromObject(dimension, fourth, third, direction, false);
                }

                this.numberOfActiveTweens ++;
            }
        }

    }}
};

APP.prototype.updateModel = function (direction) {
    this.isUpdating = true;
    this.cubesToDelete = [];
    this.cubesToCreate = [];

    var x, y, z;
    var first, second, third, fourth;
    switch(direction) {
        case 'left':
            // X : invariants : Y, Z

            this.loopFactor('x', '+');

            break;

        case 'right':
            for (y=0; y<4; ++y) { for (z=0; z<4; ++z) {

                // FIRST TWO
                for (x=3; x>=0; --x) {
                    first = this.getIJK(x, y, z);
                    if (first !== undefined) break;
                }
                if (first === undefined) continue;

                for (x=first.meta.i-1; x>=0; --x) {
                    second = this.getIJK(x, y, z);
                    if (second !== undefined) break;
                }
                if (second === undefined) {
                    this.setupTween(first.position, 'x', 3.3);
                    first.meta.i = 3;
                    this.numberOfActiveTweens++;
                    continue;
                }

                if (second.meta.val === first.meta.val) {
                    this.cubesToDelete.push(second);
                    this.cubesToDelete.push(first);
                    this.cubesToCreate.push(first.meta);
                    this.setupTween(second.position, 'x', first.position.x);
                    //TODO define that is a fusion.
                } else {
                    this.setupTween(second.position, 'x', first.position.x-1.1);
                    second.meta.i = first.meta.i-1;
                }
                this.numberOfActiveTweens ++;

                // LAST TWO
                for (x=second.meta.i-1; x>=0; --x) {
                    third = this.getIJK(x, y, z);
                    if (third !== undefined) break;
                }
                if (third === undefined) continue;

                for (x=third.meta.i-1; x>=0; --x) {
                    fourth = this.getIJK(x, y, z);
                    if (fourth !== undefined) break;
                }
                if (fourth === undefined) {
                    this.setupTween(third.position, 'x', second.position.x-1.1);
                    third.meta.i = second.meta.i-1;
                    this.numberOfActiveTweens ++;
                    continue;
                }

                // Fusion
                if (fourth.meta.val === third.meta.val) {
                    this.cubesToDelete.push(fourth);
                    this.cubesToDelete.push(third);
                    this.cubesToCreate.push(third.meta);
                    this.setupTween(fourth.position, 'x', third.position.x);
                }

                // Juxtaposition
                else {
                    this.setupTween(fourth.position, 'x', third.position.x-1.1);
                    fourth.meta.i = third.meta.i-1;
                }
                this.numberOfActiveTweens ++;

            }}

            break;

        /////////////////////////////////////////////////////////////////////////
        case 'down':
            // Y : invariants : X, Z

            for (x=0; x<4; ++x) { for (z=0; z<4; ++z) {
                for (y=0; y<4; ++y) {
                    first = this.getIJK(x, y, z);
                    if (first !== undefined) break;
                }
                if (first === undefined) continue;

                for (y=first.meta.j+1; y<4; ++y) {
                    second = this.getIJK(x, y, z);
                    if (second !== undefined) break;
                }
                if (second === undefined) {
                    this.setupTween(first.position, 'y', 0);
                    first.meta.j = 0;
                    this.numberOfActiveTweens ++;
                    continue;
                }

                if (second.meta.val === first.meta.val) {
                    this.cubesToDelete.push(second);
                    this.cubesToDelete.push(first);
                    this.cubesToCreate.push(first.meta);
                    this.setupTween(second.position, 'y', first.position.y);
                } else {
                    this.setupTween(second.position, 'y', first.position.y+1.1);
                    second.meta.j = first.meta.j+1;
                }
                this.numberOfActiveTweens ++;

                for (y=second.meta.j+1; y<4; ++y) {
                    third = this.getIJK(x, y, z);
                    if (third !== undefined) break;
                }
                if (third === undefined) continue;

                for (y=third.meta.j+1; y<4; ++y) {
                    fourth = this.getIJK(x, y, z);
                    if (fourth !== undefined) break;
                }
                if (fourth === undefined) {
                    this.setupTween(third.position, 'y', second.position.y+1.1);
                    third.meta.j = second.meta.j+1;
                    this.numberOfActiveTweens ++;
                    continue;
                }

                if (fourth.meta.val === third.meta.val) {
                    this.cubesToDelete.push(fourth);
                    this.cubesToDelete.push(third);
                    this.cubesToCreate.push(third.meta);
                    this.setupTween(fourth.position, 'y', third.position.y);
                } else {
                    this.setupTween(fourth.position, 'y', third.position.y+1.1);
                    fourth.meta.j = third.meta.j+1;
                }
                this.numberOfActiveTweens ++;

            }}
            break;

        case 'up':
            for (x=0; x<4; ++x) { for (z=0; z<4; ++z) {
                for (y=3; y>=0; --y) {
                    first = this.getIJK(x, y, z);
                    if (first !== undefined) break;
                }
                if (first === undefined) continue;

                for (y=first.meta.j-1; y>=0; --y) {
                    second = this.getIJK(x, y, z);
                    if (second !== undefined) break;
                }
                if (second === undefined) {
                    this.setupTween(first.position, 'y', 3.3);
                    first.meta.j = 3;
                    this.numberOfActiveTweens++;
                    continue;
                }

                if (second.meta.val === first.meta.val) {
                    this.cubesToDelete.push(second);
                    this.cubesToDelete.push(first);
                    this.cubesToCreate.push(first.meta);
                    this.setupTween(second.position, 'y', first.position.y);
                } else {
                    this.setupTween(second.position, 'y', first.position.y-1.1);
                    second.meta.j = first.meta.j-1;
                }
                this.numberOfActiveTweens ++;

                for (y=second.meta.j-1; y>=0; --y) {
                    third = this.getIJK(x, y, z);
                    if (third !== undefined) break;
                }
                if (third === undefined) continue;

                for (y=third.meta.j-1; y>=0; --y) {
                    fourth = this.getIJK(x, y, z);
                    if (fourth !== undefined) break;
                }
                if (fourth === undefined) {
                    this.setupTween(third.position, 'y', second.position.y-1.1);
                    third.meta.j = second.meta.j-1;
                    this.numberOfActiveTweens ++;
                    continue;
                }

                if (fourth.meta.val === third.meta.val) {
                    this.cubesToDelete.push(fourth);
                    this.cubesToDelete.push(third);
                    this.cubesToCreate.push(third.meta);
                    this.setupTween(fourth.position, 'y', third.position.y);
                } else {
                    this.setupTween(fourth.position, 'y', third.position.y-1.1);
                    fourth.meta.j = third.meta.j-1;
                }
                this.numberOfActiveTweens ++;

            }}
            break;


        // Z : invariants : X, Y
        case 'in':
            for (x=0; x<4; ++x) { for (y=0; y<4; ++y) {
                for (z=0; z<4; ++z) {
                    first = this.getIJK(x, y, z);
                    if (first !== undefined) break;
                }
                if (first === undefined) continue;

                for (z=first.meta.k+1; z<4; ++z) {
                    second = this.getIJK(x, y, z);
                    if (second !== undefined) break;
                }
                if (second === undefined) {
                    this.setupTween(first.position, 'z', 0);
                    first.meta.k = 0;
                    this.numberOfActiveTweens ++;
                    continue;
                }

                if (second.meta.val === first.meta.val) {
                    this.cubesToDelete.push(second);
                    this.cubesToDelete.push(first);
                    this.cubesToCreate.push(first.meta);
                    this.setupTween(second.position, 'z', first.position.z);
                } else {
                    this.setupTween(second.position, 'z', first.position.z+1.1);
                    second.meta.k = first.meta.k+1;
                }
                this.numberOfActiveTweens ++;

                for (z=second.meta.k+1; z<4; ++z) {
                    third = this.getIJK(x, y, z);
                    if (third !== undefined) break;
                }
                if (third === undefined) continue;

                for (z=third.meta.k+1; z<4; ++z) {
                    fourth = this.getIJK(x, y, z);
                    if (fourth !== undefined) break;
                }
                if (fourth === undefined) {
                    this.setupTween(third.position, 'z', second.position.z+1.1);
                    third.meta.k = second.meta.k+1;
                    this.numberOfActiveTweens ++;
                    continue;
                }

                if (fourth.meta.val === third.meta.val) {
                    this.cubesToDelete.push(fourth);
                    this.cubesToDelete.push(third);
                    this.cubesToCreate.push(third.meta);
                    this.setupTween(fourth.position, 'z', third.position.z);
                } else {
                    this.setupTween(fourth.position, 'z', third.position.z+1.1);
                    fourth.meta.k = third.meta.k+1;
                }
                this.numberOfActiveTweens ++;

            }}
            break;

        case 'out':
            console.log("out1");
            for (x=0; x<4; ++x) { for (y=0; y<4; ++y) {

                for (z=3; z>=0; --z) {
                    first = this.getIJK(x, y, z);
                    if (first !== undefined) break;
                }
                if (first === undefined) continue;

                for (z=first.meta.k-1; z>=0; --z) {
                    second = this.getIJK(x, y, z);
                    if (second !== undefined) break;
                }
                if (second === undefined) {
                    this.setupTween(first.position, 'z', 3.3);
                    first.meta.k = 3;
                    this.numberOfActiveTweens++;
                    continue;
                }

                if (second.meta.val === first.meta.val) {
                    this.cubesToDelete.push(second);
                    this.cubesToDelete.push(first);
                    this.cubesToCreate.push(first.meta);
                    this.setupTween(second.position, 'z', first.position.z);
                } else {
                    this.setupTween(second.position, 'z', first.position.z-1.1);
                    second.meta.k = first.meta.k-1;
                }
                this.numberOfActiveTweens ++;

                for (z=second.meta.k-1; z>=0; --z) {
                    third = this.getIJK(x, y, z);
                    if (third !== undefined) break;
                }
                if (third === undefined) continue;

                for (z=third.meta.k-1; z>=0; --z) {
                    fourth = this.getIJK(x, y, z);
                    if (fourth !== undefined) break;
                }
                if (fourth === undefined) {
                    this.setupTween(third.position, 'z', second.position.z-1.1);
                    third.meta.k = second.meta.k-1;
                    this.numberOfActiveTweens ++;
                    continue;
                }

                if (fourth.meta.val === third.meta.val) {
                    this.cubesToDelete.push(fourth);
                    this.cubesToDelete.push(third);
                    this.cubesToCreate.push(third.meta);
                    this.setupTween(fourth.position, 'z', third.position.z);
                } else {
                    this.setupTween(fourth.position, 'z', third.position.z-1.1);
                    fourth.meta.k = third.meta.k-1;
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
        if (currentMesh.meta.i === i && currentMesh.meta.j === j && currentMesh.meta.k === k)
            return currentMesh;
    }

    return undefined;
};
