class Stroke {
    type: string
    parameters: Array<number>
    constructor(type: string, parameters: Array<number>) {
        this.type = type
        this.parameters = parameters
    }
}

// Global Variables
var canvas = document.getElementsByTagName("canvas")[0]
var pen = canvas.getContext("2d")

const ppgBaseLine = 100
const numberBias = 19
var width = document.documentElement.clientWidth
var height = document.documentElement.clientHeight
var widthPast = width
var heightPast = height
var startX: number, startY: number, endX: number, endY: number
var historyStrokes: Array<Stroke> = []
var historyStrokesBackup: Array<Stroke> = []
var currentTool: string = "Null"
var offsetX: number = 0
var offsetY: number = 0
var scale: number = 1
var originX = scale * 0.5 * canvas.width + offsetX
var originY = scale * 0.5 * canvas.height + offsetY
var keyLog: Array<string> = []
var pixelPerUnit = ppgBaseLine
var unitPerGrid = 1
var pixelPerGrid
var pixelRatio = window.devicePixelRatio
if (pixelRatio == 1) pixelRatio = 2
var gridFactor = 1
var gridPower = 0
var touchOffsetX = 0
var touchOffsetY = 0

// Resize
function resizeInterface() {
    widthPast = width
    heightPast = height
    width = document.documentElement.clientWidth
    height = document.documentElement.clientHeight
    canvas.width = (width - 100) * pixelRatio
    canvas.height = (height - 170) * pixelRatio
    canvas.style.width = width - 100 + "px"
    canvas.style.height = height - 170 + "px"
    redraw()
}
window.addEventListener("resize", resizeInterface)
resizeInterface()

// Canvas Events
function redraw() {
    drawCoor()
    for (let i = 0; i < historyStrokes.length; i++) {
        let stroke = historyStrokes[i]
        if (stroke.type == "Line") {
            pen?.beginPath()
            pen?.moveTo(scale * stroke.parameters[0] + originX, scale * stroke.parameters[1] + originY)
            pen?.lineTo(scale * stroke.parameters[2] + originX, scale * stroke.parameters[3] + originY)
            pen?.stroke()
        } else if (stroke.type == "Rect") {
            pen?.strokeRect(scale * stroke.parameters[0] + originX, scale * stroke.parameters[1] + originY, scale * stroke.parameters[2], scale * stroke.parameters[3])
        } else if (stroke.type == "Circle") {
            pen?.beginPath()
            pen?.arc(scale * stroke.parameters[0] + originX, scale * stroke.parameters[1] + originY, scale * stroke.parameters[2], 0, 2 * Math.PI)
            pen?.stroke()
        }
    }
}

function drawCoor() {
    pixelPerGrid = pixelPerUnit * unitPerGrid
    originX = scale * 0.5 * canvas.width + offsetX
    originY = scale * 0.5 * canvas.height + offsetY
    // Draw minor grids
    pen!.strokeStyle = "rgb(220, 220, 220)"
    let gridlineX = Math.ceil(-originX / (pixelPerGrid / 5)) * (pixelPerGrid / 5) + originX
    let gridlineY = Math.ceil(-originY / (pixelPerGrid / 5)) * (pixelPerGrid / 5) + originY
    pen?.beginPath()
    while (gridlineX < canvas.width) {
        pen?.moveTo(gridlineX, 0)
        pen?.lineTo(gridlineX, canvas.height)
        gridlineX += pixelPerGrid / 5
    }
    while (gridlineY < canvas.height) {
        pen?.moveTo(0, gridlineY)
        pen?.lineTo(canvas.width, gridlineY)
        gridlineY += pixelPerGrid / 5
    }
    pen?.stroke()
    // Draw major grids
    pen!.strokeStyle = "rgb(150, 150, 150)"
    gridlineX = Math.ceil(-originX / pixelPerGrid) * pixelPerGrid + originX
    gridlineY = Math.ceil(-originY / pixelPerGrid) * pixelPerGrid + originY
    pen?.beginPath()
    while (gridlineX < canvas.width) {
        pen?.moveTo(gridlineX, 0)
        pen?.lineTo(gridlineX, canvas.height)
        gridlineX += pixelPerGrid
    }
    while (gridlineY < canvas.height) {
        pen?.moveTo(0, gridlineY)
        pen?.lineTo(canvas.width, gridlineY)
        gridlineY += pixelPerGrid
    }
    pen?.stroke()
    // Draw axies
    pen!.strokeStyle = "rgb(100, 100, 100)"
    pen!.lineWidth = pixelRatio
    pen?.beginPath()
    if (originX > 0 && originX < canvas.width) {
        pen?.moveTo(originX, 0)
        pen?.lineTo(originX, canvas.height)
    }
    if (originY > 0 && originY < canvas.height) {
        pen?.moveTo(0, originY)
        pen?.lineTo(canvas.width, originY)
    }
    pen?.stroke()
    // Draw numbers
    let zeroX = originX - numberBias
    let zeroY = originY + numberBias + 8
    pen!.font = "20px Arial"
    pen!.textAlign = "center"
    if (zeroX > 0 && zeroY > 0 && zeroX < canvas.width && zeroY < canvas.height)
        pen?.fillText("0", zeroX, zeroY)
    zeroX += 5
    // if (zeroX < numberBias + 5) zeroX = numberBias + 5
    if (zeroX > canvas.width - numberBias + 8) zeroX = canvas.width - numberBias + 8
    if (zeroY < numberBias + 8) zeroY = numberBias + 8
    if (zeroY > canvas.height - numberBias + 8) zeroY = canvas.height - numberBias + 8
    let unitX = Number((-Math.floor(originX / pixelPerGrid) * unitPerGrid).toPrecision(12))
    let unitY = Number((Math.floor(originY / pixelPerGrid) * unitPerGrid).toPrecision(12))
    gridlineX = Math.ceil(-originX / pixelPerGrid) * pixelPerGrid + originX
    gridlineY = Math.ceil(-originY / pixelPerGrid) * pixelPerGrid + originY
    while (gridlineX < canvas.width) {
        if (unitX != 0) pen?.fillText(unitX.toString(), gridlineX, zeroY)
        gridlineX += pixelPerGrid
        unitX = Number((unitX + unitPerGrid).toPrecision(12))
    }
    pen!.textAlign = "right"
    while (gridlineY < canvas.height) {
        let eachX = zeroX
        let numberWidth = pen?.measureText(unitY.toString()).width
        if (!numberWidth) numberWidth = 0
        if (zeroX < numberBias + numberWidth - 7) eachX = numberBias + numberWidth - 7
        if (unitY != 0) pen?.fillText(unitY.toString(), eachX, gridlineY + 7)
        gridlineY += pixelPerGrid
        unitY = Number((unitY - unitPerGrid).toPrecision(12))
    }
    pen!.strokeStyle = "black"
}

canvas.onmousedown = function (ev: MouseEvent) {
    let eventOffsetX = ev.offsetX * pixelRatio
    let eventOffsetY = ev.offsetY * pixelRatio
    startX = (eventOffsetX - originX) / scale
    startY = (eventOffsetY - originY) / scale
    if (["Line", "Rect", "Circle"].indexOf(currentTool) != -1)
        historyStrokesBackup = []
}

canvas.onmousemove = function (ev: MouseEvent) {
    if (ev.buttons == 1) {
        canvas.width = canvas.width // reset the canvas
        let eventOffsetX = ev.offsetX * pixelRatio
        let eventOffsetY = ev.offsetY * pixelRatio
        endX = (eventOffsetX - originX) / scale
        endY = (eventOffsetY - originY) / scale
        if (currentTool == "Drag") {
            offsetX += endX - startX
            offsetY += endY - startY
        }
        redraw()
        if (currentTool == "Line") {
            pen?.beginPath()
            pen?.moveTo(scale * startX + originX, scale * startY + originY)
            pen?.lineTo(scale * endX + originX, scale * endY + originY)
            pen?.stroke()
        } else if (currentTool == "Rect") {
            pen?.strokeRect(scale * startX + originX, scale * startY + originY, scale * (endX - startX), scale * (endY - startY))
        } else if (currentTool == "Circle") {
            let dX = endX - startX
            let dY = endY - startY
            let radius = Math.sqrt(dX * dX + dY * dY)
            pen?.beginPath()
            pen?.arc(scale * startX + originX, scale * startY + originY, scale * radius, 0, 2 * Math.PI)
            pen?.stroke()
        }
    }
}

canvas.onmouseup = function (ev: MouseEvent) {
    canvas.width = canvas.width // reset the canvas
    let eventOffsetX = ev.offsetX * pixelRatio
    let eventOffsetY = ev.offsetY * pixelRatio
    endX = (eventOffsetX - originX) / scale
    endY = (eventOffsetY - originY) / scale
    if (currentTool == "Drag") {
        offsetX += endX - startX
        offsetY += endY - startY
    }
    redraw()
    if (currentTool == "Line") {
        pen?.beginPath()
        pen?.moveTo(scale * startX + originX, scale * startY + originY)
        pen?.lineTo(scale * endX + originX, scale * endY + originY)
        pen?.stroke()
        historyStrokes.push({
            type: "Line",
            parameters: [startX, startY, endX, endY]
        })
    } else if (currentTool == "Rect") {
        pen?.strokeRect(scale * startX + originX, scale * startY + originY, scale * (endX - startX), scale * (endY - startY))
        historyStrokes.push({
            type: "Rect",
            parameters: [startX, startY, endX - startX, endY - startY]
        })
    } else if (currentTool == "Circle") {
        let dX = endX - startX
        let dY = endY - startY
        let radius = Math.sqrt(dX * dX + dY * dY)
        pen?.beginPath()
        pen?.arc(scale * startX + originX, scale * startY + originY, scale * radius, 0, 2 * Math.PI)
        pen?.stroke()
        historyStrokes.push({
            type: "Circle",
            parameters: [startX, startY, radius]
        })
    }
}

canvas.ontouchstart = function (ev: TouchEvent) {
    ev.preventDefault()
    touchOffsetX = (ev.touches[0].clientX - canvas.offsetLeft) * pixelRatio
    touchOffsetY = (ev.touches[0].clientY - canvas.offsetTop) * pixelRatio
    startX = (touchOffsetX - originX) / scale
    startY = (touchOffsetY - originY) / scale
    if (["Line", "Rect", "Circle"].indexOf(currentTool) != -1)
        historyStrokesBackup = []
}

canvas.ontouchmove = function (ev: TouchEvent) {
    ev.preventDefault()
    canvas.width = canvas.width // reset the canvas
    touchOffsetX = (ev.touches[0].clientX - canvas.offsetLeft) * pixelRatio
    touchOffsetY = (ev.touches[0].clientY - canvas.offsetTop) * pixelRatio
    endX = (touchOffsetX - originX) / scale
    endY = (touchOffsetY - originY) / scale
    if (currentTool == "Drag" || currentTool == "Null") {
        offsetX += endX - startX
        offsetY += endY - startY
    }
    redraw()
    if (currentTool == "Line") {
        pen?.beginPath()
        pen?.moveTo(scale * startX + originX, scale * startY + originY)
        pen?.lineTo(scale * endX + originX, scale * endY + originY)
        pen?.stroke()
    } else if (currentTool == "Rect") {
        pen?.strokeRect(scale * startX + originX, scale * startY + originY, scale * (endX - startX), scale * (endY - startY))
    } else if (currentTool == "Circle") {
        let dX = endX - startX
        let dY = endY - startY
        let radius = Math.sqrt(dX * dX + dY * dY)
        pen?.beginPath()
        pen?.arc(scale * startX + originX, scale * startY + originY, scale * radius, 0, 2 * Math.PI)
        pen?.stroke()
    }
}

canvas.ontouchend = function (ev: TouchEvent) {
    ev.preventDefault()
    canvas.width = canvas.width // reset the canvas
    // let eventOffsetX = (ev.touches[0].clientX - canvas.offsetLeft) * pixelRatio
    // let eventOffsetY = (ev.touches[0].clientY - canvas.offsetTop) * pixelRatio
    endX = (touchOffsetX - originX) / scale
    endY = (touchOffsetY - originY) / scale
    if (currentTool == "Drag" || currentTool == "Null") {
        offsetX += endX - startX
        offsetY += endY - startY
    }
    redraw()
    if (currentTool == "Line") {
        pen?.beginPath()
        pen?.moveTo(scale * startX + originX, scale * startY + originY)
        pen?.lineTo(scale * endX + originX, scale * endY + originY)
        pen?.stroke()
        historyStrokes.push({
            type: "Line",
            parameters: [startX, startY, endX, endY]
        })
    } else if (currentTool == "Rect") {
        pen?.strokeRect(scale * startX + originX, scale * startY + originY, scale * (endX - startX), scale * (endY - startY))
        historyStrokes.push({
            type: "Rect",
            parameters: [startX, startY, endX - startX, endY - startY]
        })
    } else if (currentTool == "Circle") {
        let dX = endX - startX
        let dY = endY - startY
        let radius = Math.sqrt(dX * dX + dY * dY)
        pen?.beginPath()
        pen?.arc(scale * startX + originX, scale * startY + originY, scale * radius, 0, 2 * Math.PI)
        pen?.stroke()
        historyStrokes.push({
            type: "Circle",
            parameters: [startX, startY, radius]
        })
    }
}

// Buttons Control
const DRAG = 0
const LINE = 1
const RECT = 2
var buttons = document.getElementsByTagName("button")

function toggleButtonBG(id: string) {
    let button = document.getElementById(id)
    if (button!.style.color == "whitesmoke") {
        button!.style.color = "steelblue"
        button!.style.backgroundColor = "whitesmoke"
        currentTool = "Null"
    } else {
        for (let i = 0; i < buttons.length; i++) {
            if (buttons[i].className == "tool") {
                buttons[i].style.color = "steelblue"
                buttons[i].style.backgroundColor = "whitesmoke"
            }
        }
        button!.style.color = "whitesmoke"
        button!.style.backgroundColor = "steelblue"
        currentTool = id
    }
}

function resetCoor() {
    offsetX = 0
    offsetY = 0
    scale = 1
    pixelPerUnit = ppgBaseLine
    unitPerGrid = 1
    gridFactor = 1
    gridPower = 0
    canvas.width = canvas.width
    redraw()
}

function clearAllStrokes() {
    canvas.width = canvas.width
    historyStrokes = []
    historyStrokesBackup = []
    redraw()
}

function undoStroke() {
    if (historyStrokes.length == 0) return
    if (historyStrokesBackup.length == 0) historyStrokesBackup = historyStrokes.concat()
    historyStrokes.pop()
    canvas.width = canvas.width
    redraw()
}

function redoStroke() {
    if (historyStrokes.length < historyStrokesBackup.length) {
        let length = historyStrokes.length
        historyStrokes.push(historyStrokesBackup[length])
        canvas.width = canvas.width
        redraw()
    }
}

// Hotkeys
const availableKeys: Array<string> = ["Meta", "Shift", "z"]
const availableFnKeys: Array<string> = ["Meta", "Shift"]
const availableLetters: Array<string> = ["z"]
document.onkeydown = addKey
document.onkeyup = removeKey

function addKey(ev: KeyboardEvent) {
    if (keyLog.indexOf(ev.key) == -1 && availableKeys.indexOf(ev.key) != -1) {
        keyLog.push(ev.key)
        hotkeyRouter()
    }
}

function removeKey(ev: KeyboardEvent) {
    if (keyLog.indexOf(ev.key) != -1 && availableFnKeys.indexOf(ev.key) != -1) {
        let index = keyLog.indexOf(ev.key)
        keyLog.splice(index, 1)
    }
}

function hotkeyRouter() {
    if (keyLog.indexOf("Meta") != -1 && keyLog.indexOf("z") != -1 && keyLog.indexOf("Shift") == -1) {
        undoStroke()
        keyLog.splice(keyLog.indexOf("z"), 1)
    }
    else if (keyLog.indexOf("Meta") != -1 && keyLog.indexOf("Shift") != -1 && keyLog.indexOf("z") != -1) {
        redoStroke()
        keyLog.splice(keyLog.indexOf("z"), 1)
    }
}

// Wheel Event
canvas.addEventListener("wheel", onWheel)

function onWheel(ev: WheelEvent) {
    if (ev.preventDefault) ev.preventDefault()
    let deltaX = ev.deltaX * pixelRatio
    let deltaY = ev.deltaY * pixelRatio
    if (currentTool == "Scale") {
        if (ev.deltaY == 0) return
        else {
            if (Math.abs(deltaY) > 200) deltaY = 200
            let ratio = 1 + deltaY / 400
            scale *= ratio
            pixelPerUnit = ppgBaseLine * scale
            pixelPerGrid = pixelPerUnit * unitPerGrid
            if (pixelPerGrid < ppgBaseLine) {
                if (gridFactor == 5) {
                    gridFactor = 1
                    gridPower += 1
                } else if (gridFactor == 1) gridFactor = 2
                else if (gridFactor == 2) gridFactor = 5
                unitPerGrid = gridFactor * 10 ** gridPower
                pixelPerGrid = pixelPerUnit * unitPerGrid
            } else {
                let upperLimit = 200
                if (gridFactor == 1 || gridFactor == 5) upperLimit = 2 * ppgBaseLine
                else if (gridFactor == 2) upperLimit = 2.5 * ppgBaseLine
                if (pixelPerGrid > upperLimit) {
                    if (gridFactor == 1) {
                        gridFactor = 5
                        gridPower -= 1
                    } else if (gridFactor == 5) gridFactor = 2
                    else if (gridFactor == 2) gridFactor = 1
                    unitPerGrid = gridFactor * 10 ** gridPower
                    pixelPerGrid = pixelPerUnit * unitPerGrid
                }
            }
            let eventOffsetX = ev.offsetX * pixelRatio
            let eventOffsetY = ev.offsetY * pixelRatio
            offsetX = offsetX * ratio + eventOffsetX * (1 - ratio)
            offsetY = offsetY * ratio + eventOffsetY * (1 - ratio)
            canvas.width = canvas.width
            redraw()
        }
    } else if (["Line", "Rect", "Circle", "Null"].indexOf(currentTool) != -1) {
        offsetX -= deltaX
        offsetY -= deltaY
        canvas.width = canvas.width
        redraw()
    }
}
