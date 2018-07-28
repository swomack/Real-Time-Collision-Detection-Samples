'use strict';

function makeTextSprite(message, parameters, transparent, opaque) {
    message = " " + message + " ";
    if (parameters === undefined) parameters = {};

    let canvas = getCanvasForText(message, parameters, transparent, opaque);

    let texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    let spriteMaterial = new THREE.SpriteMaterial(
        {map: texture, transparent: true, depthTest: false, depthWrite: false});


    if (transparent !== undefined && transparent === true) {
        spriteMaterial.transparent = true;
        spriteMaterial.depthWrite = false;
        spriteMaterial.depthTest = false;
    }

    let sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale_width = canvas.width;
    sprite.scale_height = canvas.height;
    return sprite;
}


function getCanvasForText(message, parameters, transparent, opaque) {
    if (parameters === undefined)
        parameters = {};
    let fontface = parameters.hasOwnProperty("fontface") ?
        parameters["fontface"] : "Arial";

    let fontsize = parameters.hasOwnProperty("fontsize") ?
        parameters["fontsize"] : 24;

    let borderThickness = parameters.hasOwnProperty("borderThickness") ?
        parameters["borderThickness"] : 2;

    let borderColor = parameters.hasOwnProperty("borderColor") ?
        parameters["borderColor"] : {r: 0, g: 0, b: 0, a: 1.0};

    let backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
        parameters["backgroundColor"] : {r: 255, g: 255, b: 255, a: 1.0};

    let textColor = parameters.hasOwnProperty("textColor") ?
        parameters["textColor"] : {r: 0, g: 0, b: 0, a: 1.0};

    /// setting opaque
    if (opaque === undefined) backgroundColor.a = 0.3;
    else backgroundColor.a = opaque;

    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');
    context.font = "Bold " + fontsize + "px " + fontface;

    let texts = message.split('\n');
    let totalLine = texts.length;

    let textWidth = 0;
    let textHeight = (fontsize * totalLine * 1.3) + 2 * borderThickness;

    for (let i = 0; i < totalLine; i++) {
        let metrics = context.measureText(texts[i]);
        textWidth = Math.max(textWidth, metrics.width);
    }

    textWidth += 2 * borderThickness;

    canvas.width = textWidth;
    canvas.height = textHeight;

    context.font = "Bold " + fontsize + "px " + fontface;

    // background color
    context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
        + backgroundColor.b + "," + backgroundColor.a + ")";
    // border color
    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
        + borderColor.b + "," + borderColor.a + ")";

    context.lineWidth = borderThickness;

    straightRect(context, borderThickness / 2, borderThickness / 2, canvas.width - borderThickness / 2, canvas.height - borderThickness / 2);


    // text color
    context.fillStyle = "rgba(" + textColor.r + "," + textColor.g + ","
        + textColor.b + "," + textColor.a + ")";


    // Draw line
    for (let i = 1; i <= totalLine; i++)
        context.fillText(texts[i - 1], borderThickness, fontsize * i + borderThickness / 2);

    return canvas;
}


function getTextureForText(message, parameters, transparent, opaque) {
    let canvas = getCanvasForText(message, parameters, transparent, opaque);

    let texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}

function straightRect(ctx, x, y, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x, y2);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}


function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}
