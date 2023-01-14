"use strict";
class Stroke {
    constructor(type, parameters) {
        this.type = type;
        this.parameters = parameters;
    }
}
// Global Variables
var startX, startY, endX, endY;
var historyStrokes = [];
var canvas = document.getElementsByTagName("canvas")[0];
var pen = canvas.getContext("2d");
canvas.height = 600;
// Resize
function resizeInterface() {
    let width = document.documentElement.clientWidth;
    let height = document.documentElement.clientHeight;
    document.getElementById("windowSize").innerHTML = width.toString() + ", " + height.toString();
    canvas.width = 0.6 * width;
}
window.addEventListener("resize", resizeInterface);
resizeInterface();
// Canvas Events
function redraw() {
    for (let i = 0; i < historyStrokes.length; i++) {
        let stroke = historyStrokes[i];
        if (stroke.type == "Line") {
            pen === null || pen === void 0 ? void 0 : pen.beginPath();
            pen === null || pen === void 0 ? void 0 : pen.moveTo(stroke.parameters[0], stroke.parameters[1]);
            pen === null || pen === void 0 ? void 0 : pen.lineTo(stroke.parameters[2], stroke.parameters[3]);
            pen === null || pen === void 0 ? void 0 : pen.stroke();
        }
    }
}
canvas.onmousedown = function (ev) {
    startX = ev.offsetX;
    startY = ev.offsetY;
};
canvas.onmousemove = function (ev) {
    if (ev.buttons == 1) {
        canvas.width = canvas.width; // reset the canvas
        redraw();
        endX = ev.offsetX;
        endY = ev.offsetY;
        pen === null || pen === void 0 ? void 0 : pen.beginPath();
        pen === null || pen === void 0 ? void 0 : pen.moveTo(startX, startY);
        pen === null || pen === void 0 ? void 0 : pen.lineTo(endX, endY);
        pen === null || pen === void 0 ? void 0 : pen.stroke();
    }
};
canvas.onmouseup = function (ev) {
    canvas.width = canvas.width; // reset the canvas
    redraw();
    endX = ev.offsetX;
    endY = ev.offsetY;
    pen === null || pen === void 0 ? void 0 : pen.beginPath();
    pen === null || pen === void 0 ? void 0 : pen.moveTo(startX, startY);
    pen === null || pen === void 0 ? void 0 : pen.lineTo(endX, endY);
    pen === null || pen === void 0 ? void 0 : pen.stroke();
    historyStrokes.push({
        type: "Line",
        parameters: [startX, startY, endX, endY]
    });
};
// Buttons Control
const DRAG = 0;
const LINE = 1;
var buttons = document.getElementsByTagName("button");
function toggleButtonBG(id) {
    let button = document.getElementById(id);
    if (button.style.color == "whitesmoke") {
        button.style.color = "steelblue";
        button.style.backgroundColor = "whitesmoke";
    }
    else {
        button.style.color = "whitesmoke";
        button.style.backgroundColor = "steelblue";
    }
}
