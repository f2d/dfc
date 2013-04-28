var infoVersion = "v1.6.1";
var infoDate = "April 28, 2013"

var sketcher, canvas, dc, sendForm,
	bar, sidebar,
	paletteElem, cElem; //main elements

var sliders = [];

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
	{"Opacity" : 1.00, "Width" :  4, "Shadow" : 0, "TurnLimit" : 360, "Color" : "0, 0, 0"      } //Fore
,	{"Opacity" : 1.00, "Width" : 20, "Shadow" : 0, "TurnLimit" : 360, "Color" : "255, 255, 255"} //Back
,	{"Opacity" : 1.00, "Width" : 20, "Shadow" : 0, "TurnLimit" : 360, "Color" : "255, 255, 255"} //Eraser
], tool = tools[0];

var toolLimits = {"Opacity": [0, 1, 0.05], "Width": [1, 128, 1], "Shadow": [0, 20, 1], "TurnLimit": [0, 180, 1]};

var debugMode = false,
	fps = 0,
	ticks = 0;

var flushCursor = false,
	neverFlushCursor = true;
var lowQMode = false,
	precisePreview = false,
	antiAliasing = true;

var paletteDesc = {"combo" : "Комбинированная", "safe" : "Web 216", "feijoa" : "Feijoa", "touhou" : "Тошки", "history" : "История"};
var palette = new Array(); //"@b" breaks the line, "@r" gives name to a new row
	palette["combo"] = [
		        "@r", "Классическая", "#000000", "#000080", "#008000", "#008080", "#800000", "#800080", "#808000", "#c0c0c0"
		, "@b", "@r", "", "#808080", "#0000ff", "#00ff00", "#00ffff", "#ff0000", "#ff00ff", "#ffff00", "#ffffff"

		, "@b", "@r", "CGA", "#000", "#00a", "#0a0", "#0aa", "#a00", "#a0a", "#aa0", "#aaa"
		, "@b", "@r", "", "#555", "#55f", "#5f5", "#5ff", "#f55", "#f5f", "#ff5", "#fff"

		, "@b", "@r", "ЧБ", "#fff", "#eee", "#ddd", "#ccc", "#bbb", "#aaa", "#999", "#888",
		, "@b", "@r", "", "#777", "#666", "#555", "#444", "#333", "#222", "#111", "#000"

		, "@b", "@r", "Windows 7", "#000000", "#7f7f7f", "#880015", "#ed1c24", "#ff7f27", "#fff200", "#22b14c", "#00a2e8", "#3f48cc", "#a349a4"
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
	  "history-undo" :				"Z".charCodeAt(0)
	, "history-redo" :				"X".charCodeAt(0)
	, "history-store" :				119 //F8
	, "history-extract" :			120 //F9

	, "canva-fill" :				"F".charCodeAt(0)
	, "canva-delete" :				"G".charCodeAt(0)
	, "canva-invert" :				"I".charCodeAt(0)
	, "canva-jpeg" :				c_ + "J".charCodeAt(0)
	, "canva-png" :					c_ + "P".charCodeAt(0)
	, "canva-send" :				c_ + 13 //ENTER

	, "tool-antialiasing" :			190 //.
	, "tool-lowquality" :			59 //;
	, "tool-preview" :				222 //'
	, "tool-colorpick" :			"C".charCodeAt(0)
	, "tool-swap" :					"S".charCodeAt(0)
	, "tool-eraser" :				"E".charCodeAt(0)
	, "tool-width-" :				"Q".charCodeAt(0)
	, "tool-width+" :				"W".charCodeAt(0)
	, "tool-opacity-" :				c_ + "Q".charCodeAt(0)
	, "tool-opacity+" :				c_ + "W".charCodeAt(0)
	, "tool-shadow-" :				s_ + "Q".charCodeAt(0)
	, "tool-shadow+" :				s_ + "W".charCodeAt(0)
	, "tool-turn-" :				c_ + s_ + "Q".charCodeAt(0)
	, "tool-turn+" :				c_ + s_ + "W".charCodeAt(0)

	, "app-help" :					112

	, "debug-mode" :				115
};

	kbLayout = (!!window.localStorage && !!window.localStorage.layout) ? JSON.parse(window.localStorage.layout) : kbLayout;

for (i = 1; i <= 10; i ++) {
	kbLayout["tool-opacity." + i] = (i == 10 ? 0 : i) + 48 + c_; 
	kbLayout["tool-width." + i] = (i == 10 ? 0 : i) + 48; 
}

var actLayout = { 
	  "history-undo" :				{"Operation" :	"historyOperation(1)",	"Title" : "&#x2190;",	"Description" : "Назад"}
	, "history-redo" :				{"Operation" :	"historyOperation(2)",	"Title" : "&#x2192;",	"Description" : "Вперёд"}
	, "history-store" :				{"Operation" :	"savePic(-1)",			"Title" : "&#x22C1;",	"Description" : "Сделать back-up"}
	, "history-extract" :			{"Operation" :	"savePic(-2)",			"Title" : "&#x22C0;",	"Description" : "Извлечь back-up"}

	, "canva-fill" :				{"Operation" :	"clearScreen(0)",		"Title" : "1",			"Description" : "Закрасить полотно основным цветом"}
	, "canva-delete" :				{"Operation" :	"clearScreen(1)",		"Title" : "2",			"Description" : "Закрасить полотно фоновым цветом"}
	, "canva-invert" :				{"Operation" :	"invertColors()",		"Title" : "&#x25D0;",	"Description" : "Инверсия полотна"}
	, "canva-jpeg" :				{"Operation" :	"savePic(1)",			"Title" : "J",			"Description" : "Сохранить в JPEG"}
	, "canva-png" :					{"Operation" :	"savePic(2)",			"Title" : "P",			"Description" : "Сохранить в PNG"}
	, "canva-send" :				{"Operation" :	"savePic(0)",			"Title" : "&#x21B5;",	"Description" : "Отправить на сервер"}

	, "tool-antialiasing" :			{"Operation" :	"switchMode(2)",		"Title" : "&nbsp;",		"Description" : "Не сглаживать"}
	, "tool-preview" :				{"Operation" :	"switchMode(1)",		"Title" : "&#x25CF;",	"Description" : "Предпросмотр кисти"}
	, "tool-lowquality" :			{"Operation" :	"switchMode(0)",		"Title" : "&#x25A0;",	"Description" : "Режим низкого качества"}
	, "tool-colorpick" :			{"Operation" :	"cCopyColor()"}
	, "tool-swap" :					{"Operation" :	"swapTools(0)",			"Title" : "&#x2194;",	"Description" : "Поменять инструменты местами"}
	, "tool-eraser" :				{"Operation" :	"swapTools(1)",			"Title" : "&#x25A1;",	"Description" : "Заменить инструмент на стандартный ластик"}
	, "tool-width-" :				{"Operation" :	"toolModify(0, 1, -1)"}
	, "tool-width+" :				{"Operation" :	"toolModify(0, 1, +1)"}
	, "tool-opacity-" :				{"Operation" :	"toolModify(0, 0, -0.05)"}
	, "tool-opacity+" :				{"Operation" :	"toolModify(0, 0, +0.05)"}
	, "tool-shadow-" :				{"Operation" :	"toolModify(0, 2, -1)"}
	, "tool-shadow+" :				{"Operation" :	"toolModify(0, 2, +1)"}
	, "tool-turn-" :				{"Operation" :	"toolModify(0, 3, -1)"}
	, "tool-turn+" :				{"Operation" :	"toolModify(0, 3, +1)"}

	, "tool-width" : 				{"Title" : "Толщина"}
	, "tool-opacity" : 				{"Title" : "Непрозрачность"}
	, "tool-shadow" : 				{"Title" : "Тень"}
	, "tool-color" : 				{"Title" : "Код цвета"}
	, "tool-palette" : 				{"Title" : "Палитра"}

	, "app-help" :					{"Operation" :	"showHelp()",			"Title" : "?",			"Description" : "Помощь"}

	, "debug-mode" :				{"Operation" :	"switchMode(-1)"}
};

//List of buttons to display
var guiButtons = ["history-undo", "history-redo", "|", "canva-fill", "tool-swap", "canva-delete", "tool-eraser", "canva-invert", "|", "tool-preview", "tool-lowquality", "|",
					"history-store", "history-extract", "canva-jpeg", "canva-png", "canva-send", "|", "app-help"];

for (i = 1; i <= 10; i ++) {
	actLayout["tool-opacity." + i] = {"Operation" : "toolModify(0, 0, 0, " + (i / 10) + ")"}; 
	actLayout["tool-width." + i] = {"Operation" : "toolModify(0, 1, 0, " + Math.ceil(Math.pow(1.7, i-1)) + ")"}; 
}

var kbDesc = {
	  8 : "Backspace"
	, 9 : "Tab"
	, 13 : "Enter"
	, 45 : "Insert"
	, 46 : "Delete"
	, 186 : ";"
	, 187 : "Plus"
	, 189 : "Minus"
	, 190 : "."
	, 222 : "'"
}

for (i = 1; i <= 15; i ++) {
	kbDesc[111 + i] = "F" + i;
}

document.addEventListener("DOMContentLoaded", init, false);

function init()
{
	sketcher = document.getElementById("sketcher");

	sendForm = document.createElement("form");
	sendForm.method = "post";
	sendForm.action = "";
	sketcher.appendChild(sendForm);

	canvas = document.createElement("canvas");	
	sketcher.appendChild(canvas);

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

	canvas.addEventListener("wheel", cLWChange, false);
	canvas.width = cWidth;
	canvas.height = cHeight;

	dc = canvas.getContext("2d");

	dc.fillStyle = "white";
	dc.fillRect(0, 0, cWidth, cHeight);
	history[0] = dc.getImageData(0, 0, cWidth, cHeight);

	sidebar = document.createElement("span");
	sidebar.id = "tools";
	sketcher.appendChild(sidebar);

	var e = document.createElement("input"),
		a = ["shadow", "opacity", "width"], 
		i = a.length;
	while (i--) { 
		var et;
		var uLetter = a[i].charAt(0).toUpperCase() + a[i].substr(1);
		if ((e.type = "range") == e.type) {
			et = document.createElement("input");
			et.id = "tool-" + a[i];
			et.value = eval("tool." + uLetter);
			et.setAttribute("onchange", "updateSliders(1);");
			sidebar.appendChild(et);
			sliders[et.id] = et;
		}
		et = document.createElement("input");
		et.id = "tool-" + a[i] + "-text";
		et.value = eval("tool." + uLetter);
		et.min = toolLimits[uLetter][0];
		et.max = toolLimits[uLetter][1];
		et.step = toolLimits[uLetter][2];
		et.type = "text";
		et.setAttribute("onchange", "updateSliders(2);");
		sidebar.appendChild(et);
		sliders[et.id] = et;

		et = document.createElement("span");
		et.innerHTML = " " + actLayout["tool-" + a[i]].Title;
		sidebar.appendChild(et);

		sidebar.appendChild(document.createElement("br"));
	};

	e = document.createElement("span");
	e.innerHTML = actLayout["tool-palette"].Title + ": ";
	sidebar.appendChild(e);

	paletteSelect = document.createElement("select");
	paletteSelect.id = "palette-select";
	paletteSelect.setAttribute("onchange", "updatePalette();");
	sidebar.appendChild(paletteSelect);

	paletteElem = document.createElement("div");
	paletteElem.id = "palette";
	sidebar.appendChild(paletteElem);

	for (tPalette in paletteDesc) {
		paletteSelect.options[paletteSelect.options.length] = new Option(paletteDesc[tPalette], tPalette);
		if (tPalette == currentPalette)
			paletteSelect.options[paletteSelect.options.length - 1].selected = true;
	}

	e = document.createElement("span");
	e.innerHTML = actLayout["tool-color"].Title + ": ";
	sidebar.appendChild(e);

	cElem = document.createElement("input");
	cElem.type = "text";
	cElem.id = "color"
	sidebar.appendChild(cElem);

	bar = document.createElement("div");	
	sketcher.appendChild(bar);

	for(i in guiButtons) {
		var tElem = document.createElement("span");	
		if(guiButtons[i] != "|") {
			tElem.id = guiButtons[i];
			tElem.className = "button";
			tElem.innerHTML = actLayout[guiButtons[i]].Title;
			tElem.setAttribute("onclick", actLayout[guiButtons[i]].Operation);
			bar.appendChild(tElem);	
			setElemDesc(guiButtons[i]);
		} else {
			tElem.className = "vertical";	
			tElem.innerHTML = "&nbsp;";
			bar.appendChild(tElem);	
		}
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

function setElemDesc(elem, desc) {
	desc = desc || actLayout[elem].Description;
	var k = kbLayout[elem];
	document.getElementById(elem).title = desc + (elem ?  (" (" + 
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
	currentPalette = paletteSelect.value;
	if(!!window.localStorage) //ie-ie
		window.localStorage.lastPalette = currentPalette;

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
			paletteCell.innerHTML = palette[currentPalette][parseInt(tColor) + 1] + "&nbsp;";
			paletteRow.appendChild(paletteCell);
			colCount = -2;
			if(palette[currentPalette][parseInt(tColor) + 1] != "")
				colorDesc = palette[currentPalette][parseInt(tColor) + 1];
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
			dc.shadowBlur = tool.Shadow;
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
		if(antiAliasing) {
			dc.lineTo(x + globalOffset, y + globalOffset);
			dc.stroke();
		} else {
			dc.moveTo(x + globalOffs_1, y + globalOffs_1);
			dc.lineTo(x + globalOffset, y + globalOffset);
			dc.stroke();
		}
	} else
		if (neverFlushCursor && !lowQMode)
			drawCursor();
}

function cDrawStart(event) {
	updatePosition(event);
	//canvas.focus();
	event.preventDefault();
	event.returnValue = false;
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
		dc.shadowBlur = t.Shadow;
		dc.strokeStyle = "rgba(" + t.Color + ", " + t.Opacity + ")";
		dc.shadowColor = "rgb(" + t.Color + ")";
		dc.lineJoin = "round";
		dc.lineCap = "round";
		if(antiAliasing) {
			dc.beginPath();
			dc.moveTo(x + globalOffset, y + globalOffset);
			dc.lineTo(x + globalOffs_1, y + globalOffs_1);
			dc.stroke();
		}
		vX = x;
		vY = y;
	}
	return false;
}

function cDrawEnd(event) {
	//Saving in history:
	if (activeDrawing) {
		if(antiAliasing) {
			dc.putImageData(history[historyPosition], 0, 0);
			dc.stroke();
			dc.closePath();
		}
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
	event.returnValue = false;
	if (delta > 0) {
		if (event.ctrlKey)
			tool.Opacity = (parseFloat(tool.Opacity) - 0.05).toFixed(2);
		else if (event.shiftKey)
			tool.Shadow --;
		else
			tool.Width --;
	}
	if (delta < 0) {
		if (event.ctrlKey)
			tool.Opacity = (parseFloat(tool.Opacity) + 0.05).toFixed(2);
		else if (event.shiftKey)
			tool.Shadow ++;
		else
			tool.Width ++;
	}

	updateDebugScreen();
	updateSliders();
}

function updateDebugScreen() {
	if (debugMode) {
		var debug = document.getElementById("debug");
		debug.innerHTML = "Cursor @" + x + ":" + y + "<br />Angle: " + angle + "<br />FPS: " + fps;
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
		var s = (m == 2 ? "-text" : "");
		tool.Shadow	= document.getElementById("tool-shadow" + s).value;
		tool.Width	= document.getElementById("tool-width" + s).value;
		tool.Opacity	= document.getElementById("tool-opacity" + s).value;
		//tool.TurnLimit	= document.getElementById("tool-turnlimit" + s).value;
	}

	if (tool.Opacity <= 0.1) tool.Opacity = "0.10"; else
	if (tool.Opacity >=   1) tool.Opacity = "1.00";

	if (tool.Width <=   1) tool.Width = 1; else
	if (tool.Width >= 128) tool.Width = 128;

	if (tool.Shadow <=  0) tool.Shadow = 0; else
	if (tool.Shadow >= 20) tool.Shadow = 20;

	if (tool.TurnLimit <=   0) tool.TurnLimit = 0; else
	if (tool.TurnLimit >= 360) tool.TurnLimit = 360;

	document.getElementById("tool-shadow-text").value = tool.Shadow;
	document.getElementById("tool-width-text").value = tool.Width;
	document.getElementById("tool-opacity-text").value = tool.Opacity;
	//document.getElementById("rangeT").value = tool.TurnLimit;

	if (document.getElementById("tool-width")) {
		document.getElementById("tool-shadow").value = tool.Shadow;
		document.getElementById("tool-width").value = tool.Width;
		document.getElementById("tool-opacity").value = tool.Opacity;
		//document.getElementById("rangeTS").value = tool.TurnLimit;
	}

	cDrawEnd();
	dc.putImageData(history[historyPosition], 0, 0,
		parseInt(x) - tool.Width/ 2 - tool.Shadow * 1.25 - 3, parseInt(y) -tool.Width/ 2 - tool.Shadow * 1.25 - 3,
		tool.Width + tool.Shadow * 2.5 + 7, tool.Width + tool.Shadow * 2.5 + 7);
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
	var c = cElem;
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
	document.getElementById((t == tool) ? "canva-fill" : "canva-delete").style.background = "rgb(" + t.Color + ")";

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
	setElemDesc("canva-jpeg", actLayout["canva-jpeg"].Description + " (≈" + (canvas.toDataURL("image/jpeg").length / 1300).toFixed(0) + " kb)", "canva.jpeg");
	setElemDesc("canva-png", actLayout["canva-png"].Description + " (≈" + (canvas.toDataURL().length / 1300).toFixed(0) + " kb)", "canva.png");

	document.getElementById("history-undo").className = (historyPosition == historyPositionMax ? "button-disabled" : "button");
	document.getElementById("history-redo").className = (historyPosition == 0 ? "button-disabled" : "button");

}

function cHotkeys(k) {
	if (hki != 0)
		for (kbk in kbLayout) {
			if (kbLayout[kbk] == k) {
				eval(actLayout[kbk].Operation);
				hkPressed = true;
				return true;
			}
		}
	clearInterval(hki);
	return false;
}

function cHotkeysStart(event) {
	if (!hkPressed) {		
		var k = event.keyCode
			+ (event.ctrlKey ? c_ : 0)
			+ (event.shiftKey ? s_ : 0)
			+ (event.altKey ? a_ : 0)
			+ (event.metaKey ? m_ : 0)
		if (x >= 0 && x < cWidth && y >= 0 && y < cHeight) {
			if (cHotkeys(k)) {				
				event.preventDefault();
				event.returnValue = false;
			}
			hki = setInterval('cHotkeys(' + k +')', 100); //TODO: 1st interval: 1s.
		}
	}
	else {
		event.preventDefault();
		event.returnValue = false;
	}
}

function cHotkeysEnd(event) {
	clearInterval(hki);
	hkPressed = false;
	event.preventDefault();
	event.returnValue = false;
}

function toolModify(id, param, inc, value) {
	switch (param) {
		case 0: tools[id].Opacity = (inc == 0 ? value : (tools[id].Opacity + inc)).toFixed(2); break;
		case 1: tools[id].Width = (inc == 0 ? value : (tools[id].Width + inc)); break;
		case 2: tools[id].Shadow = (inc == 0 ? value : (tools[id].Shadow + inc)); break;
		case 3: tools[id].TurnLimit = (inc == 0 ? value : (tools[id].TurnLimit + inc)); break;
	}
	updateSliders();
}

function switchMode(id) {
	switch (id) {
		case -1: debugMode =! debugMode; debug.innerHTML=""; break;
		case 0: document.getElementById("tool-lowquality").className = (lowQMode = !lowQMode) ? "button-active" : "button"; break;
		case 1: document.getElementById("tool-preview").className = (precisePreview = !precisePreview) ? "button-active" : "button"; break;
		case 2: document.getElementById("tool-antialiasing").className = (antiAliasing = !antiAliasing) ? "button" : "button-active";
			updateSmoothing(antiAliasing);
			break;
	}
}

function updateSmoothing(value) {
	dc.imageSmoothingEnabled = value;
	dc.mozImageSmoothingEnabled = value;
	dc.webkitImageSmoothingEnabled = value;
	//canvas.style.imageRendering = "optimizeSpeed";
	//canvas.style.imageRendering = "-o-crisp-edges";
	//canvas.style.imageRendering = "-webkit-optimize-contrast";

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
				sendForm.appendChild(imageToSend);
				sendForm.submit();
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
	alert("Управление:\n\
Левая кнопка мыши — рисовать основным инструментом.\nПравая кнопка мыши — рисовать вторичным инструментом.\n\
Средняя кнопка мыши (или клавиша " + descKeyCode(kbLayout["tool-colorpick"]) + ") — выбор цвета из холста\n\
Колёсико / " + descKeyCode(kbLayout["tool-width-"]) + " / " + 
descKeyCode(kbLayout["tool-width+"]) + " / " + 
descKeyCode(kbLayout["tool-width.10"]) + "—" + descKeyCode(kbLayout["tool-width.9"]) + " — изменение толщины.\n\
Если зажать Ctrl или Shift, будет происхотить изменение прозрачности или тени соответственно.\n\
Остальные хоткеи можно подсмотреть, прочитав всплывающие подсказки к соответствующим кнопкам.\n\
Курсор обязательно должен находиться над холстом!\n\n\
В поле код можно вводить цвета в трёх видах: «#xxxxxx», «#xxx», «d,d,d», где x  — любая шестнадцатиречная цифра (0—f), d — десятеричное число в диапазоне от 0 до 255. Всё это в формате RGB.\n\n\
Feijoa Sketch " + infoVersion + " by Genius,  " + infoDate);
}
