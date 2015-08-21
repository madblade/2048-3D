'use strict';

/**
 * Render scene with camera pov
 */
APP.prototype.render = function () {
    this.renderer.render(this.scene, this.camera);
};

/**
 * Animate scene
 */
APP.prototype.animate = function () {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
    this.controls.update();
    TWEEN.update();
};

APP.prototype.setupTweenSimple = function(obj, prop, targetValue) {
    this.setupTweenSimpleAdaptee(obj, prop, targetValue);
};

APP.prototype.setupTweenSimpleAdaptee = function(obj, prop, targetValue) {
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
                this.isTweening = false;
            }
        }.bind(this));

    this.numberOfActiveTweens ++;
    this.isTweening = true;
    tween.start();
};

APP.prototype.setupTween = function(obj, prop, targetValue) {
    if (obj[prop] !== targetValue) this.someOneHasMoved = true;
    this.setupTweenAdaptee(obj, prop, targetValue);
};

APP.prototype.setupTweenAdaptee = function(obj, prop, targetValue) {
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
                if (this.someOneHasMoved) this.addNewElement();
                this.isTweening = false;
                this.someOneHasMoved = false;
            }
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
        this.addCube(currentCube.i, currentCube.j, currentCube.k, currentCube.val*2);
    }
};

APP.prototype.addNewElement = function() {
    var i = Math.floor(Math.random()*4);
    var j = Math.floor(Math.random()*4);
    var k = Math.floor(Math.random()*4);
    var currentTry=0;
    var maxTries = 1000;
    while (this.isNotValid(i, j, k) && currentTry < maxTries) {
        i = Math.floor(Math.random()*4);
        j = Math.floor(Math.random()*4);
        k = Math.floor(Math.random()*4);
        currentTry ++;
    }

    if (currentTry > 900) {
        console.log("Seems bad.");
    } else {
        var mesh = this.addCube(i, j, k, Math.random() > 0.3 ? 2 : 4);
        mesh.scale.set(0.1, 0.1, 0.1);
        this.setupTweenSimple(mesh.scale, 'x', 1.0);
        this.setupTweenSimple(mesh.scale, 'y', 1.0);
        this.setupTweenSimple(mesh.scale, 'z', 1.0);
    }
};


APP.prototype.isNotValid = function(i, j, k) {
    return (this.getIJK(i, j, k) !== undefined);
};