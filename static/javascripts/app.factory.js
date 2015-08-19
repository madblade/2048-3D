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
    this.doingModal();

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

APP.prototype.doneModal = function() {
    this.aModalIsOpen = false;
};

APP.prototype.doingModal = function() {
    this.aModalIsOpen = true;
};

APP.prototype.doChargeModal = function() {

    var mod = $('#modal-charge-raw').val();

    for (var meshId in this.meshes)
        this.scene.remove(this.meshes[meshId]);
    this.meshes = [];

    if (mod == undefined || mod.length == 0) {
        console.warn("WARN: unsupported text format.");
        return;
    }

    var parsed = JSON.parse(mod);
    for (var testId in parsed) {
        if (parsed[testId].length != 4) {
            console.warn("WARN: unsupported charge string format.");
            return;
        }
        for (var i = 0; i<4; ++i)
            if (parsed[testId][i] !== parseInt(parsed[testId][i])) {
                console.warn("WARN: charge string must be composed of integers.");
                return;
            }

        var mustBeInteger = Math.log(parsed[testId][3])/Math.log(2);
        if (mustBeInteger !== parseInt(mustBeInteger)) {
            console.warn("WARN: last integer must be a power of two.");
            return;
        }
    }

    for (var parsedId in parsed) {
        this.addCube(parsed[parsedId][0], parsed[parsedId][1],
            parsed[parsedId][2], parsed[parsedId][3]);
    }
};

APP.prototype.fillHelpModal = function() {
    this.doingModal();

    if (this.leftHandKeyEnum.FORWARD == this.keyEnum.W) {
        $('#top-key').html("W");
    } else if (this.leftHandKeyEnum.FORWARD == this.keyEnum.Z) {
        $('#top-key').html("Z");
    }

    if (this.leftHandKeyEnum.LEFT == this.keyEnum.Q) {
        $('#left-key').html("Q");
    } else if (this.leftHandKeyEnum.LEFT == this.keyEnum.A) {
        $('#left-key').html("A");
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

    var material;

    switch(value) {
        case 2:
            // Grey
            material = new THREE.MeshLambertMaterial({
                color : new THREE.Color(0xffffff),
                transparent:true,
                opacity: 0.3
            });
            break;
        case 4:
            material = new THREE.MeshLambertMaterial({
                color : new THREE.Color(0xD1B39B),
                transparent:true,
                opacity: 0.6
            });
            break;
        case 8:
            // Bronze
            material = new THREE.MeshPhongMaterial({color : new THREE.Color(0xCC8E5E)});
            break;
        case 16:
            // Silver
            material = new THREE.MeshPhongMaterial({
                color : new THREE.Color(0xC0C0C0)
            });
            break;
        case 32:
            // Gold
            material = new THREE.MeshPhongMaterial({
                color : new THREE.Color(0xFFD700)
            });
            break;
        case 64:
            // Sapphire
            material = new THREE.MeshLambertMaterial({
                color : new THREE.Color(0x0f52ba),
                transparent: true,
                shininess: 100,
                opacity: 0.9
            });
            break;
        case 128:
            // Emerald
            material = new THREE.MeshLambertMaterial({
                color : new THREE.Color(0x50c878),
                transparent: true,
                shininess: 100,
                opacity: 0.9
            });
            break;
        case 256:
            // Ruby
            material = new THREE.MeshLambertMaterial({
                color : new THREE.Color(0xe0115f),
                transparent: true,
                shininess: 100,
                opacity: 0.9
            });
            break;
        case 512:
            // Diamond
            material = new THREE.MeshLambertMaterial({
                color : new THREE.Color(0xB9F2FF),
                shininess: 100
            });
            break;
        case 1024:
            material = new THREE.MeshLambertMaterial({
                color : new THREE.Color(0xEDD9D0)
            });
            break;
        case 2048:
            //break;
        case 4096:
            //break;
        case 8192:
            //break;
        case 16384:
            //break;
        case 32768:
            //break;
        case 65536:
            //break;
        case 131072:
            //break;
        case 262144:
            //break;
        case 524288:
            //break;
        case 1048576:
            //break;
        case 2097152:
            //break;

        default:
            var normalized = 2 * Math.log(value)/(10*Math.log(2));

            var b = Math.max(0, 255 * (1 - normalized))/256;
            var r = Math.max(0, 255 * (normalized - 1))/256;
            var g = (1 - b - r);

            material = new THREE.MeshLambertMaterial({color : new THREE.Color(r, g, b)});
            break;
    }

    //TODO animate add cube

    // Smooth cubes
    var modifier = new THREE.SubdivisionModifier(2);
    var geometry = new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
    geometry.mergeVertices();
    geometry.computeCentroids();
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    modifier.modify( geometry );

    // Build mesh
    var mesh = new THREE.Mesh(geometry, material);

    // Init position and meta
    mesh.position.set(i*1.1, j*1.1, k*1.1);
    mesh.meta = {i:i, j:j, k:k, val:value, nx:i*1.1, ny:j*1.1, nz:k*1.1, fused: false};

    this.scene.add(mesh);
    this.meshes.push(mesh);
};