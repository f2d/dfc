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

var drugMode = false;
var flushCursor = false;
var infoVersion = "v1.1.0";
var infoDate = "April 5, 2013"

var paletteDesc = {"classic" : "Classic", "cga" : "CGA", "win7" : "Шindoшs", "gray" : "Post-Rock", "feijoa1" : "Feijoa-01"};
var paletteWidth = {"classic" : 8, "cga" : 8, "win7" : 10, "gray" : 16, "feijoa1" : 16};
var palette = new Array();
	palette["classic"] = ["#000000" , "#000080" , "#008000" , "#008080" , "#800000" , "#800080" , "#808000" , "#c0c0c0" ,
		"#808080" , "#0000ff" , "#00ff00" , "#00ffff" , "#ff0000" , "#ff00ff" , "#ffff00" , "#ffffff"];
	palette["cga"] = ["#000" , "#00a" , "#0a0" , "#0aa" , "#a00" , "#a0a" , "#aa0" , "#aaa" , "#555" , "#55f" , "#5f5" , "#5ff" , "#f55" , "#f5f" , "#ff5" , "#fff"];
	palette["win7"] = ["#000000" , "#7f7f7f" , "#b97a57" , "#ed1c24" , "#ff7f27" , "#fff200" , "#22b14c" , "#00a2e8" , "#3f48cc" , "#a349a4" ,
		"#ffffff" , "#c3c3c3" , "#b97a57" , "#ffaec9" , "#ffc90e" , "#efe4b0" , "#b5e61d" , "#99d9ea" , "#7092be" , "#c8bfe7"];
	palette["gray"] = ["#fff" , "#eee" , "#ddd" , "#ccc" , "#bbb" , "#aaa" , "#999" , "#888" , "#777" , "#666" , "#555" , "#444" , "#333" , "#222" , "#111" , "#000"];
	palette["feijoa1"] = ["#000" , "#005" , "#00a" , "#00f" , "#050" , "#055" , "#05a" , "#05f" , "#0a0" , "#0a5" , "#0aa" , "#0af" , "#0f0" , "#0f5" , "#0fa" , "#0ff",
		"#500" , "#505" , "#50a" , "#50f" , "#550" , "#555" , "#55a" , "#55f" , "#5a0" , "#5a5" , "#5aa" , "#5af" , "#5f0" , "#5f5" , "#5fa" , "#5ff",
		"#a00" , "#a05" , "#a0a" , "#a0f" , "#a50" , "#a55" , "#a5a" , "#a5f" , "#aa0" , "#aa5" , "#aaa" , "#aaf" , "#af0" , "#af5" , "#afa" , "#aff",
		"#f00" , "#f05" , "#f0a" , "#f0f" , "#f50" , "#f55" , "#f5a" , "#f5f" , "#fa0" , "#fa5" , "#faa" , "#faf" , "#ff0" , "#ff5" , "#ffa" , "#fff"];
var currentPalette = "cga";

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
	
	document.getElementById("version").innerHTML=infoVersion;
	document.getElementById("date").innerHTML=infoDate;

	paletteSelect = document.getElementById("palette-select");

	for(tPalette in paletteDesc) {
		paletteSelect.options[paletteSelect.options.length] = new Option(paletteDesc[tPalette], tPalette);
	}
	updatePalette();
}

function updatePalette() {
	currentPalette = document.getElementById("palette-select").value;
	paletteElem = document.getElementById("palette");

	while(paletteElem.childNodes.length) {
		paletteElem.removeChild(paletteElem.childNodes[0])
	}

	var colCount = 0;

	for(tColor in palette[currentPalette]) {
		var palettine = document.createElement("span");
		palettine.className = "palettine";
		palettine.style.background =  palette[currentPalette][tColor];
		palettine.setAttribute('onclick', 'updateColor("' + palette[currentPalette][tColor] + '");');
		paletteElem.appendChild(palettine);
		if(colCount == paletteWidth[currentPalette] - 1)
		{
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

function invertColors() {
	var buffer = history[historyPosition];
	for (var i = 0; i < buffer.data.length; i += 4)
		for (var j = 0; j < 3; j++)
			buffer.data[i + j] = 255 - buffer.data[i + j];
	 
	dc.putImageData(buffer, 0, 0);
	historyOperation(0);
}

function updateColor(value) {
	var c=document.getElementById("color"), v=value||c.value;
	var colorSummary = 0;
	var regShort = /^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/i;
	var regLong = /^#[0-9a-fA-F]{6}$/i;
	if(regShort.test(v))
		v=v.replace(regShort, '#$1$1$2$2$3$3');
	if(!regLong.test(v))
		return;
	colorSummary = parseInt(v.substr(1), 16);
	if (value!="")
		c.value=v;
	var hexDivider = 1;
	var hexMultiplier = 256;
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
			case 'I'.charCodeAt(0): invertColors(); break;
			//default: alert('def')
		}
	}
}
