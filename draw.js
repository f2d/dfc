var infoVersion = "v1.5.8";
var infoDate = "April 22, 2013"

var canvas, dc;
var x = 0, y = 0,
	vX = 0, vY = 0,
	globalOffset = 0.5, //pixel offset
	globalOffs_1 = globalOffset - 0.01,
	angle = 0; //previous angle

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
	{"Opacity" : 1.00, "Width" :  4, "Blur" : 0, "TurnLimit" : 360, "Color" : "0, 0, 0"      } //Fore
,	{"Opacity" : 1.00, "Width" : 20, "Blur" : 0, "TurnLimit" : 360, "Color" : "255, 255, 255"} //Back
,	{"Opacity" : 1.00, "Width" : 20, "Blur" : 0, "TurnLimit" : 360, "Color" : "255, 255, 255"} //Eraser
], tool = tools[0];


var debugMode = false,
	fps = 0,
	ticks = 0;

var flushCursor = false,
	neverFlushCursor = true;
var lowQMode = false,
	precisePreview = false;

var paletteDesc = {"combo" : "Комбинированная", "safe" : "Web 216", "feijoa" : "Feijoa", "touhou" : "Тошки", "history" : "История"};
var palette = new Array(); //"@b" breaks the line, "@r" gives name to a new row
	palette["combo"] = [
		        "@r", "Классическая", "#000000", "#000080", "#008000", "#008080", "#800000", "#800080", "#808000", "#c0c0c0"
		, "@b", "@r", "", "#808080", "#0000ff", "#00ff00", "#00ffff", "#ff0000", "#ff00ff", "#ffff00", "#ffffff"

		, "@b", "@r", "CGA", "#000", "#00a", "#0a0", "#0aa", "#a00", "#a0a", "#aa0", "#aaa"
		, "@b", "@r", "", "#555", "#55f", "#5f5", "#5ff", "#f55", "#f5f", "#ff5", "#fff"

		, "@b", "@r", "ЧБ", "#fff", "#eee", "#ddd", "#ccc", "#bbb", "#aaa", "#999", "#888",
		, "@b", "@r", "", "#777", "#666", "#555", "#444", "#333", "#222", "#111", "#000"

		, "@b", "@r", "Windows&nbsp;7", "#000000", "#7f7f7f", "#880015", "#ed1c24", "#ff7f27", "#fff200", "#22b14c", "#00a2e8", "#3f48cc", "#a349a4"
		, "@b", "@r", "", "#ffffff", "#c3c3c3", "#b97a57", "#ffaec9", "#ffc90e", "#efe4b0", "#b5e61d", "#99d9ea", "#7092be", "#c8bfe7"
		];
	palette["feijoa"] = [];
	generatePalette("feijoa", 85, 0);
	palette["safe"] = [];
	generatePalette("safe", 51, 6);
	palette["touhou"] = ["@c", "основной цвет", "вторичный цвет", "волосы", "глаза/аксессуары", "аксессуары"
	    , "@b", "@r", "Общее", "#fcefe2", "#000000"
		, "@b", "@r", "Рейму", "#fa5946", "#ffffff", "#000000", "#e5ff41"
		, "@b", "@r", "Мариса", "#000000", "#ffffff", "#fff87d", "#a864a8"
		, "@b", "@r", "Сырно", "#1760f3", "#ffffff", "#97ddfd", "#fd3727", "#00d4ae"
		, "@b", "@r", "Сакуя", "#ffffff", "#59428b", "#bcbccc", "#fe3030", "#00c2c6", "#585456"
		, "@b", "@r", "Ремилия", "#ffffff", "#cf052f", "#cbc9fd", "#f22c42", "#f2dcc6", "#464646"
		, "@b", "@r", "Алиса", "#ffffff", "#8787f7", "#fafab0", "#fabad2", "#888888"
		, "@b", "@r", "Ёму", "#2c8e7d", "#382d3a", "#ffffff", "#004457"
		, "@b", "@r", "Ююко", "#9eb2dc", "#ffffff", "#fba7b8", "#10009a", "#f60000"
		, "@b", "@r", "Чен", "#fa5946", "#ffffff", "#6b473b", "#339886", "#464646", "#ffdb4f"
		, "@b", "@r", "Ран", "#393c90", "#ffffff", "#ffff6e", "#c096c0"
		, "@b", "@r", "Юкари", "#c096c0", "#ffffff", "#ffff6e", "#fa0000", "#464646"
		, "@b", "@r", "Рейсен", "#000000", "#ffffff", "#dcc3ff", "#2e228c", "#e94b6d"
		, "@b", "@r", "Комачи", "#ffffff", "#257ed4", "#ed145b", "#4f352e", "#e7962d"
		];

	palette["history"] = (!!window.localStorage && !!window.localStorage.historyPalette) ? JSON.parse(window.localStorage.historyPalette) : [];

var currentPalette = (!!window.localStorage && !!window.localStorage.lastPalette) ? window.localStorage.lastPalette : "classic";

var hki = 0; //Hotkey interval for Opera
var hkPressed = false;

//KEY MODIFIERS
var c_ = 0x0100, 
	s_ = 0x0200,
	a_ = 0x0400;
	m_ = 0x0800;

var kbLayout = { 
	  "history.undo" :				"Z".charCodeAt(0)
	, "history.redo" :				"X".charCodeAt(0)
	, "history.store" :				119 //F8
	, "history.extract" :			120 //F9

	, "canva.fill" :				"F".charCodeAt(0)
	, "canva.delete" :				"G".charCodeAt(0)
	, "canva.invert" :				"I".charCodeAt(0)
	, "canva.jpeg" :				c_ + "J".charCodeAt(0)
	, "canva.png" :					c_ + "P".charCodeAt(0)
	, "canva.send" :				c_ + 13 //ENTER

	, "tool.lowquality" :			59 //;
	, "tool.preview" :				222 //'
	, "tool.colorpick" :			"C".charCodeAt(0)
	, "tool.swap" :					"S".charCodeAt(0)
	, "tool.eraser" :				"E".charCodeAt(0)
	, "tool.width-" :				"Q".charCodeAt(0)
	, "tool.width+" :				"W".charCodeAt(0)
	, "tool.opacity-" :				c_ + "Q".charCodeAt(0)
	, "tool.opacity+" :				c_ + "W".charCodeAt(0)
	, "tool.shadow-" :				s_ + "Q".charCodeAt(0)
	, "tool.shadow+" :				s_ + "W".charCodeAt(0)
	, "tool.turn-" :				c_ + s_ + "Q".charCodeAt(0)
	, "tool.turn+" :				c_ + s_ + "W".charCodeAt(0)

	, "app.help" :					112

	, "debug.mode" :				115
};

	kbLayout = (!!window.localStorage && !!window.localStorage.layout) ? JSON.parse(window.localStorage.layout) : kbLayout;

for (i = 1; i <= 10; i ++) {
	kbLayout["tool.opacity." + i] = (i == 10 ? 0 : i) + 48 + c_; 
	kbLayout["tool.width." + i] = (i == 10 ? 0 : i) + 48; 
}

var actLayout = { 
	  "history.undo" :				"historyOperation(1)"
	, "history.redo" :				"historyOperation(2)"
	, "history.store" :				"savePic(-1)"
	, "history.extract" :			"savePic(-2)"

	, "canva.fill" :				"clearScreen(0)"
	, "canva.delete" :				"clearScreen(1)"
	, "canva.invert" :				"invertColors()"
	, "canva.jpeg" :				"savePic(1)"
	, "canva.png" :					"savePic(2)"
	, "canva.send" :				"savePic(0)"

	, "tool.preview" :				"switchMode(1)"
	, "tool.lowquality" :			"switchMode(0)"
	, "tool.colorpick" :			"cCopyColor()"
	, "tool.swap" :					"swapTools(0)"
	, "tool.eraser" :				"swapTools(1)"
	, "tool.width-" :				"toolModify(0, 1, -1)"
	, "tool.width+" :				"toolModify(0, 1, +1)"
	, "tool.opacity-" :				"toolModify(0, 0, -0.05)"
	, "tool.opacity+" :				"toolModify(0, 0, +0.05)"
	, "tool.shadow-" :				"toolModify(0, 2, -1)"
	, "tool.shadow+" :				"toolModify(0, 2, +1)"
	, "tool.turn-" :				"toolModify(0, 3, -1)"
	, "tool.turn+" :				"toolModify(0, 3, +1)"

	, "app.help" :					"showHelp()"

	, "debug.mode" :				"switchMode(-1)"
};

for (i = 1; i <= 10; i ++) {
	actLayout["tool.opacity." + i] = "toolModify(0, 0, 0, " + (i / 10) + ")"; 
	actLayout["tool.width." + i] = "toolModify(0, 1, 0, " + Math.ceil(Math.pow(1.7, i-1)) + ")"; 
}

var kbDesc = {
	  13 : "Enter"
	, 45 : "Insert"
	, 46 : "Delete"
	, 186 : ";"
	, 187 : "Plus"
	, 189 : "Minus"
	, 222 : "'"
}

for (i = 1; i <= 15; i ++) {
	kbDesc[111 + i] = "F" + i;
}

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
	document.addEventListener("keydown", cHotkeysStart, false);
	document.addEventListener("keyup", cHotkeysEnd, false);

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

	document.getElementById("checkOM").checked = lowQMode;
	document.getElementById("checkPP").checked = precisePreview;

	setElemTitle("buttonH", "Помощь", "app.help");

	setElemTitle("buttonU", "Назад", "history.undo");
	setElemTitle("buttonR", "Вперёд", "history.redo");

	setElemTitle("colorF", "Закрасить полотно основным цветом", "canva.fill");
	setElemTitle("colorB", "Закрасить полотно фоновым цветом", "canva.delete");
	setElemTitle("buttonI", "Инверсия полотна", "canva.invert");

	setElemTitle("buttonTS", "Поменять инструменты местами", "tool.swap");
	setElemTitle("buttonTE", "Заменить инструмент на стандартный ластик", "tool.eraser");
	setElemTitle("checkOM", "Режим низкого качества", "tool.lowquality");
	setElemTitle("checkPP", "Предпросмотр кисти", "tool.preview");

	setElemTitle("buttonSB", "Сделать back-up", "history.store");
	setElemTitle("buttonSX", "Извлечь back-up", "history.extract");
	setElemTitle("buttonSJ", "Сохранить в JPEG", "canva.jpeg");
	setElemTitle("buttonSP", "Сохранить в PNG", "canva.png");
	setElemTitle("buttonS", "Отправить на сервер", "canva.send");

	paletteSelect = document.getElementById("palette-select");

	for (tPalette in paletteDesc) {
		paletteSelect.options[paletteSelect.options.length] = new Option(paletteDesc[tPalette], tPalette);
		if (tPalette == currentPalette)
			paletteSelect.options[paletteSelect.options.length - 1].selected = true;
	}

	var e = document.getElementById("rangeW"),
		a = ["B", "O", "W", "T"], 
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

	for (i in tools)
		updateColor(tools[i].Color, i);
	updateDebugScreen();
	updatePalette();
	updateButtons();
	updateSliders();

	if (debugMode)
		setInterval("fpsCount()", 1000);
}

function setElemTitle(elem, title, hotkey) {
	var k = kbLayout[hotkey];
	document.getElementById(elem).title = title + (hotkey ?  (" (" + 
		descKeyCode(k) + ")") : "");
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
	if(!!window.localStorage) //ie-ie
		window.localStorage.lastPalette = currentPalette;
	paletteElem = document.getElementById("palette");

	while (paletteElem.childNodes.length) {
		paletteElem.removeChild(paletteElem.childNodes[0])
	}

	var colCount = 0,
		rowCount = 0;
	var colDesc = new Array();

	var paletteTable = document.createElement("table");
	paletteElem.appendChild(paletteTable);
	var paletteRow = document.createElement("tr");
	var colorDesc = "";

	for (tColor in palette[currentPalette]) {
		var c = palette[currentPalette][tColor];
		var paletteCell;
		if (c == "@r") {
			paletteCell = document.createElement("td");
			paletteCell.innerHTML = palette[currentPalette][parseInt(tColor) + 1];
			paletteRow.appendChild(paletteCell);
			colCount = -2;
			colorDesc = palette[currentPalette][parseInt(tColor) + 1];;
		}
		if (c == "@c") {
			rowCount = -1;
			colCount = -1;
		}
		if (c == "@b") {
			paletteTable.appendChild(paletteRow);
			paletteRow = document.createElement("tr");
			colCount = -1;
			rowCount ++;
			colorDesc = "";
		}
		if (currentPalette == "history" && colCount == 16) {
			paletteTable.appendChild(paletteRow);
			paletteRow = document.createElement("tr");
			colCount = 0;
		}
		if (rowCount == -1) {
			if(colCount >= 0) {
				colDesc[colCount] = c;
			}
		}
		if (colCount >= 0 && rowCount >= 0) {
			paletteCell = document.createElement("td");
			var palettine = document.createElement("div");
			palettine.className = "palettine";
			palettine.title = palette[currentPalette][parseInt(tColor)] + (colorDesc != "" ? (" (" + colorDesc + (colDesc[colCount] ? (", " + colDesc[colCount]) : "" ) + ")") : "");
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
		precisePreview ? dc.fill() : dc.stroke();
		if (!neverFlushCursor)
			flushCursor = true;
	}
}

function cDraw(event) {
	var pX = x, pY = y;

	updatePosition(event);

	var r = Math.sqrt(Math.pow(x - pX, 2) + Math.pow(y - pY, 2)); //distance
	var a = Math.atan2(pY - y, x - pX) * (180 / Math.PI); //angle
	var dA = angle-a;

	updateDebugScreen();

	vX = pX + Math.cos(a * Math.PI / 4) * r;
	vY = pY - Math.sin(a * Math.PI / 4) * r;

	angle = a;

	if ((flushCursor || neverFlushCursor) && !(lowQMode && activeDrawing)) {
		dc.putImageData(history[historyPosition], 0, 0);
	}

	if (activeDrawing) {
		dc.lineTo(x + globalOffset, y + globalOffset);
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
		dc.moveTo(x + globalOffset, y + globalOffset);
		dc.lineTo(x + globalOffs_1, y + globalOffs_1);
		dc.stroke();
		vX = x;
		vY = y;
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
		dc.moveTo(x + globalOffset, y + globalOffset);
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
	var rgba = history[historyPosition].data, i = (x+y*cWidth)*4;
	var hex = (rgba[i] * 65536 + rgba[i+1] * 256 + rgba[i+2]).toString(16);
	while (hex.length < 6) {
		hex = "0" + hex;
	}
	updateColor("#" + hex);
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
		debug.innerHTML = "Cursor @" + x + ":" + y + " Angle: " + angle + " FPS: " + fps;
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
		tool.TurnLimit	= document.getElementById("rangeT" + s).value;
	}

	if (tool.Opacity <= 0.1) tool.Opacity = "0.10"; else
	if (tool.Opacity >=   1) tool.Opacity = "1.00";

	if (tool.Width <=   1) tool.Width = 1; else
	if (tool.Width >= 128) tool.Width = 128;

	if (tool.Blur <=  0) tool.Blur = 0; else
	if (tool.Blur >= 20) tool.Blur = 20;

	if (tool.TurnLimit <=   0) tool.TurnLimit = 0; else
	if (tool.TurnLimit >= 360) tool.TurnLimit = 360;

	document.getElementById("rangeB").value = tool.Blur;
	document.getElementById("rangeW").value = tool.Width;
	document.getElementById("rangeO").value = tool.Opacity;
	document.getElementById("rangeT").value = tool.TurnLimit;

	if (document.getElementById("rangeWS")) {
		document.getElementById("rangeBS").value = tool.Blur;
		document.getElementById("rangeWS").value = tool.Width;
		document.getElementById("rangeOS").value = tool.Opacity;
		document.getElementById("rangeTS").value = tool.TurnLimit;
	}

	cDrawEnd();
	dc.putImageData(history[historyPosition], 0, 0, parseInt(x) - 64, parseInt(y) - 64, 128, 128);
	drawCursor();
}

function swapTools(eraser) {
	if(eraser) {
		for (i in tool)
			tool[i] = tools[2][i];
	}
	else {
		var back = tools[0];
		tool = tools[0] = tools[1];
		tools[1] = back;
		updateColor(0,1);
	}
	updateColor(tool.Color);
	updateSliders();
}

function updateColor(value, toolIndex) {
	var t = tools[toolIndex || 0];
	var c = document.getElementById("color");
	var v = value || c.value;
	var regShort = /^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/i;
	var regLong = /^#[0-9a-fA-F]{6}$/i;
	var regRGB = /^([0-9]{1,3}),\s*([0-9]{1,3}),\s*([0-9]{1,3})/;
	if (regRGB.test(v))
	{
		var a = (t.Color = v).split(new RegExp(",\s*"));
		v = "#";
		for (i in a) {
			a[i] = Math.max(Math.min(parseInt(a[i]), 255), 0);
			v += ((a[i] = parseInt(a[i]).toString(16)).length == 1) ? "0" + a[i] : a[i];
		}
	} else {
		if (regShort.test(v))
			v = v.replace(regShort, "#$1$1$2$2$3$3");
		if (!regLong.test(v))
			return;
		if (value != "") {
			t.Color = parseInt(v.substr(1,2), 16) + ", "
				+ parseInt(v.substr(3,2), 16) + ", "
				+ parseInt(v.substr(5,2), 16);
		}
	}
	if (t == tool) {
		c.value = v;
	}
	document.getElementById((t == tool) ? "colorF" : "colorB").style.background = "rgb(" + t.Color + ")";

	//adding to history palette:
	var found = palette["history"].length;
	for (i = 0; i < found; i ++)
		if (palette["history"][i] == v)
			found = i;

	for (i = Math.min(found, 64 - 1); i > 0; i --) //stores only limited count of specimens
		palette["history"][i] = palette["history"][i - 1];
	palette["history"][0] = v;

	if (currentPalette == "history")
		updatePalette();

	if (!!window.localStorage)
		window.localStorage.historyPalette = JSON.stringify(palette["history"]);
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
		history[historyPosition] = dc.getImageData(0, 0, cWidth, cHeight);
		if (enableAutoSave) {
			var dt = new Date().getTime();
			if (dt - lastAutoSave > 60000) {
				savePic(-1,true);
				lastAutoSave = dt;
			}
		}
	}
	updateDebugScreen();
	updateButtons();
}

function updateButtons() {
	setElemTitle("buttonSJ", "Сохранить в JPEG (≈" + (canvas.toDataURL("image/jpeg").length / 1300).toFixed(0) + " kb)", "canva.jpeg");
	setElemTitle("buttonSP", "Сохранить в PNG (≈" + (canvas.toDataURL().length / 1300).toFixed(0) + " kb)", "canva.png");

	document.getElementById("buttonR").className = (historyPosition == historyPositionMax ? "button-disabled" : "button");
	document.getElementById("buttonU").className = (historyPosition == 0 ? "button-disabled" : "button");

}

function cHotkeys(k) {
	if (hki != 0)
		for (kbk in kbLayout) {
			if(kbLayout[kbk] == k) {
				eval(actLayout[kbk]);
				return;
			}
		}
	clearInterval(hki);
}

function cHotkeysStart(event) {
	if (!hkPressed) {		
		var k = event.keyCode
			+ (event.ctrlKey ? c_ : 0)
			+ (event.shiftKey ? s_ : 0)
			+ (event.altKey ? a_ : 0)
			+ (event.metaKey ? m_ : 0)
		if (x >= 0 && x < cWidth && y >= 0 && y < cHeight) {
			event.preventDefault();
			cHotkeys(k);
			hki = setInterval('cHotkeys(' + k +')', 100);
		}
		if(event.keyCode < 16 || event.keyCode > 18)
			hkPressed = true;
	}	
	event.returnValue = false;
}

function cHotkeysEnd(event) {
	clearInterval(hki);
	hkPressed = false;
	event.returnValue = false;
}

function toolModify(id, param, inc, value) {
	switch (param) {
		case 0: tools[id].Opacity = (inc == 0 ? value : (tools[id].Opacity + inc)).toFixed(2); break;
		case 1: tools[id].Width = (inc == 0 ? value : (tools[id].Width + inc)); break;
		case 2: tools[id].Blur = (inc == 0 ? value : (tools[id].Blur + inc)); break;
		case 3: tools[id].TurnLimit = (inc == 0 ? value : (tools[id].TurnLimit + inc)); break;
	}
	updateSliders();
}

function switchMode(id) {
	id == 1 ? (document.getElementById("checkPP").className = (precisePreview = !precisePreview) ? "button-active" : "button") : (
	id == 0 ? (document.getElementById("checkOM").className = (lowQMode = !lowQMode) ? "button-active" : "button") : (debugMode =! debugMode));
	debug.innerHTML="";
}

function savePic(value, auto) {
	var a = auto || false;
	switch (value) {
		case 0:
			if (a || confirm("Вы уверены, что хотите загрузить изображение на сервер?")) {
				var imageToSend = document.createElement("input");
				var jpgData = canvas.toDataURL("image/jpeg");
				var pngData = canvas.toDataURL();
				imageToSend.value = (jpgData.length < pngData.length ? jpgData : pngData);
				imageToSend.name = "content";
				imageToSend.type = "hidden";
				document.getElementById("send").appendChild(imageToSend);
				document.getElementById("send").submit();
			}
		break;
		case 1: picTab = window.open(canvas.toDataURL("image/jpeg"), "_blank"); break;
		case 2: picTab = window.open(canvas.toDataURL(), "_blank"); break;
		case -1:
			if (a || confirm("Вы уверены, что хотите загрузить данные в Local Storage?")) {
				var jpgData = canvas.toDataURL("image/jpeg");
				var pngData = canvas.toDataURL();
				if(!!window.localStorage)
					window.localStorage.recovery = (jpgData.length < pngData.length ? jpgData : pngData);
				else if (!a)
					alert("Local Storage не поддерживается.");
			}
		break;
		case -2:
			var image = new Image();
			if(!!window.localStorage)
				image.src = window.localStorage.recovery;
			else if (!a)
				alert("Local Storage не поддерживается.");
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

function descKeyCode(k) {
	return (k & c_ ? "Ctrl + ":"") + 
		(k & a_ ? "Alt + ":"") + 
		(k & m_ ? "Meta + ":"") + 
		(k & s_ ? "Shift + ":"") + 
		(kbDesc[k % 256] ? kbDesc[k % 256] : String.fromCharCode(k % 256));
}

function showHelp() {
	alert("Управление:\nЛевая кнопка мыши — рисовать основным инструментом.\nПравая кнопка мыши — рисовать вторичным инструментом.\nСредняя кнопка мыши (или клавиша " + descKeyCode(kbLayout["tool.colorpick"]) + ") — выбор цвета из холста\n" +
		"Колёсико / " + descKeyCode(kbLayout["tool.width-"]) + " / " + descKeyCode(kbLayout["tool.width+"]) + " / " + descKeyCode(kbLayout["tool.width.10"]) + "—" + descKeyCode(kbLayout["tool.width.9"]) +
		" — изменение толщины.\n" +	"Если зажать Ctrl или Shift, будет происхотить изменение прозрачности или тени соответственно.\n" +
		"Остальные хоткеи можно подсмотреть, прочитав всплывающие подсказки к соответствующим кнопкам.\n" +
		"Курсор обязательно должен находиться над холстом!\n\n" +
        "Feijoa Sketch " + infoVersion + " by Genius,  " + infoDate);
}
