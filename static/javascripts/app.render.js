'use strict';

/**
 * Render scene with camera pov
 */
APP.prototype.render = function () {
    var delta = this.clock.getDelta();
    this.renderer.render(this.scene, this.camera);
};

/**
 * Animate scene
 */
APP.prototype.animate = function () {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
    this.stats.update();
    this.controls.update();
    TWEEN.update();
};

APP.prototype.setupTween = function(obj, prop, targetValue) {
    var update = function () {
        obj[prop] = current.property;
    };

    var current = {property: obj[prop]};
    var target = {property: targetValue};

    var tween = new TWEEN.Tween(current).to(target, 200)
        .easing(TWEEN.Easing.Cubic.Out)
        .onUpdate(update)
        .onComplete(function() {
            this.numberOfActiveTweens --;
            if (this.numberOfActiveTweens == 0) {
                this.deleteCubes(this.cubesToDelete);
                this.createCubes(this.cubesToCreate);
                console.log(this.meshes.length);
            }
            this.isTweening = false;
        }.bind(this));

    this.isTweening = true;
    tween.start();
};

APP.prototype.deleteCubes = function(cubes) {
    for (var cubeId in cubes) {
        this.scene.remove(cubes[cubeId]);
    }

    var currentMesh;
    for (cubeId = this.meshes.length; cubeId >= 0; --cubeId) {
        currentMesh = this.meshes[cubeId];
        for (var delId in cubes) {
            if (cubes[delId] === currentMesh){
                this.meshes.splice(cubeId, 1);
                break;
            }
        }
    }
};

APP.prototype.createCubes = function(cubes) {
    var currentCube;
    for (var cubeId in cubes) {
        currentCube = cubes[cubeId];
        this.addCube(currentCube.i, currentCube.j, currentCube.k, Math.pow(currentCube.val, 2));
    }
};