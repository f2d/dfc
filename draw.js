var infoVersion = "v1.3.1";
var infoDate = "April 8, 2013"

var canvas;
var dc;
var x;
var y;

var activeDrawing = false;
var historyStorage = 32;
var history = new Array(historyStorage);
var historyPosition = 0;
var historyPositionMax = 0;

var cWidth = 600;
var cHeight = 360;

var toolColor = ["0, 0, 0", "255, 255, 255"];
var toolOpacity = [1.00, 1.00];
var toolWidth = [4, 20];

var debugMode = false;
var neverFlushCursor = true;
var flushCursor = false;
var optimizedMode = false;

var paletteDesc = {"classic" : "Classic", "cga" : "CGA", "win7" : "Шindoшs", "gray" : "Post-Rock", "feijoa1" : "Feijoa-01"};
var paletteWidth = {"classic" : 8, "cga" : 8, "win7" : 10, "gray" : 16, "feijoa1" : 16};
var palette = new Array();
	palette["classic"] = ["#000000", "#000080", "#008000", "#008080", "#800000", "#800080", "#808000", "#c0c0c0",
		"#808080", "#0000ff", "#00ff00", "#00ffff", "#ff0000", "#ff00ff", "#ffff00", "#ffffff"];
	palette["cga"] = ["#000", "#00a", "#0a0", "#0aa", "#a00", "#a0a", "#aa0", "#aaa", "#555", "#55f", "#5f5", "#5ff", "#f55", "#f5f", "#ff5", "#fff"];
	palette["win7"] = ["#000000", "#7f7f7f", "#880015", "#ed1c24", "#ff7f27", "#fff200", "#22b14c", "#00a2e8", "#3f48cc", "#a349a4",
		"#ffffff", "#c3c3c3", "#b97a57", "#ffaec9", "#ffc90e", "#efe4b0", "#b5e61d", "#99d9ea", "#7092be", "#c8bfe7"];
	palette["gray"] = ["#fff", "#eee", "#ddd", "#ccc", "#bbb", "#aaa", "#999", "#888", "#777", "#666", "#555", "#444", "#333", "#222", "#111", "#000"];
	palette["feijoa1"] = ["#000", "#005", "#00a", "#00f", "#050", "#055", "#05a", "#05f", "#0a0", "#0a5", "#0aa", "#0af", "#0f0", "#0f5", "#0fa", "#0ff",
		"#500", "#505", "#50a", "#50f", "#550", "#555", "#55a", "#55f", "#5a0", "#5a5", "#5aa", "#5af", "#5f0", "#5f5", "#5fa", "#5ff",
		"#a00", "#a05", "#a0a", "#a0f", "#a50", "#a55", "#a5a", "#a5f", "#aa0", "#aa5", "#aaa", "#aaf", "#af0", "#af5", "#afa", "#aff",
		"#f00", "#f05", "#f0a", "#f0f", "#f50", "#f55", "#f5a", "#f5f", "#fa0", "#fa5", "#faa", "#faf", "#ff0", "#ff5", "#ffa", "#fff"];
var currentPalette = "win7";

document.addEventListener("DOMContentLoaded", init, false);

function init()
{
	canvas = document.getElementById("draw");
	dc = canvas.getContext("2d");
	canvas.addEventListener("mousedown", cDrawStart, false);
	canvas.addEventListener("mousemove", cDraw, false);
	document.addEventListener("mouseup", cDrawEnd, false);
	canvas.addEventListener("mouseout", cDraw, false);
	document.addEventListener("mousemove", updatePosition, false);
	document.addEventListener("keydown", cHotkeys, false);

	//canvas.addEventListener("contextmenu", cDrawCancel, false);

	canvas.addEventListener("wheel", cLWChange, false);
	canvas.width=cWidth;
	canvas.height=cHeight;

	document.getElementById("tools").style.width = cWidth + "px";

	dc.fillStyle = "white";
	dc.fillRect(0, 0, cWidth, cHeight);
	history[0] = dc.getImageData(0, 0, cWidth, cHeight);
	
	document.getElementById("version").innerHTML=infoVersion;
	document.getElementById("date").innerHTML=infoDate;

	paletteSelect = document.getElementById("palette-select");

	for (tPalette in paletteDesc) {
		paletteSelect.options[paletteSelect.options.length] = new Option(paletteDesc[tPalette], tPalette);
		if (tPalette == currentPalette)
			paletteSelect.options[paletteSelect.options.length - 1].selected = true;
	}

	document.getElementById("colorF").style.background = "rgb(" + toolColor[0] + ")";
	document.getElementById("colorB").style.background = "rgb(" + toolColor[1] + ")";

	updateDebugScreen();
	updatePalette();
	updateButtons();
	updateSliders();
}

function updatePalette() {
	currentPalette = document.getElementById("palette-select").value;
	paletteElem = document.getElementById("palette");

	while (paletteElem.childNodes.length) {
		paletteElem.removeChild(paletteElem.childNodes[0])
	}

	var colCount = 0;

	for (tColor in palette[currentPalette]) {
		var palettine = document.createElement("span");
		palettine.className = "palettine";
		palettine.style.background =  palette[currentPalette][tColor];
		palettine.setAttribute('onclick', 'updateColor("' + palette[currentPalette][tColor] + '");');
		paletteElem.appendChild(palettine);
		if(colCount == paletteWidth[currentPalette] - 1) {
			colCount = -1;
			paletteElem.appendChild(document.createElement("br"));
		}
		colCount ++;
	}
}

function updatePosition(event) {
	x = event.pageX;
	y = event.pageY;
	x -= canvas.offsetLeft;
	y -= canvas.offsetTop;
}

function drawCursor () {
	//Отрисовка курсора:
	if (x >= 0 && x < cWidth && y >= 0 && y < cHeight) {
		dc.beginPath();
		dc.lineWidth = 1;
		dc.strokeStyle = "rgb(" + toolColor[0] + ")";
		dc.arc(x, y, toolWidth[0] / 2, 0, Math.PI*2, false);
		dc.closePath();
		dc.stroke();
		if(!neverFlushCursor)
			flushCursor = true;
	}
}

function cDraw(event) {
	var pX = x;
	var pY = y;
	var halfW = Math.floor(toolWidth[0] / 2);
	updatePosition(event);
	updateDebugScreen();

	if (flushCursor || neverFlushCursor) {
		if(optimizedMode && activeDrawing)
			dc.putImageData(history[historyPosition], 0, 0, pX - halfW - 1, pY - halfW - 1, halfW * 2 + 2, halfW * 2 + 2);
		else
			dc.putImageData(history[historyPosition], 0, 0);		
	}

	if (activeDrawing) {
		dc.lineTo(x + 0.5, y + 0.5);
	    dc.stroke();
	}
	else
		if (neverFlushCursor)
			drawCursor();
}

function cDrawStart(event) {
	updatePosition(event);
	updateColor();
	if (event.which == 1 || event.which == 3) {
		event.preventDefault();
	    event.stopPropagation();
	    event.cancelBubble = true;

		var toolIndex = event.which == 1 ? 0 : 1;
		dc.putImageData(history[historyPosition], 0, 0);
		activeDrawing = true;
	    dc.lineWidth = toolWidth[toolIndex];
	    dc.strokeStyle = "rgba(" + toolColor[toolIndex] +", " + toolOpacity[toolIndex] + ")";
	    dc.lineJoin = "round";
		dc.lineCap = "round";
		dc.beginPath();
		dc.moveTo(x + 0.5, y + 0.5);
		dc.lineTo(x + 0.49, y + 0.49);
		dc.stroke();

		return;
	}
	if (event.which == 2) {
		cCopyColor();
	}
}

function cDrawEnd(event) {
	//Saving in history:
	if (activeDrawing) {
		dc.putImageData(history[historyPosition], 0, 0);
		dc.stroke();
		dc.closePath();
		historyOperation(0);
	}
	activeDrawing=false;
	updateDebugScreen();
}

function cDrawCancel() {
	if (activeDrawing) {
		historyOperation(1);
		historyOperation(2);
	}
	activeDrawing=false;
	updateDebugScreen();
}

function cCopyColor() {	
	var tCol = dc.getImageData(x, y, 1, 1).data;
	var tTex = (tCol[0] * 65536 + tCol[1] * 256 + tCol[2]).toString(16);
	while (tTex.length < 6) {
		tTex = "0" + tTex;
	}
    updateColor("#" + tTex);
}

function cLWChange(event) {
	var delta = event.deltaY || event.detail || event.wheelDelta;
	event.preventDefault();
	if (delta > 0) {
		if (event.ctrlKey)
			toolOpacity[0] = (parseFloat(toolOpacity[0]) - 0.05).toFixed(2);
		else
			toolWidth[0] --;
	}
	if (delta < 0) {
		if (event.ctrlKey)
			toolOpacity[0]= (parseFloat(toolOpacity[0]) + 0.05).toFixed(2);
		else
			toolWidth[0] ++;
	}

	updateDebugScreen();
	updateSliders();
}

function updateDebugScreen() {
	if (debugMode) {
		var debug = document.getElementById("debug");
		debug.innerHTML = "Cursor @" + x + ":" + y + " color: " + toolColor[0] + " back: " + toolColor[1];
	}
}

function updateSliders(manual) {
	var m = manual || false;

	if (m) {
		toolWidth[0] = document.getElementById("rangeW").value;
		toolOpacity[0] = document.getElementById("rangeO").value;
	}

	if (toolOpacity[0] <= 0.1)
		toolOpacity[0] = "0.10"
	if (toolOpacity[0] >= 1)
		toolOpacity[0] = "1.00"

	if (toolWidth[0] <= 1)
		toolWidth[0] = 1
	if (toolWidth[0] >= 70)
		toolWidth[0] = 70

	document.getElementById("rangeW").value = toolWidth[0];
	document.getElementById("rangeO").value = toolOpacity[0];

	cDrawEnd();
	dc.putImageData(history[historyPosition], 0, 0, x - 36, y - 36, 72, 72);
    drawCursor();
}

function swapTools() {
	var buffer;
	buffer = toolColor[0];
	updateColor(toolColor[1]);
	toolColor[1] = buffer;

	buffer = toolWidth[0];
	toolWidth[0] = toolWidth[1];
	toolWidth[1] = buffer;

	buffer = toolOpacity[0];
	toolOpacity[0] = toolOpacity[1];
	toolOpacity[1] = buffer;

	updateSliders();

	document.getElementById("colorF").style.background = "rgb(" + toolColor[0] + ")";
	document.getElementById("colorB").style.background = "rgb(" + toolColor[1] + ")";
}

function clearScreen(tool) {
	dc.fillStyle = "rgb(" + toolColor[tool] + ")";
	dc.fillRect(0, 0, cWidth, cHeight);
	historyOperation(0);
}

function invertColors() {
	var buffer = history[historyPosition];
	for (var i = 0; i < buffer.data.length; i += 4)
		for (var j = 0; j < 3; j++)
			buffer.data[i + j] = 255 - buffer.data[i + j];
	 
	dc.putImageData(buffer, 0, 0);
	historyOperation(0);
}

function updateColor(value) {
	var c = document.getElementById("color");
	var v = value || c.value;
	var colorSummary = 0;
	var regShort = /^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/i;
	var regLong = /^#[0-9a-fA-F]{6}$/i;
	var regRGB = /^([0-9]{1,3}), ([0-9]{1,3}), ([0-9]{1,3})/i;
	if (regShort.test(v))
		v = v.replace(regShort, "#$1$1$2$2$3$3");
	if (regRGB.test(v))
	{
		toolColor[0] = v;
		var buffer;
		c.value = "#"
		for (var i = 0; i < 3; i++) {
			buffer = parseInt(v.replace(regRGB, "$" + (i + 1))).toString(16);
			c.value += ((buffer.length == 1 ? "0" : "") + buffer);			
		}
	}
	else {
		if (!regLong.test(v))
			return;
		colorSummary = parseInt(v.substr(1), 16);
		if (value != "")
			c.value = v;
		var hexDivider = 1;
		var hexMultiplier = 256;
		toolColor[0] = (Math.floor(colorSummary / hexMultiplier / hexMultiplier) * hexDivider) + ", "
			+ ((Math.floor(colorSummary / hexMultiplier) % hexMultiplier) * hexDivider) + ", "
			+ ((colorSummary % hexMultiplier) * hexDivider);
	}
}

function historyOperation(opid) {
	//0: Write: Refresh
	//1: Read: Backward
	//2: Read: Foreward
	//3: Push Points //OUTDATED
	if (opid == 1 && historyPosition > 0) {
		historyPosition --;
	}
	if (opid == 2 && historyPosition < historyStorage - 1 && historyPosition < historyPositionMax) {
		historyPosition ++;
	}
	if (opid == 1 || opid == 2) {
		dc.putImageData(history[historyPosition], 0, 0);
	}
	if (opid == 0) {
		if(historyPosition < historyStorage - 1) {
			historyPosition ++;
			historyPositionMax = historyPosition;
		}
		else
			for(i = 0; i < historyStorage - 1; i ++)
				history[i] = history[i + 1];
		history[historyPosition] = canvas.getContext("2d").getImageData(0, 0, cWidth, cHeight);
	}
	updateDebugScreen();
	updateButtons();
}

function updateButtons() {
	document.getElementById("buttonSJ").value = "JPEG (≈" + (canvas.toDataURL("image/jpeg").length / 1300).toFixed(0) + " kb)";	
	document.getElementById("buttonSP").value = "PNG (≈" + (canvas.toDataURL().length / 1300).toFixed(0) + " kb)";	

	document.getElementById("buttonR").disabled = (historyPosition == historyPositionMax);
	document.getElementById("buttonU").disabled = (historyPosition == 0);

}

function cHotkeys(event) {
	if (x >= 0 && x < cWidth && y >= 0 && y < cHeight) {
		switch (event.keyCode) {
			case 'Z'.charCodeAt(0): historyOperation(1); break;
			case 'X'.charCodeAt(0): historyOperation(2); break;
			case 'C'.charCodeAt(0): cCopyColor(); break;
			case 'F'.charCodeAt(0): clearScreen(0); break;
			case 'D'.charCodeAt(0): clearScreen(1); break;
			case 'I'.charCodeAt(0): invertColors(); break;
			case 'S'.charCodeAt(0): swapTools(); break;

			case 'Q'.charCodeAt(0): toolWidth[0]--; updateSliders(); break;
			case 'W'.charCodeAt(0): toolWidth[0]++; updateSliders(); break;
			case 'E'.charCodeAt(0): toolOpacity[0] = (parseFloat(toolOpacity[0]) - 0.05).toFixed(2); updateSliders(); break;
			case 'R'.charCodeAt(0): toolOpacity[0] = (parseFloat(toolOpacity[0]) + 0.05).toFixed(2); updateSliders(); break;
		}
	}
}

function switchOM() {
	optimizedMode = !optimizedMode;
	document.getElementById("checkOM").checked = optimizedMode;
}

function savePic(value) {
	switch (value) {
		case 0: 
			var imageToSend = document.createElement("input");
			imageToSend.value = canvas.toDataURL('image/jpeg').length < canvas.toDataURL().length ? canvas.toDataURL('image/jpeg') : canvas.toDataURL();
			imageToSend.name = "content";
			imageToSend.type = "hidden";
			document.getElementById("send").appendChild(imageToSend);
		break;
		case 1: picTab = window.open(canvas.toDataURL('image/jpeg'),'_blank'); break;
		case 2: picTab = window.open(canvas.toDataURL(),'_blank'); break;
		default: alert("Недопустимое значение (обновите кэш).");
	}
}
