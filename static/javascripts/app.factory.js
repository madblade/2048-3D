'use strict';

APP.prototype.getScene = function () {
    var scene = new THREE.Scene();
    return scene;
};

APP.prototype.getRenderer = function () {
    var renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setClearColor(0xACA39C);
    renderer.setSize(window.innerWidth, window.innerHeight);
    return renderer;
};

APP.prototype.getCamera = function () {
    var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 100000);
    camera.position.set(3.3/2+1, 3.3/2+4, 3.3/2+6);
    return camera;
};

APP.prototype.getControls = function () {
    var controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    controls.noKeys = true;
    controls.target = new THREE.Vector3(1.65, 1.65, 1.65);
    return controls;
};

APP.prototype.fillSaveModal = function() {
    this.aModalIsOpen = true;

    if (this.meshes.length<1) return;

    var inner = "[";
    var meshId, currentMesh;
    for (meshId= 0; meshId<this.meshes.length-1; ++meshId) {
        currentMesh = this.meshes[meshId];

        inner += "[";
        inner += currentMesh.meta.i
                + "," + currentMesh.meta.j
                + "," + currentMesh.meta.k
                + "," + currentMesh.meta.val;
        inner += "],";
    }
    currentMesh = this.meshes[meshId];
    inner += "[" +
        currentMesh.meta.i
        + "," + currentMesh.meta.j
        + "," + currentMesh.meta.k
        + "," + currentMesh.meta.val
        + "]]";

    $('#modal-save-raw').html(inner).css('height', '300');
};

APP.prototype.fillChargeModal = function() {
    this.aModalIsOpen = true;
};

APP.prototype.doneSaveModal = function() {
    this.aModalIsOpen = false;
};

APP.prototype.doneChargeModal = function() {
    this.aModalIsOpen = false;
};

APP.prototype.doChargeModal = function() {
    this.aModalIsOpen = false;

    var mod = $('#modal-charge-raw').val();

    for (var meshId in this.meshes)
        this.scene.remove(this.meshes[meshId]);
    this.meshes = [];

    // TODO check validity
    var parsed = JSON.parse(mod);
    for (var parsedId in parsed) {
        this.addCube(parsed[parsedId][0], parsed[parsedId][1],
            parsed[parsedId][2], parsed[parsedId][3]);
    }
};

APP.prototype.getBoundingBox = function() {
    var material = new THREE.LineBasicMaterial({color: 0x1d1d25});
    var geometry = new THREE.Geometry();
    var min = -.6;
    var max = 3.9;
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

    return new THREE.Line(geometry, material);
};

APP.prototype.nextId = function () {
    this.currentId += 1;
    return this.currentId;
};

APP.prototype.addCube = function (i, j, k, value) {

    var color;

    switch(value) {
        case 2:
            color = new THREE.Color(0xEDD9D0); // beige
            break;
        case 4:
            color = new THREE.Color(0xFFD389); // orange-yellow
            break;
        case 8:
            color = new THREE.Color(0xCA5D31); // orange
            break;
        case 16:
            color = new THREE.Color(0x6F0000); // deep red
            break;
        case 32:
            color = new THREE.Color(0x000000); // black
            break;
        case 64:
            color = new THREE.Color(0x59394E); // purple
            break;
        case 128:
            //color = new THREE.Color(0xA9874B);
            color = new THREE.Color(0x0476BD); // full blue
            break;
        case 256:
            //color = new THREE.Color(0x35563A);
            color = new THREE.Color(0x2295FF); // shiny blue
            break;
        case 512:
            //color = new THREE.Color(0x7F280C);
            color = new THREE.Color(0x8BCDFF); // cyan
            break;
        case 1024:
            color = new THREE.Color(0x7B9B7B); // light green
            break;
        case 2048:
            color = new THREE.Color(0x59394E); // true green
            break;
        case 4096:
            color = new THREE.Color(0x4F4335); // ?
            break;
        case 8192:
            color = new THREE.Color(0xFFD389); // ?
            break;
        case 16384:
            color = new THREE.Color(0xF4F5F7); // ?
            break;
        case 32768:
            color = new THREE.Color(0x35563A); // ?
            break;
        case 65536:
            color = new THREE.Color(0xFF6174); // ?
            break;
        case 131072:
            color = new THREE.Color(0xBDD510); // ?
            break;
        case 262144:
            color = new THREE.Color(0x684922); // ?
            break;
        case 524288:
            color = new THREE.Color(0xFFAC00); // ?
            break;
        case 1048576:
            color = new THREE.Color(0x2C60C9); // ?
            break;
        case 2097152:
            color = new THREE.Color(0xCEAACB); // ?
            break;

        default:
            var normalized = 2 * Math.log(value)/(10*Math.log(2));

            var b = Math.max(0, 255 * (1 - normalized))/256;
            var r = Math.max(0, 255 * (normalized - 1))/256;
            var g = (1 - b - r);
            color = new THREE.Color(r, g, b);
            break;
    }

    // Old Textures
    /*
    var canvas = document.createElement('canvas');
    canvas.id = this.nextId();
    var texture = new THREE.Texture(canvas);
    canvas.height = 256;
    canvas.width = 256;

    var context = canvas.getContext("2d");
    context.fillStyle = '#' + color.getHexString();
    context.fillRect(0, 0, 256, 256);
    context.fillStyle = value == 32 ? '#000000' : '#dddddd';
    context.font = "40pt Verdana bold";
    var textSize = context.measureText("" + value);
    context.fillText(value, (canvas.width-textSize.width)/2, (canvas.height+20)/2);
    texture.needsUpdate = true;

    var material = new THREE.MeshLambertMaterial({map : texture});
    */

    // Smooth cubes
    var modifier = new THREE.SubdivisionModifier(2);
    var geometry = new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
    geometry.mergeVertices();
    geometry.computeCentroids();
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    modifier.modify( geometry );

    // Build mesh
    var material = new THREE.MeshLambertMaterial({color : color});
    var mesh = new THREE.Mesh(geometry, material);

    // Init position and meta
    mesh.position.set(i*1.1, j*1.1, k*1.1);
    mesh.meta = {i:i, j:j, k:k, val:value, nx:i*1.1, ny:j*1.1, nz:k*1.1, fused: false};

    this.scene.add(mesh);
    this.meshes.push(mesh);
};