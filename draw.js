var canvas;
var dc;
var pX;
var pY;
var x;
var y;
var activeDrawing = false;
var historyStorage = 32;
var history = new Array(historyStorage);
var historyPosition = 0;
var historyPositionMax = 0;
var cWidth = 600;
var cHeight = 360;
var color = "0, 0, 0";
var debugMode = false;
var palette = ["#000" , "#00a" , "#0a0" , "#0aa" , "#a00" , "#a0a" , "#aa0" , "#aaa" , "#555" , "#55f" , "#5f5" , "#5ff" , "#f55" , "#f5f" , "#ff5" , "#fff"];
var drugMode = false;
var flushCursor = false;

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

	dc.fillStyle = "white";
	dc.fillRect(0, 0, cWidth, cHeight);
	updateDebugScreen();
	history[0] = dc.getImageData(0, 0, cWidth, cHeight);

	paletteElem = document.getElementById("palette");

	for(tColor in palette) {
		var palettine = document.createElement("span");
		palettine.className = "palettine";
		palettine.style.background =  palette[tColor];
		palettine.setAttribute('onclick', 'updateColor("' + palette[tColor] + '");');
		paletteElem.appendChild(palettine);
	}
}

function updatePosition(event) {
	x = event.pageX;
	y = event.pageY;
	x -= canvas.offsetLeft;
	y -= canvas.offsetTop;
}

function cDraw(event) {
	updatePosition(event);
	updateDebugScreen();
	if(flushCursor || activeDrawing) {
		dc.putImageData(history[historyPosition], 0, 0);
		flushCursor = false;
	}

	if(activeDrawing) {
		dc.lineTo(x + 0.5, y + 0.5);
	    dc.stroke();
	}

	pX=x;
	pY=y;
}

function cDrawStart(event) {
	updatePosition(event);
	updateColor();
	if(event.which == 1) {
		activeDrawing = true;
	    dc.lineWidth = document.getElementById("rangeW").value;
	    dc.strokeStyle = "rgba(" + color +", " + document.getElementById("rangeO").value + ")";
	    dc.lineJoin = "round";
		dc.lineCap = "round";
		dc.beginPath();
		dc.moveTo(x + 0.5, y + 0.5);
		dc.lineTo(x + 0.5, y + 0.5);
		dc.stroke();
	}
	if(event.which == 2) {
		//alert("¬␣¬");
		var tCol = dc.getImageData(x, y, 1, 1).data;
		var tTex = (tCol[0] * 65536 + tCol[1] * 256 + tCol[2]).toString(16);
		while(tTex.length < 6) {
			tTex = "0" + tTex;
		}
        updateColor("#" + tTex);
	}
}

function cDrawEnd(event) {
	//Saving in history:
	if(activeDrawing) {
		historyOperation(0);
	}
	activeDrawing=false;
	updateDebugScreen();
}

function cDrawCancel() {
	if(activeDrawing) {
		historyOperation(1);
		historyOperation(2);
	}
	activeDrawing=false;
	updateDebugScreen();
}

function cLWChange(event) {
	var delta = event.deltaY || event.detail || event.wheelDelta;
	event.preventDefault();
	//for(opt in event)
	//	document.write(opt + ": " + event[opt] + "<br>");
	if(delta > 0) {
		if(event.ctrlKey) {
			if(document.getElementById("rangeO").value > 0.1)
				document.getElementById("rangeO").value = (parseFloat(document.getElementById("rangeO").value) - 0.05).toFixed(2);
			else
				document.getElementById("rangeO").value = 0.05;
		}
		else if(document.getElementById("rangeW").value > 1)
			document.getElementById("rangeW").value --;
	}
	if(delta < 0) {
		if(event.ctrlKey) {
			if(document.getElementById("rangeO").value < 0.95)
				document.getElementById("rangeO").value = (parseFloat(document.getElementById("rangeO").value) + 0.05).toFixed(2);
			else
				document.getElementById("rangeO").value = "1.00";
		}
		else if(document.getElementById("rangeW").value < 70)
			document.getElementById("rangeW").value ++;
	}
	if(delta != 0 && !event.ctrlKey) {
		dc.putImageData(history[historyPosition], 0, 0);
	    //Отрисовка курсора:
	    dc.beginPath();
	    dc.lineWidth = 1;
	    dc.strokeStyle = "gray";
		dc.arc(x, y, document.getElementById("rangeW").value/2, 0, Math.PI*2, false);
		dc.closePath();
		dc.stroke();
		flushCursor = true;
	}
	updateDebugScreen();
}

function updateDebugScreen() {
	if(debugMode) {
		var debug = document.getElementById("debug");
		debug.innerHTML = "Cursor @" + x + ":" + y + " color:" + color;
	}
}

function clearScreen() {
	//if (confirm("Вы уверены, что хотите очистить холст?")) {
		dc.fillStyle = "rgb(" + color + ")";
		dc.fillRect(0, 0, cWidth, cHeight);
		historyOperation(0);
	//}
}

function updateColor(value) {
	var value=value||"";
	if(value!="")
		document.getElementById("color").value=value;
	var regShort = /^#[0-9a-fA-F]{3}$/i;
	var regLong = /^#[0-9a-fA-F]{6}$/i;
	var colorValue = document.getElementById("color").value;
	var colorSummary = 0;
	var isShort = false;
    if(regLong.test(colorValue)||regShort.test(colorValue)) {
		colorSummary = parseInt(colorValue.substr(1), 16);
		if(regShort.test(colorValue))
			isShort = true;
	}
	var hexDivider = isShort ? 17 : 1;
	var hexMultiplier = isShort ? 16 : 256;
	color = (Math.floor(colorSummary / hexMultiplier / hexMultiplier) * hexDivider) + ", "
		+ ((Math.floor(colorSummary / hexMultiplier) % hexMultiplier) * hexDivider) + ", "
		+ ((colorSummary % hexMultiplier) * hexDivider);
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
	document.getElementById("buttonR").disabled = (historyPosition == historyPositionMax);
	document.getElementById("buttonU").disabled = (historyPosition == 0);
}

function cHotkeys(event) {
	if(x >= 0 && x < cWidth && y >= 0 && y < cHeight) {
		switch(event.keyCode) {
			case 'Z'.charCodeAt(0): historyOperation(1); break;
			case 'X'.charCodeAt(0): historyOperation(2); break;
			case 'F'.charCodeAt(0): clearScreen(); break;
			case 'W'.charCodeAt(0): cDrawCancel(); break;
			//default: alert('def')
		}
	}
}
