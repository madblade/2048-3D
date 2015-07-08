'use strict';

APP.prototype.getScene = function () {
    var scene = new THREE.Scene();
    return scene;
};

APP.prototype.getRenderer = function () {
    var renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    // renderer.setClearColor( 0xBBBBBB, 1 );
    renderer.setClearColor(0x000000, 0); // the default
    renderer.setSize(window.innerWidth, window.innerHeight);
    return renderer;
};

APP.prototype.getCamera = function () {
    var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 100000);
    camera.position.set(-10, 100, 300);
    return camera;
};

APP.prototype.getControls = function () {
    var controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    controls.noKeys = true;
    return controls;
};

APP.prototype.getStats = function () {
    var stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    return stats;
};

