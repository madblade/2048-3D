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
};

APP.prototype.run = function () {

    this.meshes = new THREE.Group();
    // add objects here

    var material = new THREE.MeshNormalMaterial();
    // var material = new THREE.MeshBasicMaterial({ color: 0xcccccc });

    var geometry = new THREE.BoxGeometry(80, 80, 80, 1, 1, 1);

    var mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.y = Math.PI / 4;
    mesh.position.set(0, 0, 0);
    this.meshes.add(mesh);
    this.scene.add(this.meshes);

    var helper = new THREE.WireframeHelper(mesh, 0x000000);
    this.scene.add(helper);
};

APP.prototype.setupTween = function(obj, prop, targetValue) {
    var update = function () {
        obj[prop] = current.property;
    };

    var current = {property: obj[prop]};
    var target = {property: targetValue};

    var tween = new TWEEN.Tween(current).to(target, 800)
        .easing(TWEEN.Easing.Cubic.Out)
        .onUpdate(update);

    tween.start();
};