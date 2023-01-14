class Stroke {
    type: string
    parameters: Array<number>
    constructor(type: string, parameters: Array<number>) {
        this.type = type
        this.parameters = parameters
    }
}

// Global Variables
var startX: number, startY: number, endX: number, endY: number
var historyStrokes: Array<Stroke> = []

var canvas = document.getElementsByTagName("canvas")[0]
var pen = canvas.getContext("2d")
canvas.height = 600

// Resize
function resizeInterface() {
    let width: number = document.documentElement.clientWidth
    let height: number = document.documentElement.clientHeight
    document.getElementById("windowSize")!.innerHTML = width.toString() + ", " + height.toString()
    canvas.width = 0.6 * width
}
window.addEventListener("resize", resizeInterface)
resizeInterface()

// Canvas Events
function redraw() {
    for (let i = 0; i < historyStrokes.length; i++) {
        let stroke = historyStrokes[i]
        if (stroke.type == "Line") {
            pen?.beginPath()
            pen?.moveTo(stroke.parameters[0], stroke.parameters[1])
            pen?.lineTo(stroke.parameters[2], stroke.parameters[3])
            pen?.stroke()
        }
    }
}

canvas.onmousedown = function (ev: MouseEvent) {
    startX = ev.offsetX
    startY = ev.offsetY
}

canvas.onmousemove = function (ev: MouseEvent) {
    if (ev.buttons == 1) {
        canvas.width = canvas.width // reset the canvas
        redraw()
        endX = ev.offsetX
        endY = ev.offsetY
        pen?.beginPath()
        pen?.moveTo(startX, startY)
        pen?.lineTo(endX, endY)
        pen?.stroke()
    }
}

canvas.onmouseup = function (ev: MouseEvent) {
    canvas.width = canvas.width // reset the canvas
    redraw()
    endX = ev.offsetX
    endY = ev.offsetY
    pen?.beginPath()
    pen?.moveTo(startX, startY)
    pen?.lineTo(endX, endY)
    pen?.stroke()
    historyStrokes.push({
        type: "Line",
        parameters: [startX, startY, endX, endY]
    })
}

// Buttons Control
const DRAG = 0
const LINE = 1
var buttons = document.getElementsByTagName("button")

function toggleButtonBG(id: string) {
    let button = document.getElementById(id)
    if (button!.style.color == "whitesmoke") {
        button!.style.color = "steelblue"
        button!.style.backgroundColor = "whitesmoke"
    } else {
        button!.style.color = "whitesmoke"
        button!.style.backgroundColor = "steelblue"
    }
}
