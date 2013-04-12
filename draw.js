var infoVersion = "v1.4.2";
var infoDate = "April 13, 2013"

var canvas, dc;
var x = 0, y = 0;

var activeDrawing = false;

var historyStorage = 32;
var history = new Array(historyStorage);
var historyPosition = 0,
	historyPositionMax = 0;

var lastAutoSave = new Date().getTime(),
	enableAutoSave = true;

var cWidth = 600,
	cHeight = 360;

var tools = [
	{"Opacity" : 1.00, "Width" :  4, "Blur" : 0, "Color" : "0, 0, 0"}       //Fore
,	{"Opacity" : 1.00, "Width" : 20, "Blur" : 0, "Color" : "255, 255, 255"} //Back
,	{"Opacity" : 1.00, "Width" : 20, "Blur" : 0, "Color" : "255, 255, 255"} //Earaser
], tool = tools[0];

var debugMode = false,
	fps = 0,
	ticks = 0;

var flushCursor = false,
	neverFlushCursor = true;
var lowQMode = false,
	precisePreview = false;

var paletteDesc = {"classic" : "Classic", "cga" : "CGA", "win7" : "Шindoшs", "gray" : "Post-Rock", "safe" : "Web 216", "feijoa" : "Feijoa", "touhou" : "Тошки"};
var palette = new Array(); //"@b" breaks the line, "@r" gives name to the new row
	palette["classic"] = [
		"#000000", "#000080", "#008000", "#008080", "#800000", "#800080", "#808000", "#c0c0c0", "@b",
		"#808080", "#0000ff", "#00ff00", "#00ffff", "#ff0000", "#ff00ff", "#ffff00", "#ffffff"];
	palette["cga"] = ["#000", "#00a", "#0a0", "#0aa", "#a00", "#a0a", "#aa0", "#aaa", "@b",
		"#555", "#55f", "#5f5", "#5ff", "#f55", "#f5f", "#ff5", "#fff"];
	palette["win7"] = [
		"#000000", "#7f7f7f", "#880015", "#ed1c24", "#ff7f27", "#fff200", "#22b14c", "#00a2e8", "#3f48cc", "#a349a4", "@b",
		"#ffffff", "#c3c3c3", "#b97a57", "#ffaec9", "#ffc90e", "#efe4b0", "#b5e61d", "#99d9ea", "#7092be", "#c8bfe7"];
	palette["gray"] = ["#fff", "#eee", "#ddd", "#ccc", "#bbb", "#aaa", "#999", "#888", "#777", "#666", "#555", "#444", "#333", "#222", "#111", "#000"];
	palette["feijoa"] = [];	
	generatePalette("feijoa",85,0);
	palette["touhou"] = [
		"@r", "Рейму", "#fa5946", "#ffffff", "#000000", "#e5ff41", "@b",
		"@r", "Мариса", "#000000", "#ffffff", "#fff87d", "#a864a8", "@b",
		"@r", "Сырно", "#1760f3", "#ffffff", "#97ddfd", "#fd3727", "#00d4ae", "@b",
		"@r", "Сакуя", "#ffffff", "#59428b", "#bcbccc", "#fe3030", "#00c2c6", "#585456", "@b",
		"@r", "Ремилия", "#ffffff", "#cf052f", "#cbc9fd", "#f22c42", "#f2dcc6", "#464646", "@b",
		"@r", "Чен", "#fa5946", "#ffffff", "#6b473b", "#339886", "#464646", "#ffdb4f", "@b",
		"@r", "Ран", "#393c90", "#ffffff", "#ffff6e", "#c096c0", "@b",
		"@r", "Юкари", "#c096c0", "#ffffff", "#ffff6e", "#fa0000", "#464646", "@b",
		"@r", "Generic", "#fcefe2", "#000000"];
	palette["safe"] = [];
	generatePalette("safe",51,3);
	

var currentPalette = "touhou";

document.addEventListener("DOMContentLoaded", init, false);

function init()
{
	canvas = document.getElementById("draw");
	dc = canvas.getContext("2d");
	canvas.addEventListener("mousedown", cDrawStart, false);
	canvas.addEventListener("mousemove", cDraw, false);
	document.addEventListener("mouseup", cDrawEnd, false);
	canvas.addEventListener("mouseout", cDraw, false);
	canvas.addEventListener("mouseover", cDrawRestore, false);
	document.addEventListener("mousemove", updatePosition, false);
	document.addEventListener("keydown", cHotkeys, false);

	canvas.setAttribute("oncontextmenu", "return false;");
	canvas.setAttribute("onscroll", "return false;");

	//canvas.addEventListener("contextmenu", cDrawCancel, false);

	canvas.addEventListener("wheel", cLWChange, false);
	canvas.width = cWidth;
	canvas.height = cHeight;

	//document.getElementById("tools").style.width = cWidth + "px";

	dc.fillStyle = "white";
	dc.fillRect(0, 0, cWidth, cHeight);
	history[0] = dc.getImageData(0, 0, cWidth, cHeight);
	document.getElementById("version").innerHTML = infoVersion;
	document.getElementById("date").innerHTML = infoDate;

	document.getElementById("color").value = "#000000";
	document.getElementById("checkOM").checked = lowQMode;
	document.getElementById("checkPP").checked = precisePreview;

	paletteSelect = document.getElementById("palette-select");

	for (tPalette in paletteDesc) {
		paletteSelect.options[paletteSelect.options.length] = new Option(paletteDesc[tPalette], tPalette);
		if (tPalette == currentPalette)
			paletteSelect.options[paletteSelect.options.length - 1].selected = true;
	}

	document.getElementById("colorF").style.background = "rgb(" + tools[0].Color + ")";
	document.getElementById("colorB").style.background = "rgb(" + tools[1].Color + ")";

	var e = document.getElementById("rangeW"),
		a = ["B", "O", "W"],
		i = a.length;
	if (e.type == "range") while (i--) {
		e = document.createElement("input");
		e.id = "range" + a[i] + "S";
		e.type = "text";
		e.setAttribute("onchange", "updateSliders(2);");
		document.getElementById("sliders" + a[i]).appendChild(e);
	} else while (i--) {
		document.getElementById("range" + a [i]).type = "text";
	}

	updateDebugScreen();
	updatePalette();
	updateButtons();
	updateSliders();

	if (debugMode)
		setInterval("fpsCount()", 1000);
}

function generatePalette(name, step, slice) { //safe palette constructor, step recomended to be: 1, 3, 5, 15, 17, 51, 85, 255
	var letters = [0, 0, 0];
	while (letters[0]<=255 ) { 
		var l = palette[name].length;
		palette[name][l] = "#";
		for (var i = 0; i < 3; i++)	{
			var s = letters[i].toString(16);
			if (s.length == 1)
				s = "0" + s;
			palette[name][l] += s;
		}
		letters[2] += step;
		if (letters[2] > 255) {
			letters[2] = 0;
			letters[1] += step;
		}
		if (letters[1] > 255) {
			letters[1] = 0;
			letters[0] += step;
		}
		if (((letters[1] == step * slice) || letters[1] == 0) && letters[2] == 0)			
			palette[name][l+1] = "@b";
	}
}

function updatePalette() {
	currentPalette = document.getElementById("palette-select").value;
	paletteElem = document.getElementById("palette");

	while (paletteElem.childNodes.length) {
		paletteElem.removeChild(paletteElem.childNodes[0])
	}

	var colCount = 0;

	var paletteTable = document.createElement("table");
	paletteElem.appendChild(paletteTable);
	var paletteRow = document.createElement("tr");

	for (tColor in palette[currentPalette]) {
		var c = palette[currentPalette][tColor];
		var paletteCell;
		if (c == "@r") {
			paletteCell = document.createElement("td");
			paletteCell.innerHTML = palette[currentPalette][parseInt(tColor) + 1];;
			paletteRow.appendChild(paletteCell);
			colCount = -2;
		}
		if (c == "@b") {
			paletteTable.appendChild(paletteRow);
			paletteRow = document.createElement("tr");
			colCount = -1;
		}
		if (colCount >= 0) {
			paletteCell = document.createElement("td");
			var palettine = document.createElement("div");
			palettine.className = "palettine";
			palettine.style.background = c;
			palettine.setAttribute("onclick", "updateColor('" + c + "',0);");
			palettine.setAttribute("oncontextmenu", "updateColor('" + c + "',1); return false;");
			paletteCell.appendChild(palettine);
			paletteRow.appendChild(paletteCell);
		}
		colCount ++;
	}
	paletteTable.appendChild(paletteRow);
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
		if (precisePreview) {
			dc.fillStyle = "rgba(" + tool.Color + ", " + tool.Opacity + ")";
			dc.shadowBlur = tool.Blur;
			dc.shadowColor = "rgb(" + tool.Color + ")";
		}
		else {
			dc.strokeStyle = "rgb(" + tool.Color + ")";
			dc.shadowBlur = 0;
		}
		dc.arc(x, y, tool.Width / 2, 0, Math.PI*2, false);
		dc.closePath();
		if (precisePreview)
			dc.fill();
		else
			dc.stroke();
		if (!neverFlushCursor)
			flushCursor = true;
	}
}

function cDraw(event) {
	var pX = x;
	var pY = y;
	var halfW = Math.floor(tool.Width / 2);
	updatePosition(event);
	updateDebugScreen();

	if (flushCursor || neverFlushCursor) {
		if (!(lowQMode && activeDrawing))
			dc.putImageData(history[historyPosition], 0, 0);
	}

	if (activeDrawing) {
		dc.lineTo(x + 0.5, y + 0.5);
		dc.stroke();
	}
	else
		if (neverFlushCursor && !lowQMode)
			drawCursor();
}

function cDrawStart(event) {
	updatePosition(event);
	canvas.focus();
	event.preventDefault();
	if (event.which == 2) {
		cCopyColor();
	} else
	if (event.which == 1 || event.which == 3) {
		event.stopPropagation();
		event.cancelBubble = true;

		var t = tools[(event.which == 1) ? 0 : 1];
		dc.putImageData(history[historyPosition], 0, 0);
		activeDrawing = true;
		dc.lineWidth = t.Width;
		dc.shadowBlur = t.Blur;
		dc.strokeStyle = "rgba(" + t.Color + ", " + t.Opacity + ")";
		dc.shadowColor = "rgb(" + t.Color + ")";
		dc.lineJoin = "round";
		dc.lineCap = "round";
		dc.beginPath();
		dc.moveTo(x + 0.5, y + 0.5);
		dc.lineTo(x + 0.49, y + 0.49);
		dc.stroke();
	}
	return false;
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

function cDrawRestore(event) {
	if (activeDrawing)
		dc.moveTo(x + 0.5, y + 0.5);
	updatePosition(event);
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
			tool.Opacity = (parseFloat(tool.Opacity) - 0.05).toFixed(2);
		else if (event.shiftKey)
			tool.Blur --;
		else
			tool.Width --;
	}
	if (delta < 0) {
		if (event.ctrlKey)
			tool.Opacity = (parseFloat(tool.Opacity) + 0.05).toFixed(2);
		else if (event.shiftKey)
			tool.Blur ++;
		else
			tool.Width ++;
	}

	updateDebugScreen();
	updateSliders();
}

function updateDebugScreen() {
	if (debugMode) {
		var debug = document.getElementById("debug");
		debug.innerHTML = "Cursor @" + x + ":" + y + " FPS: " + fps;
		ticks ++;
	}
}

function clearScreen(toolIndex) {
	dc.fillStyle = "rgb(" + tools[toolIndex].Color + ")";
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

function updateSliders(initiator) {
	var m = initiator || 0;

	if (m > 0) {
		var s = (m == 2 ? "S" : "");
		tool.Blur	= document.getElementById("rangeB" + s).value;
		tool.Width	= document.getElementById("rangeW" + s).value;
		tool.Opacity	= document.getElementById("rangeO" + s).value;
	}

	if (tool.Opacity <= 0.1) tool.Opacity = "0.10"; else
	if (tool.Opacity >=   1) tool.Opacity = "1.00";

	if (tool.Width <=   1) tool.Width = 1; else
	if (tool.Width >= 123) tool.Width = 123;

	if (tool.Blur <=   0) tool.Blur = 0; else
	if (tool.Blur >= 123) tool.Blur = 123;

	document.getElementById("rangeB").value = tool.Blur;
	document.getElementById("rangeW").value = tool.Width;
	document.getElementById("rangeO").value = tool.Opacity;

	if (document.getElementById("rangeWS")) {
		document.getElementById("rangeBS").value = tool.Blur;
		document.getElementById("rangeWS").value = tool.Width;
		document.getElementById("rangeOS").value = tool.Opacity;
	}

	cDrawEnd();
	dc.putImageData(history[historyPosition], 0, 0, parseInt(x) - 64, parseInt(y) - 64, 128, 128);
	drawCursor();
}

function swapTools(earaser) {
	if(earaser)	{
		for (i in tool)
			tool[i] = tools[2][i];
	}
	else { //* looks messy when multiline
		var back = tools[0];
		tool = tools[0] = tools[1];
		tools[1] = back;	
	}
	updateColor(tools[1].Color, 1);
	updateColor(tool.Color, 0);
	updateSliders();
}

function updateColor(value, toolIndex) {
	var t = tools[toolIndex || 0];
	var c = document.getElementById("color");
	var v = value || c.value;
	var regShort = /^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/i;
	var regLong = /^#[0-9a-fA-F]{6}$/i;
	var regRGB = /^([0-9]{1,3}), ([0-9]{1,3}), ([0-9]{1,3})/;	
	if (regRGB.test(v))
	{
		var a = (t.Color = v).split(", ");
		v = "#";
		for (i in a)
			v += ((a[i] = parseInt(a[i]).toString(16)).length == 1) ? "0" + a[i] : a[i];
		c.value = v;
	} else {
		if (regShort.test(v))
			v = v.replace(regShort, "#$1$1$2$2$3$3");
		if (!regLong.test(v))
			return;
		if (value != "") {
			c.value = v;
			t.Color = parseInt(v.substr(1,2), 16) + ", "
				+ parseInt(v.substr(3,2), 16) + ", "
				+ parseInt(v.substr(5,2), 16);
		}
	}
	document.getElementById(t == tool ? "colorF" : "colorB").style.background = "rgb(" + t.Color + ")";
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
		if (historyPosition < historyStorage - 1) {
			historyPosition ++;
			historyPositionMax = historyPosition;
		}
		else
			for(i = 0; i < historyStorage - 1; i ++)
				history[i] = history[i + 1];
		history[historyPosition] = canvas.getContext("2d").getImageData(0, 0, cWidth, cHeight);
		if (new Date().getTime() - lastAutoSave > 60000 && enableAutoSave) {
			savePic(-1,true);
			lastAutoSave = new Date().getTime()
		}
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
			case "Z".charCodeAt(0): historyOperation(1); return;
			case "X".charCodeAt(0): historyOperation(2); return;
			case "C".charCodeAt(0): cCopyColor(); return;
			case "F".charCodeAt(0): clearScreen(0); return;
			case "D".charCodeAt(0): clearScreen(1); return;
			case "I".charCodeAt(0): invertColors(); return;
			case "S".charCodeAt(0): swapTools(0); return;
			case "A".charCodeAt(0): swapTools(1); return;

			case "Q".charCodeAt(0): tool.Width--; break;
			case "W".charCodeAt(0): tool.Width++; break;
			case "E".charCodeAt(0): tool.Opacity = (parseFloat(tool.Opacity) - 0.05).toFixed(2); break;
			case "R".charCodeAt(0): tool.Opacity = (parseFloat(tool.Opacity) + 0.05).toFixed(2); break;
			case "T".charCodeAt(0): tool.Blur--; break;
			case "Y".charCodeAt(0): tool.Blur++; break;
		}
		updateSliders();
	}
}

function switchMode(id) {
	id ?	(document.getElementById("checkPP").checked = precisePreview = !precisePreview)
	:	(document.getElementById("checkOM").checked = lowQMode = !lowQMode);
}

function savePic(value, auto) {
	var a = auto || false;
	switch (value) {
		case 0:
			var imageToSend = document.createElement("input");
			var jpgData = canvas.toDataURL("image/jpeg");
			var pngData = canvas.toDataURL();
			imageToSend.value = (jpgData.length < pngData.length ? jpgData : pngData);
			imageToSend.name = "content";
			imageToSend.type = "hidden";
			document.getElementById("send").appendChild(imageToSend);
		break;
		case 1: picTab = window.open(canvas.toDataURL("image/jpeg"), "_blank"); break;
		case 2: picTab = window.open(canvas.toDataURL(), "_blank"); break;
		case -1:
			if (a || confirm("Вы уверены, что хотите загрузить данные в Local Storage?")) {
				var jpgData = canvas.toDataURL("image/jpeg");
				var pngData = canvas.toDataURL();
				localStorage.recovery = (jpgData.length < pngData.length ? jpgData : pngData);
			}
		break;
		case -2:
			var image = new Image();
	        image.src = localStorage.recovery;
			dc.drawImage(image, 0, 0);
			historyOperation(0);
		break;
		default: alert("Недопустимое значение (обновите кэш).");
	}
}

function fpsCount() {
	fps = ticks;
	ticks = 0;
}
