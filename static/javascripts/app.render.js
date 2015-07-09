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
                //this.addNewElement();
                //this.addNewElement();
            }
            this.isTweening = false;
        }.bind(this));

    this.numberOfActiveTweens ++;
    this.isTweening = true;
    tween.start();
};

APP.prototype.defuse = function() {
    for (var meshId in this.meshes)
        this.meshes[meshId].meta.fused = false;
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
        this.addCube(currentCube.i, currentCube.j, currentCube.k, currentCube.val*currentCube.val); // TODO **2
    }
};

APP.prototype.addNewElement = function() {
    var i = Math.floor(Math.random()*4);
    var j = Math.floor(Math.random()*4);
    var k = Math.floor(Math.random()*4);
    var currentTry=0;
    var maxTries = 10000;
    while (this.isNotValid(i, j, k) && currentTry < maxTries) {
        i = Math.floor(Math.random()*4);
        j = Math.floor(Math.random()*4);
        k = Math.floor(Math.random()*4);
        currentTry ++;
    }

    if (currentTry > 9000) {
        console.log("Loser.");
    } else {
        this.addCube(i, j, k, 64);
    }
};


APP.prototype.isNotValid = function(i, j, k) {
    if (this.getIJK(i, j, k) === undefined) return false;
    return true;
};