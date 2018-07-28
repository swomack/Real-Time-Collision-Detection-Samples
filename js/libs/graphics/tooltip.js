'use strict';


let tooltip_scale_x = 0.0025;
let tooltip_scale_y = 0.0025;
let tooltip_scale_z = 0.0020;

let tooltip_scale_factor = 0.1;

function getScalingFactor() {
    let scale_obj = {};
    scale_obj.x = tooltip_scale_x;
    scale_obj.y = tooltip_scale_y;
    scale_obj.z = tooltip_scale_z;

    return scale_obj;
}


// call scale tooltip after postion is set and after updating the matrix world
// optional params: text, position
function tooltipControl(parent, camera, text, position) {
    this.parent = parent;
    this.camera = camera;
    this.tooltipControlMesh = new THREE.Object3D();
    this.parent.add(this.getTooltipObject());
    this.spriteName = "tooltip";
    if (text !== undefined)
        this.setText(text);

    if (position !== undefined)
        this.setPosition(position);
}

tooltipControl.prototype.getTooltipObject = function () {
    return this.tooltipControlMesh;
};

tooltipControl.prototype.setParent = function (parent) {
    if (this.parent !== undefined)
        this.parent.remove(this.getTooltipObject());
    this.parent = parent;
    parent.add(this.getTooltipObject());
};

tooltipControl.prototype.removeFromParent = function () {
    if (this.parent !== undefined)
        this.parent.remove(this.getTooltipObject());
    this.parent = undefined;
};

tooltipControl.prototype.show = function (show) {
    this.getTooltipObject().visible = show;
};

tooltipControl.prototype.addTextSprite = function (text, configSprite) {
    let tooltipSpriteMesh = this.getTooltipObject().getObjectByName(this.spriteName);
    if (tooltipSpriteMesh) {
        let canvas = getCanvasForText(text, configSprite);
        let texture = tooltipSpriteMesh.material.map;
        if (texture) {
            texture.image = canvas;
        }
        else {
            texture = new THREE.Texture(canvas);
            tooltipSpriteMesh.material.map = texture;
        }
        texture.needsUpdate = true;
        tooltipSpriteMesh.scale_width = canvas.width;
        tooltipSpriteMesh.scale_height = canvas.height;
    }
    else {
        tooltipSpriteMesh = makeTextSprite(text, configSprite);
        tooltipSpriteMesh.name = this.spriteName;
        this.getTooltipObject().add(tooltipSpriteMesh);
    }

    let factor = tooltipSpriteMesh.scale_width;
    tooltipSpriteMesh.another_factor = factor;

    tooltipSpriteMesh.scale.set(0.16 * factor, (0.16 * factor * tooltipSpriteMesh.scale_height) / tooltipSpriteMesh.scale_width, 1);
    this.scaleTooltipWrapper();
};


tooltipControl.prototype.setText = function (text, configSprite) {
    this.addTextSprite(text, configSprite);
};

tooltipControl.prototype.setPosition = function (position) {
    this.getTooltipObject().position.copy(position);
};

tooltipControl.prototype.getPosition = function () {
    return this.tooltipControlMesh.position.clone();
};

tooltipControl.prototype.scaleTooltipWrapper = function() {
    this.camera.updateMatrixWorld(true);
    let camera_actualPos = this.camera.getWorldPosition();
    scaleTooltip(this.getTooltipObject(), camera_actualPos);
};

tooltipControl.prototype.update = function() {
    this.scaleTooltipWrapper();
};

let scaleVec = new THREE.Vector3();

function scaleTooltip(entry, camera_actualPos) {
    let scale_obj = getScalingFactor();

    let entry_actualpos = entry.getWorldPosition();
    var dist = entry_actualpos.distanceTo(camera_actualPos);

    let height_width_factor = 1;
    let another_factor = 1;

    if (entry.children[0] !== undefined) {
        height_width_factor = (entry.children[0].scale_height / entry.children[0].scale_width);
        another_factor = entry.children[0].another_factor;
    }

    scaleVec.set(scale_obj.x * dist * another_factor, scale_obj.y * dist * another_factor * height_width_factor, scale_obj.z * dist);
    if (entry.children[0] !== undefined)
        entry.children[0].scale.copy(scaleVec);

}

