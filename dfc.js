var dfc = new function() {

var	NS = 'dfc' //* <- namespace prefix; BTW, tabs align to 8 spaces
,	INFO_VERSION = 'v0.7.4'
,	INFO_DATE = '2013-04-01 .. 2013-06-11'
,	INFO_ABBR = 'Dumb Flat Canvas, github.com/f2d/dfc/'

,	self = this
,	LS = window.localStorage || localStorage
,	CANVAS_WIDTH = 640, CANVAS_HEIGHT = 360, DRAW_PIXEL_OFFSET = 0.5
,	container, canvas, c2d, canvasShape, cSh, selectShape, selectPalette, debugText, lang, outside = {}
,	timerStart, fpsInterval, fps = 0, ticks = 0, timer = 0

,	xInside = -1, yInside = -1, xInDraw, yInDraw, xInPrev, yInPrev, drawLineStarted, drawLineBack, drawShapePreview
,	TOOLS_REF = [
		{blur: 0, opacity: 1.00, width:  1, color: '0, 0, 0'}	//* <- draw
	,	{blur: 0, opacity: 1.00, width: 20, color: '255, 255, 255'}	//* <- back
	], tools = [{}, {}], tool = tools[0], BOW = ['blur', 'opacity', 'width'], BOWL = 'BOW'
,	RANGE = [
		{min: 0   , max: 100, step: 1}
	,	{min: 0.01, max: 1  , step: 0.01}
	,	{min: 1   , max: 100, step: 1}
	]

,	drawingActive = false, flushCursor = false, neverFlushCursor = true, cueAutoSave = false
,	mode = {debug:	false
	,	shape:	false
	,	curve:	false
	,	lowQ:	false
	,	brushView:	false
	,	limitFPS:	false
	,	autoSave:	true
	}, modes = [], modeL = 'DLUQVFA', shapes = ['line', 'rectangle', 'circle']

,	history = new Array(32)
,	historyPosition = 0, historyPosLast = 0
,	drawTimeStart = 0, drawTimeLast = 0, drawTimeRepaint = 0

,	regHex = /^#[0-9a-fA-F]{6}$/i
,	regHex3 = /^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/i
,	reg255 = /^([0-9]{1,3}),\s*([0-9]{1,3}),\s*([0-9]{1,3})$/
,	reg255split = /,\s*/
,	regTipBrackets = /[ ]*\([^)]+\)$/
,	regFuncBrackets = /\([^)]*\)[; ]*$/

//* '\t' = title, '\n' = line break + optional title, '#f00' = hex color field, anything else = title + plaintext spacer
,	PALETTE_COL_COUNT = 16	//* <- used if no '\n' found
,	palette = {
'auto' : [	'#fff'   , '#ddd'   , '#aaa'   , '#888'   , '#555'   , '#222'   , '#000', '#a00', '#740', '#470', '#0a0', '#074', '#047', '#00a', '#407', '#704'
	, '\n',	'#7f0000', '#007f00', '#00007f', '#ff007f', '#7fff00', '#007fff', '#333', '#e11', '#b81', '#8b1', '#1e1', '#1b8', '#18b', '#11e', '#81b', '#b18'
	, '\n',	'#ff0000', '#00ff00', '#0000ff', '#ff7f00', '#00ff7f', '#7f00ff', '#666', '#f77', '#db7', '#bd7', '#7f7', '#7db', '#7bd', '#77f', '#b7d', '#d7b'
	, '\n',	'#ff7f7f', '#7fff7f', '#7f7fff', '#ffff00', '#00ffff', '#ff00ff', '#999', '#faa', '#eca', '#cea', '#afa', '#aec', '#ace', '#aaf', '#cae', '#eac'
	, '\n',	'#ffbebe', '#beffbe', '#bebeff', '#ffff7f', '#7fffff', '#ff7fff', '#ccc', '#fcc', '#fdc', '#dfc', '#cfc', '#cfd', '#cdf', '#ccf', '#dcf', '#fcd']
, 'legacy' : ['\tWin7'
	,	'#000000', '#7f7f7f', '#880015', '#ed1c24', '#ff7f27', '#fff200', '#22b14c', '#00a2e8', '#3f48cc', '#a349a4'
	, '\n',	'#ffffff', '#c3c3c3', '#b97a57', '#ffaec9', '#ffc90e', '#efe4b0', '#b5e61d', '#99d9ea', '#7092be', '#c8bfe7'
	, '\nClassic', '#000000', '#000080', '#008000', '#008080', '#800000', '#800080', '#808000', '#c0c0c0', '\tCGA', '#000', '#00a', '#0a0', '#0aa', '#a00', '#a0a', '#aa0', '#aaa'
	, '\nClassic', '#808080', '#0000ff', '#00ff00', '#00ffff', '#ff0000', '#ff00ff', '#ffff00', '#ffffff', '\tCGA', '#555', '#55f', '#5f5', '#5ff', '#f55', '#f5f', '#ff5', '#fff'
	, '\nGrayScale'
	,	'#fff', '#eee', '#ddd', '#ccc', '#bbb', '#aaa', '#999', '#888'
	,	'#777', '#666', '#555', '#444', '#333', '#222', '#111', '#000'
	, '\nPaint.NET'
	,	'#000000', '#404040', '#ff0000', '#ff6a00', '#ffd800', '#b6ff00', '#4cff00', '#00ff21'
	,	'#00ff90', '#00ffff', '#0094ff', '#0026ff', '#4800ff', '#b200ff', '#ff00dc', '#ff006e'
	, '\n',	'#ffffff', '#808080', '#7f0000', '#7f3300', '#7f6a00', '#5b7f00', '#267f00', '#007f0e'
	,	'#007f46', '#007f7f', '#004a7f', '#00137f', '#21007f', '#57007f', '#7f006e', '#7f0037'
	, '\n',	'#a0a0a0', '#303030', '#ff7f7f', '#ffb27f', '#ffe97f', '#daff7f', '#a5ff7f', '#7fff8e'
	,	'#7fffc5', '#7fffff', '#7fc9ff', '#3f647f', '#a17fff', '#d67fff', '#ff7fed', '#ff7fb6'
	, '\n',	'#c0c0c0', '#606060', '#7f3f3f', '#7f593f', '#7f743f', '#6d7f3f', '#527f3f', '#3f7f47'
	,	'#3f7f62', '#3f7f7f', '#3f647f', '#3f497f', '#503f7f', '#6b3f7f', '#7f3f76', '#7f3f5b'
	, '\nApple II', '#000000', '#7e3952', '#524689', '#df4ef2', '#1e6952', '#919191', '#35a6f2', '#c9bff9', '\tMSX', '#000000', '#000000', '#3eb849', '#74d07d', '#5955e0', '#8076f1', '#b95e51', '#65dbef'
	, '\nApple II', '#525d0d', '#df7a19', '#919191', '#efb5c9', '#35cc19', '#c9d297', '#a2dcc9', '#ffffff', '\tMSX', '#db6559', '#ff897d', '#ccc35e', '#ded087', '#3aa241', '#b766b5', '#cccccc', '#ffffff'
	, '\nIBM PC/XT CGA', '#000000', '#0000b6', '#00b600', '#00b6b6', '#b60000', '#b600b6', '#b66700', '#b6b6b6', '\tC-64', '#000000', '#ffffff', '#984a43', '#79c1c7', '#9b51a5', '#67ae5b', '#52429d', '#c9d683'
	, '\nIBM PC/XT CGA', '#676767', '#6767ff', '#67ff67', '#67ffff', '#ff6767', '#ff67ff', '#ffff67', '#ffffff', '\tC-64', '#9b6639', '#695400', '#c37b74', '#626262', '#898989', '#a3e599', '#897bcd', '#adadad'
	, '\nZX Spectrum', '#000000', '#0000ca', '#ca0000', '#ca00ca', '#00ca00', '#00caca', '#caca00', '#cacaca', '\tVIC-20', '#000000', '#ffffff', '#782922', '#87d6dd', '#aa5fb6', '#55a049', '#40318d', '#bfce72'
	, '\nZX Spectrum', '#000000', '#0000ff', '#ff0000', '#ff00ff', '#00ff00', '#00ffff', '#ffff00', '#ffffff', '\tVIC-20', '#aa7449', '#eab489', '#b86962', '#c7ffff', '#ea9ff6', '#94e089', '#8071cc', '#ffffb2']
, 'Touhou' : ['all'	, '#000000', '#ffffff', '#fcefe2'
	, '\n', 'Reimu'	, '#fa5946', '#e5ff41', '', '', ''
	,	'Marisa', '#fff87d', '#a864a8'
	, '\n', 'Cirno'	, '#1760f3', '#97ddfd', '#fd3727', '#00d4ae', ''
	,	'Alice'	, '#8787f7', '#fafab0', '#fabad2', '#f2dcc6', '#888888'
	, '\n', 'Sakuya', '#59428b', '#bcbccc', '#fe3030', '#00c2c6', '#585456'
	,	'Remilia','#cf052f', '#cbc9fd', '#f22c42', '#f2dcc6', '#464646'
	, '\n', 'Chen'	, '#fa5946', '#6b473b', '#339886', '#464646', '#ffdb4f'
	,	'Ran'	, '#393c90', '#ffff6e', '#c096c0'
	, '\n', 'Yukari', '#c096c0', '#ffff6e', '#fa0000', '#464646', ''
	,	'Reisen', '#dcc3ff', '#2e228c', '#e94b6d'
	, '\n', 'etc'
	]
//, 'Web 216' : []
, 'history' : (!!LS && !!LS.historyPalette) ? JSON.parse(LS.historyPalette) : []
},	currentPalette = (!!LS && !!LS.lastPalette) ? LS.lastPalette : 'auto';




function replaceAll(t,s,j) {return t.split(s).join(j);}
function replaceAdd(t,s,a) {return replaceAll(t,s,s+a);}
function setId(e,id) {return e.id = NS+'-'+id;}
function setClass(e,c) {return e.className = NS+'-'+c;}
function setEvent(e,onWhat,func) {return e.setAttribute(onWhat, NS+'.'+func);}
function setContent(e,cont) {
var	a = [' class="',' id="',' onChange="',' onClick="'], aTo = '--..';
	for (i in a) cont = replaceAdd(cont, a[i], NS+aTo[i]);
	return e.innerHTML = cont;
}
function dge(id) {return document.getElementById(NS+(id?'-'+id:''));}
function toggle_display(e) {e = dge(e); return e.style.display = (e.style.display?'':'none');}
function showInfo() {toggle_display('colors'); setClass(dge('buttonH'), toggle_display('info') ? 'button' : 'button-active');}
function fpsCount() {fps = ticks; ticks = 0;}
function canvasRedraw() {c2d.putImageData(history[historyPosition], 0, 0);}



function updatePalette() {
	currentPalette = selectPalette.value;
	if (!!LS) LS.lastPalette = currentPalette; //* ie-ie

var	colorDesc = '', colCount = 0, autoRows = true
,	tbl = document.createElement('table'), tr, td, tfill
,	cup = palette[currentPalette], c
,	p = dge('palette');
	while (p.childNodes.length) p.removeChild(p.childNodes[0]);

	for (i in cup) if (cup[i][0] == '\n') {autoRows = false; break;}
	for (i in cup) {
		c = cup[i];
		if (c[0] == '\n' || !colCount) {
			colCount = PALETTE_COL_COUNT;
			if (tr) tbl.appendChild(tr);
			tr = document.createElement('tr');
		}
		if (c[0] == '\t') colorDesc = c.slice(1); else		//* <- title, no text field
		if (c[0] == '\n') {
			if (c.length > 1) colorDesc = c.slice(1);	//* <- new line, title optional
		} else {
			td = document.createElement('td');
			if (c.length > 1 && c[0] == '#') {
			var	v = (c.length < 5 ? (
					parseInt(c[1], 16)+
					parseInt(c[2], 16)+
					parseInt(c[3], 16))*16 : (
					parseInt(c.substr(1,2), 16)+
					parseInt(c.substr(3,2), 16)+
					parseInt(c.substr(5,2), 16)));
				setClass(tfill = document.createElement('div'), v > 380 ? 'palettine' : 'paletdark');
				setEvent(tfill, 'onclick', 'updateColor("'+c+'",0);');
				setEvent(tfill, 'oncontextmenu', 'updateColor("'+c+'",1); return false;');
				tfill.title = c+(colorDesc?(' ('+colorDesc+')'):'');
				td.style.background = c;
				td.appendChild(tfill);			//* <- color field
			} else if (c) {
				td.textContent = colorDesc = c;		//* <- title + text field
				td.style.paddingLeft = td.style.paddingRight = '2px';
			}
			tr.appendChild(td);				//* <- otherwise - empty spacer
			if (autoRows) --colCount;
		}
	}
	tbl.appendChild(tr);
	p.appendChild(tbl);
}

function updatePosition(event, draw) {
	xInDraw = DRAW_PIXEL_OFFSET + (xInside = event.pageX - canvas.offsetLeft);
	yInDraw = DRAW_PIXEL_OFFSET + (yInside = event.pageY - canvas.offsetTop);
}

function drawCursor() {
	c2d.beginPath();
	c2d.lineWidth = 1;
	if (mode.brushView) {
		c2d.fillStyle = 'rgba('+tool.color+', '+tool.opacity+')';
		c2d.shadowColor = ((c2d.shadowBlur = tool.blur) ? 'rgb('+tool.color+')' : 'transparent');
	} else {
		c2d.strokeStyle = 'rgb(123,123,123)';
		c2d.shadowColor = 'transparent';
		c2d.shadowBlur = 0;
	}
	c2d.arc(xInDraw, yInDraw, tool.width/2, 0, 7/*Math.PI*2*/, false);
	c2d.closePath();
	mode.brushView ? c2d.fill() : c2d.stroke();
	if (!neverFlushCursor) flushCursor = true;
}

function drawStart(event) {
	updatePosition(event, 1);
	canvas.focus();
	event.preventDefault();
	switch (event.which) {
		case 2: pickColor(); break;
		case 1: case 3:
		event.stopPropagation();
		event.cancelBubble = drawingActive = true;
		if (!drawTimeStart) drawTimeStart = drawTimeLast = +new Date();
		xInPrev = xInDraw;
		yInPrev = yInDraw;
		drawLineStarted = drawLineBack = drawShapePreview = false;
	var	t = tools[(event.which == 1) ? 0 : 1];
	//	canvasRedraw();
		cSh.lineWidth =
		c2d.lineWidth = t.width;
		cSh.lineCap = cSh.lineJoin =
		c2d.lineCap = c2d.lineJoin = 'round';
		cSh.shadowColor =
		c2d.shadowColor = ((
			cSh.shadowBlur =
			c2d.shadowBlur = t.blur
		) ? 'rgb('+t.color+')' : 'transparent');
		cSh.strokeStyle =
		c2d.strokeStyle = 'rgba('+t.color+', '+t.opacity+')';
		c2d.beginPath();
		c2d.moveTo(xInDraw, yInDraw);
	}
}

function drawMove(event) {
var	redraw = true, newLine = (drawingActive && !mode.shape);
	updatePosition(event, drawingActive);
	if (newLine) {
		if (drawShapePreview) {
			drawShape(c2d, selectShape.value);
		} else
		if (drawLineBack = mode.curve) {
			if (drawLineStarted) c2d.quadraticCurveTo(xInPrev, yInPrev, (xInDraw + xInPrev)/2, (yInDraw + yInPrev)/2);
		} else c2d.lineTo(xInDraw, yInDraw);
		drawShapePreview = false;
		drawLineStarted = true;
	} else if (drawLineBack) {
		c2d.lineTo(xInPrev, yInPrev);
		drawLineBack = false;
		drawLineStarted = true;
	}
	if (mode.limitFPS) {
	var	t = +new Date();
		if (t-drawTimeRepaint > 30) drawTimeRepaint = t; else redraw = false;	//* <- put >1000/N to redraw maximum N FPS
	}
	if (redraw) {
		if ((flushCursor || neverFlushCursor) && !(mode.lowQ && drawingActive)) canvasRedraw();
		if (drawingActive) {
			if (mode.shape) {
				drawShapePreview = true;
				cSh.clearRect(0, 0, canvas.width, canvas.height);
				cSh.beginPath();
				drawShape(cSh, selectShape.value);
				cSh.stroke();
		//		cSh.closePath();
				c2d.drawImage(cSh.canvas, 0, 0);			//* <- draw 2nd canvas overlay with sole shape
			}
			if (drawLineStarted) c2d.stroke();
		} else if (neverFlushCursor && !mode.lowQ && isMouseIn()) drawCursor();
		updateDebugScreen();
	}
	if (newLine) {
		xInPrev = xInDraw;
		yInPrev = yInDraw;
	}
}

function drawEnd(event) {
	if (drawingActive) {
		drawTimeLast = +new Date();
		canvasRedraw();
		if (mode.shape && drawShapePreview) {
			drawShape(c2d, selectShape.value);
		} else if (mode.shape || drawLineBack || !drawLineStarted) {
			c2d.lineTo(xInDraw, yInDraw - 0.01);				//* <- draw 1 pixel on short click, regardless of mode or browser
		}
		c2d.stroke();
	//	c2d.closePath();
		historyAct();
		cueAutoSave = true;
		drawingActive = false;
	}
	updateDebugScreen();
}

function drawShape(ctx, s) {
	switch (parseInt(s)) {
	//	case 1:	ctx.strokeRect(xInPrev, yInPrev, xInDraw-xInPrev, yInDraw-yInPrev);	//* <- somehow, fail
		case 1:	ctx.moveTo(xInDraw, yInDraw);	//* rect
			ctx.lineTo(xInPrev, yInDraw);
			ctx.lineTo(xInPrev, yInPrev);
			ctx.lineTo(xInDraw, yInPrev);
			ctx.lineTo(xInDraw, yInDraw);
			break;
		case 2:
		var	xCenter = (xInPrev+xInDraw)/2	//* circle
		,	yCenter = (yInPrev+yInDraw)/2
		,	radius = Math.sqrt(Math.pow(xInDraw-xCenter, 2) + Math.pow(yInDraw-yCenter, 2));
			ctx.moveTo(xCenter+radius, yCenter);
			ctx.arc(xCenter, yCenter, radius, 0, 7, false);
			ctx.moveTo(xInDraw, yInDraw);
			break;
		default:ctx.moveTo(xInPrev, yInPrev);	//* line
			ctx.lineTo(xInDraw, yInDraw);
	}
}

function pickColor(keep) {
var	p = history[historyPosition]
,	i = (xInside + yInside*canvas.width)*4
,	hex = (p.data[i]*65536 + p.data[i+1]*256 + p.data[i+2]).toString(16);
	while (hex.length < 6) hex = '0'+hex; hex = '#'+hex;
	return keep ? hex : updateColor(hex);
}

function updateDebugScreen() {
	if (!mode.debug) return;
	ticks ++;
	debugText.innerHTML =
'<table>	<tr><td>'+drawTimeRepaint+'</td><td>1st='+drawTimeStart+'</td><td>last='+drawTimeLast+'</td><td>fps='+fps+
'</td></tr>	<tr><td>Relative</td><td>x='+xInside+'</td><td>y='+yInside+(isMouseIn()?'</td><td>rgb='+pickColor(1):'')+
'</td></tr>	<tr><td>DrawOfst</td><td>x='+xInDraw+'</td><td>y='+yInDraw+
'</td></tr>	<tr><td>Previous</td><td>x='+xInPrev+'</td><td>y='+yInPrev+
'</td></tr></table>';
}

function fillScreen(t) {
	if (t < 0) {
	var	buffer = history[historyPosition], i = buffer.data.length;
		while (i--) if (i%4 != 3) buffer.data[i] = 255 - buffer.data[i];
		c2d.putImageData(buffer, 0, 0);
	} else {
		c2d.fillStyle = 'rgb(' + tools[t].color + ')';
		c2d.fillRect(0, 0, canvas.width, canvas.height);
		cueAutoSave = false;
	}
	historyAct();
}

function updateSlider(i) {
var	s = dge('range'+BOWL[i])
,	t = dge('text'+BOWL[i]) || s
,	r = RANGE[i], v = tool[i = BOW[i]];
	if (v < r.min) tool[i] = v = r.min; else
	if (v > r.max) tool[i] = v = r.max;
	if (r.step < 1) v = parseFloat(v).toFixed(2);
	s.value = t.value = v;
}

function updateSliders(s) {
	if (s && s.id) {
	var	prop = s.id[s.id.length-1];
		for (i in BOW) if (prop == BOWL[i]) {
			tool[BOW[i]] = parseFloat(s.value);
			return updateSlider(i);
		}
	} else {
		if (s) updateSlider(s); else
		for (i in BOW) updateSlider(i);
		drawEnd();
		s = tool.width+4;
		c2d.putImageData(history[historyPosition], 0, 0, xInside - s/2, yInside - s/2, s, s);
		drawCursor();
	}
}

function toolTweak(prop, value) {
	for (i in BOW) if (prop == BOWL[i]) {
	var	b = BOW[i];
		if (value > 0) tool[b] = value;
		else {
		var	v = new Number(tool[b]), s = RANGE[i].step;
			tool[b] = (value ? v-s : v+s);
		}
		return updateSliders(i);
	}
}

function toolSwap(back) {
	if (back == 3) {
		for (t in TOOLS_REF)
		for (i in TOOLS_REF[t]) tools[t][i] = TOOLS_REF[t][i];
		tool.width = 4; //* <- arbitrary default
	} else
	if (back) {
		back = TOOLS_REF[back-1];
		for (i in back) tool[i] = back[i];
	} else {
		back = tools[0];
		tool = tools[0] = tools[1];
		tools[1] = back;
	}
	updateColor(tool.color);
	updateColor(0,1);
	updateSliders();
}

function updateColor(value, toolIndex) {
var	t = tools[toolIndex || 0]
,	c = dge('color-text')
,	v = value || c.value;
	if (reg255.test(v)) {
	var	a = (t.color = v).split(reg255split);
		v = '#';
		for (i in a) v += ((a[i] = parseInt(a[i]).toString(16)).length == 1) ? '0'+a[i] : a[i];
	} else {
		if (regHex3.test(v)) v = v.replace(regHex3, '#$1$1$2$2$3$3');
		if (!regHex.test(v)) return;
		if (value != '') t.color =
			parseInt(v.substr(1,2), 16)+', '+
			parseInt(v.substr(3,2), 16)+', '+
			parseInt(v.substr(5,2), 16);
	}
	if (t == tool) c.value = v;

//* put on top of history palette:
var	p = palette['history'], found = p.length, i;
	for (i = 0; i < found; i++) if (p[i] == v) found = i;
	if (found) {
		i = Math.min(found+1, PALETTE_COL_COUNT*9);		//* <- history length limit
		while (i--) p[i] = p[i-1];
		p[0] = v;
		if (currentPalette == 'history') updatePalette();
		if (!!LS) LS.historyPalette = JSON.stringify(p);
	}

//* update buttons:
	c = 0;
var	a = t.color.split(reg255split), e = dge((t == tool) ? 'colorF' : 'colorB');
	for (i in a) c += parseInt(a[i]);
	e.style.color = (c > 380 ? '#000' : '#fff');			//* <- inverted font color
	e.style.background = 'rgb(' + t.color + ')';
	return v;
}

function historyAct(i) {
//* 0: Write: Refresh
//* 1: Read: Back
//* 2: Read: Forward
var	hl = history.length - 1;
	if (i) {
		if (i == 1 && historyPosition > 0) {
			historyPosition --;
		} else
		if (i == 2 && historyPosition < hl && historyPosition < historyPosLast) {
			historyPosition ++;
		} else return;
		canvasRedraw();
		cueAutoSave = true;
	} else {
		if (historyPosition < hl) {
			historyPosLast = ++ historyPosition;
		} else for (i = 0; i < hl; i++) history[i] = history[i+1];
		history[historyPosition] = c2d.getImageData(0, 0, canvas.width, canvas.height);
	}
	updateDebugScreen();
	updateButtons();
}

function updateButtons() {
var	e = dge('buttonSJ'); e.title = e.title.replace(regTipBrackets, '') +' ('+ (canvas.toDataURL('image/jpeg').length / 1300).toFixed(0) + ' KB)';
	e = dge('buttonSP'); e.title = e.title.replace(regTipBrackets, '') +' ('+ (canvas.toDataURL(		).length / 1300).toFixed(0) + ' KB)';

	setClass(dge('buttonR'), historyPosition == historyPosLast	? 'button-disabled' : 'button');
	setClass(dge('buttonU'), historyPosition == 0			? 'button-disabled' : 'button');
}

function toggleMode(i, keep) {
	if (i >= 0 && i < modes.length) {
	var	n = modes[i], v = mode[n];
		if (!keep) v = mode[n] = !v;
		if (e = dge('check'+modeL[i])) setClass(e, v ? 'button-active' : 'button');
		if (n == 'debug') {
			debugText.textContent = '';
			fpsInterval ? clearInterval(fpsInterval) : (fpsInterval = setInterval(fpsCount, 1000));
		}
	} else alert(lang.bad_id);

}

function unixDateToHMS(t,u) {
	t = (t ? new Date(t+(t > 0 ? 0 : new Date())) : new Date());
	t = (u	? [t.getUTCHours(), t.getUTCMinutes(), t.getUTCSeconds()]
		: [t.getHours(), t.getMinutes(), t.getSeconds()]);
	for (i in t) if (t[i] < 10) t[i] = '0'+t[i];
	return t.join(':');
}

function timeElapsed() {timerText.textContent = unixDateToHMS(timer += 1000, 1);}
function autoSave() {if (mode.autoSave && cueAutoSave) {sendPic(3,true); cueAutoSave = false;}}

function sendPic(dest, auto) {
var	a = auto || false;
	if (dest > 2 && !LS) {
		 if (!a) alert(lang.no_LS);
	} else {
		canvasRedraw();
		switch (dest) {
		case 0:
			if (!outside.form) alert(lang.no_form); else
			if (confirm(lang.confirm_send)) {
			var	pngData = canvas.toDataURL()
			,	jpgData = canvas.toDataURL('image/jpeg')
			,	txt = dge('txt')
			,	pic = dge('pic');
				if (!pic) {
					setId(txt = document.createElement('input'), txt.name = 'txt');
					setId(pic = document.createElement('input'), pic.name = 'pic');
					pic.type = txt.type = 'hidden';
					outside.form.appendChild(pic);
					outside.form.appendChild(txt);
				}
				pic.value = ((outside.jpg_pref
					&& pngData.length > outside.jpg_pref
					&& pngData.length > jpgData.length
				) ? jpgData : pngData);
				txt.value = drawTimeStart +'-'+ drawTimeLast +','+ NS;
				outside.form.submit();
			}
			break;
		case 1: window.open(canvas.toDataURL(		 ), '_blank'); break;
		case 2: window.open(canvas.toDataURL('image/jpeg'), '_blank'); break;
		case 3:	
		var	d = LS.canvasRecovery, cd = canvas.toDataURL();
			if (d == cd) return a?0:alert(lang.no_change);
		var	t = LS.canvasRecoveryTime, d2 = LS.canvasRecovery2 || 0;
			if (d2 == cd) {
				LS.canvasRecovery = d2;
				LS.canvasRecoveryTime = LS.canvasRecovery2Time;
				LS.canvasRecovery2 = d;
				LS.canvasRecovery2Time = t;
				alert(lang.found_swap);
			} else
			if (a || confirm(lang.confirm_save)) {
				if (LS.canvasRecoveryTime) {
					LS.canvasRecovery2 = d;
					LS.canvasRecovery2Time = t;
				}
				LS.canvasRecovery = cd;
				LS.canvasRecoveryTime = drawTimeStart +'-'+ drawTimeLast;
				dge('saveTime').textContent = unixDateToHMS();
				setClass(dge('buttonL'), 'button');
				cueAutoSave = false;
			}
			break;
		case 4:	
		var	t = LS.canvasRecoveryTime;
			if (!t) return;
		var	d = LS.canvasRecovery, cd = canvas.toDataURL();
			if (d == cd) {
				if ((!(t = LS.canvasRecovery2Time) || ((d = LS.canvasRecovery2) == cd))) return alert(lang.no_change);
		/*		LS.canvasRecovery2 = LS.canvasRecovery;
				LS.canvasRecovery2Time = LS.canvasRecoveryTime;	//* <- swap save slots
				LS.canvasRecovery = d;
				LS.canvasRecoveryTime = t;
		*/	}
			if (confirm(lang.confirm_load)) {
			var	i = dge(t);
				if (!i) {
					setId(i = new Image(),t);
					i.src = d;
				}
				i.onload = function (i,t) {
					c2d.drawImage(i, 0, 0);
					t = t.split('-');
					drawTimeStart = t[0];
					drawTimeLast = t[1];
					dge('saveTime').textContent = unixDateToHMS(+t[1]);
					historyAct();
					cueAutoSave = false;
					if (i.alt) container.removeChild(i);
				} (i,t);
			}
			break;
		default: alert(lang.bad_id);
		}
	}
}

function isMouseIn() {return (xInside >= 0 && yInside >= 0 && xInside < canvas.width && yInside < canvas.height);}
function browserHotKeyPrevent(event) {return isMouseIn() ? (event.returnValue = false) || event.preventDefault() || true : false;}
function hotKeys(event) {
	if (browserHotKeyPrevent(event)) {
		function c(s) {return s.charCodeAt(0);}
		switch (event.keyCode) {
			case c('Z'): historyAct(1);	break;
			case c('X'): historyAct(2);	break;
			case c('C'): pickColor();	break;
			case c('I'): fillScreen(-1);	break;
			case c('F'): fillScreen(0);	break;
			case c('D'): fillScreen(1);	break;
			case c('S'): toolSwap();	break;
			case c('A'): toolSwap(1);	break;
			case c('E'): toolSwap(2);	break;
			case c('R'): toolSwap(3);	break;

			case 8     : toggleMode(0);	break; //* 42=Num *, 8=bksp
			case c('L'): toggleMode(1);	break;
			case c('U'): toggleMode(2);	break;
			case c('G'): toggleMode(3);	break;
			case c('V'): toggleMode(4);	break;
			case 120   : toggleMode(5);	break;

			case 112   : showInfo();	break;
			case c('P'): sendPic(1);	break;
			case c('J'): sendPic(2);	break;
			case 113   : sendPic(3);	break;
			case 115   : sendPic(4);	break;
			case 119   : sendPic(0);	break;

			case c('1'): toolTweak('W',  1);	break;
			case c('2'): toolTweak('W',  2);	break;
			case c('3'): toolTweak('W',  5);	break;
			case c('4'): toolTweak('W', 20);	break;
			case c('5'): toolTweak('W', 50);	break;

			case c('6'): toolTweak('O', 0.1);	break;
			case c('7'): toolTweak('O', 0.3);	break;
			case c('8'): toolTweak('O', 0.5);	break;
			case c('9'): toolTweak('O', 0.7);	break;
			case c('0'): toolTweak('O', 1  );	break;

			case c('Q'): toolTweak('W', -1);	break;
			case c('W'): toolTweak('W');		break;
			case c('T'): toolTweak('O', -1);	break;
			case c('Y'): toolTweak('O');		break;
			case c('N'): toolTweak('B', -1);	break;
			case c('M'): toolTweak('B');		break;

			default: if (mode.debug) debugText.innerHTML += ' k='+event.keyCode;
		}
	}
	return false;
}

function hotWheel(event) {
	if (browserHotKeyPrevent(event)) {
	var	d = event.deltaY || event.detail || event.wheelDelta
	,	b = event.shiftKey?'B':(event.ctrlKey?'O':'W');
		toolTweak(b, d < 0?0:-1);
		if (mode.debug) debugText.innerHTML += ' d='+d;
	}
	return false;
}

this.toggle_display = toggle_display;
this.updateColor   = updateColor;
this.updatePalette = updatePalette;
this.updateSliders = updateSliders;

this.init = function() {
	if (!get_form()) document.title += ': '+NS+' '+INFO_VERSION;
	setContent(container = dge(),
'		<canvas id="canvas" tabindex="0">'+lang.no_canvas+'</canvas>\
		<div id="tools"></div>\
		<div id="buttons"></div>\
		<div id="debug"></div>'
	);
	if (!(canvas = dge('canvas')).getContext) return;

	canvas.setAttribute('onscroll', 'return false;');
	canvas.setAttribute('oncontextmenu', 'return false;');
	canvas.addEventListener('mousedown'	, drawStart, false);
	document.addEventListener('mousemove'	, drawMove, false);	//* <- using 'document' to prevent negative clipping
	document.addEventListener('mouseup'	, drawEnd, false);
	container.addEventListener('keypress'	, browserHotKeyPrevent, false);
	container.addEventListener('keydown'	, hotKeys, false);
	container.addEventListener('mousewheel'	, hotWheel, false);
	container.addEventListener('wheel'	, hotWheel, false);
	container.addEventListener('scroll'	, hotWheel, false);

	canvasShape = document.createElement('canvas');
	canvasShape.width  = canvas.width  = CANVAS_WIDTH;
	canvasShape.height = canvas.height = CANVAS_HEIGHT;

	cSh = canvasShape.getContext('2d');
	c2d = canvas.getContext('2d');
	c2d.fillStyle = 'white';
	c2d.fillRect(0, 0, canvas.width, canvas.height);
	history[0] = c2d.getImageData(0, 0, canvas.width, canvas.height);

var	b = '', e = ': </td><td align="right"', i = BOW.length;
	while (i--) b += '<span id="slider'+BOWL[i]+'"><input type="range" id="range'+BOWL[i]+'" onChange="updateSliders(this)" min="'
+RANGE[i].min+'" max="'
+RANGE[i].max+'" step="'
+RANGE[i].step+'"></span>	'+lang.tool[BOWL[i]]+'<br>\n';
	setContent(dge('tools'),
b+'			<div id="colors"><table width="100%"><tr><td>\
				'+lang.shape	+e+'>	<select id="shape-select"></select>	</td><td>\
				'+lang.time	+e+' onClick="toggle_display(\'timer\')" title="'+lang.show_hide+'">\
								[<span id="timer">00:00:00</span>]</a>	</td></tr><tr><td>\
				'+lang.palette	+e+'>	<select id="palette-select" onChange="updatePalette()"></select>	</td><td>\
				'+lang.hex	+e+'>	<input type="text" value="#000" id="color-text" onChange="updateColor()" title="'+lang.hex_hint+'">	</td></tr></table>\
				<div id="palette"></div>\
			</div>\
			<div id="info">'+lang.info+'</div>'
	);
	debugText = dge('debug');
	timerText = dge('timer');
	toggle_display(e = 'info');
	e = dge(e).lastChild;
	e.innerHTML = '<abbr title="'+INFO_ABBR+'">'+NS.toUpperCase()+'</abbr>'+e.innerHTML+'<abbr title="'+INFO_DATE+'">'+INFO_VERSION+'</abbr>';

var	a = [//* subtitle, hotkey, pictogram, function, id; table used only within next 10 lines of code
	['undo'	,'Z'	,'&#x2190;'	,'historyAct(1)'	,'buttonU'
],	['redo'	,'X'	,'&#x2192;'	,'historyAct(2)'	,'buttonR'
],
0,	['fill'	,'F'	,'&nbsp;'	,'fillScreen(0)'	,'colorF'
],	['swap'	,'S'	,'&#x2194;'	,'toolSwap()'
],	['wipe'	,'D'	,'&nbsp;'	,'fillScreen(1)'	,'colorB'
],	['invert','I'	,'&#x25D0;'	,'fillScreen(-1)'
],
0,	['pencil','A'	,'i'		,'toolSwap(1)'
],	['eraser','E'	,'&#x25CB;'	,'toolSwap(2)'
],	['reset','R'	,'&#x25CE;'	,'toolSwap(3)'
],
0,	['shape','L'	,'&#x25C7;'	,'toggleMode(1)'	,'checkL'
],	['curve','U'	,'&#x2307;'	,'toggleMode(2)'	,'checkU'
],	['cursor','V'	,'&#x25CF;'	,'toggleMode(4)'	,'checkV'
],	['rough','G'	,'&#x25A0;'	,'toggleMode(3)'	,'checkQ'
],	['fps'	,'F9'	,'&#x231A;'	,'toggleMode(5)'	,'checkF'
],
0,	['png'	,'P'	,'P'		,'sendPic(1)'		,'buttonSP'
],	['jpeg'	,'J'	,'J'		,'sendPic(2)'		,'buttonSJ'
],	['save'	,'F2'	,'&#x22C1;'	,'sendPic(3)'
],	['load'	,'F4'	,'&#x22C0;'	,'sendPic(4)'		,'buttonL'
],	['done'	,'F8'	,'&#x21B5;'	,'sendPic(0)'
],
0,	['info'	,'F1'	,'?'		,'showInfo()'		,'buttonH'
]], d = dge('buttons');
	for (i in a) {
		e = document.createElement('span');
		if (b = a[i]) {
			if (b.length > 4) setId(e, b[4]);
			e.title = lang.b[b[0]];
			setContent(e,
'<div class="button-key">'+b[1]+'</div>'+b[2]+
'<div class="button-subtitle"><br>'+b[0]+'</div>');
		var	func = b[3].replace(regFuncBrackets, '');
			if (!self[func]) self[func] = eval(func);
			setEvent(e, 'onclick', b[3]);
			setClass(e, 'button');
		} else	setClass(e, 'button-vertical');
		d.appendChild(e);
		d.innerHTML += '\n';					//* <- need any whitespace for correct visual result
	}
	for (name in mode) if (mode[modes[i = modes.length] = name]) toggleMode(i,1);
	setClass(dge('buttonL'), LS && LS.canvasRecoveryTime ? 'button' : 'button-disabled');

	d = (dge('rangeW').type == 'range');
	for (i in BOW) if (d) {
		e = document.createElement('input');
		setId(e, (e.type = 'text')+BOWL[i]);
		setEvent(e, 'onchange', 'updateSliders(this)');
		dge('slider'+BOWL[i]).appendChild(e);
	} else 	dge('range'+BOWL[i]).type = 'text';

//* safe palette constructor, step recomended to be: 1, 3, 5, 15, 17, 51, 85, 255
function generatePalette(name, step, slice) {
var	letters = [0, 0, 0], p = palette[name], l = p.length;
	if (l) {p[l] = '\t'; p[l+1] = '\n';}
	while (letters[0] <= 255) {
		p[l = p.length] = '#';
		for (var i = 0; i < 3; i++) {
		var	s = letters[i].toString(16);
			if (s.length == 1) s = '0'+s;
			p[l] += s;
		}
		letters[2] += step;
		if (letters[2] > 255) {letters[2] = 0; letters[1] += step;}
		if (letters[1] > 255) {letters[1] = 0; letters[0] += step;}
		if ((letters[1] == 0 || (letters[1] == step * slice)) && letters[2] == 0)
			p[l+1] = '\n';
	}
}
	generatePalette('auto', 85, 0);
//	generatePalette('Web 216', 51, 6);

	e = selectShape = dge('shape-select');
	for (i in shapes) (
		e.options[e.options.length] = new Option(shapes[i], i)
	).selected = !i;
	e = selectPalette = dge('palette-select');
	for (i in palette) (
		e.options[e.options.length] = new Option(i, i)
	).selected = (i == currentPalette);

	toolSwap(3);
	updateDebugScreen();
	updatePalette();
	updateButtons();
	updateSliders();

	setInterval(timeElapsed, 1000);
	setInterval(autoSave, 60000);
}; //* END this.init()

function get_form() {
var	o = outside.form = dge('send'), e;
	if (o && o.name) for (i in (o = o.name.split(';'))) if ((e = o[i].split('=', 2)).length > 1) outside[e[0]] = e[1];

	if (!outside.lang) outside.lang = document.documentElement.lang || 'en';
	if (outside.lang == 'ru') shapes = ['линия', 'прямоугольник', 'круг']
, lang = {
	bad_id:		'Ошибка выбора.'
,	no_LS:		'Локальное Хранилище недоступно.'
,	no_form:	'Назначение недоступно.'
,	no_change:	'Нет изменений.'
,	confirm_send:	'Отправить рисунок в сеть?'
,	confirm_save:	'Сохранить рисунок в Локальное Хранилище?'
,	confirm_load:	'Вернуть рисунок из Локального Хранилища?'
,	found_swap:	'Рисунок был в запасе, поменялись местами.'
,	no_canvas:	'Ваша программа не поддерживает HTML5-полотно.'
, tool: {	B:	'Тень'
	,	O:	'Непрозр.'
	,	W:	'Толщина'
},	shape:		'Форма'
,	time:		'Время'
,	palette:	'Палитра'
,	hex:		'Цвет'
,	hex_hint:	'Формат ввода - #f90, #ff9900, или 0,123,255.'
,	show_hide:	'Кликните, чтобы спрятать или показать.'
,	info:	'\
					<p class="L-open">Управление (указатель над полотном):	</p>\
				<p>	C, средний клик = подобрать цвет с рисунка.\
				<br>	1-5, Q, W, колесо = толщина кисти.\
				<br>	6-0, T, Y, Ctrl+колесо = непрозрачность.\
				<br>	N, M, Shift+колесо = размытие тени.\
				<br>	Автосохранение раз в минуту:	 <span id="saveTime">ещё не было</span>.\
				</p>	<p class="L-close"> - доска для набросков, </p>'
, b: {	undo:	'Отменить последнее действие.'
,	redo:	'Отменить последнюю отмену.'
,	fill:	'Залить полотно основным цветом.'
,	swap:	'Поменять инструменты местами.'
,	wipe:	'Залить полотно запасным цветом.'
,	invert:	'Обратить цвета полотна.'
,	pencil:	'Инструмент - карандаш.'
,	eraser:	'Инструмент - ластик.'
,	reset:	'Сбросить инструменты к начальным.'
,	shape:	'Рисовать геометрические фигуры.'
,	curve:	'Сглаживать углы.'
,	cursor:	'Показывать кисть на указателе.'
,	rough:	'Использовать меньше ЦП, пропуская перерисовку штриха.'
,	fps:	'Использовать меньше ЦП, пропуская кадры.'
,	png:	'Сохранить рисунок в PNG файл.'
,	jpeg:	'Сохранить рисунок в JPEG файл.'
,	save:	'Сохранить рисунок в Локальное Хранилище. Хранятся 2 последние позиции подряд.'
,	load:	'Вернуть рисунок из Локального Хранилища. Хранятся 2 последние позиции подряд. \n\
Может не сработать в некоторых браузерах, если не настроить автоматическую загрузку и показ изображений.'
,	done:	'Завершить и отправить рисунок в сеть.'
,	info:	'Показать или скрыть информацию.'
}};
else lang = {
	bad_id:		'Invalid case.'
,	no_LS:		'Local Storage not supported.'
,	no_form:	'Destination unavailable.'
,	no_change:	'Nothing changed.'
,	confirm_send:	'Send image to server?'
,	confirm_save:	'Save image to your Local Storage?'
,	confirm_load:	'Restore image from your Local Storage?'
,	found_swap:	'Found image at 2nd save slot, swapped the slots.'
,	no_canvas:	'Your browser does not support HTML5 canvas.'
, tool: {	B:	'Shadow'
	,	O:	'Opacity'
	,	W:	'Width'
},	shape:		'Shape'
,	time:		'Time'
,	palette:	'Palette'
,	hex:		'Hex'
,	hex_hint:	'Valid formats - #f90, #ff9900, or 0,123,255.'
,	show_hide:	'Click to show/hide.'
,	info:	'\
					<p class="L-open">Hot keys (mouse over image only):	</p>\
				<p>	C, Mouse Mid = pick color from image.\
				<br>	1-5, Q, W, Mouse Wheel = brush width.\
				<br>	6-0, T, Y, Ctrl+Wheel = brush opacity.\
				<br>	N, M, Shift+Wheel = brush shadow blur.\
				<br>	Autosave every minute, last saved:	 <span id="saveTime">not yet</span>.\
				</p>	<p class="L-close"> sketch pad </p>'
, b: {	undo:	'Revert last change.'
,	redo:	'Redo next reverted change.'
,	fill:	'Fill image with main color.'
,	swap:	'Swap your tools.'
,	wipe:	'Fill image with back color.'
,	invert:	'Invert image colors.'
,	pencil:	'Set tool to sharp black.'
,	eraser:	'Set tool to large white.'
,	reset:	'Reset both tools.'
,	shape:	'Draw strict geometric shape.'
,	curve:	'Line corner smoothing.'
,	cursor:	'Brush preview on cursor.'
,	rough:	'Skip draw cleanup while drawing to use less CPU.'
,	fps:	'Limit FPS when drawing to use less CPU.'
,	png:	'Save image as PNG file.'
,	jpeg:	'Save image as JPEG file.'
,	save:	'Save image copy to your Local Storage. Two slots available in a queue.'
,	load:	'Load image copy from your Local Storage. Two slots available in a queue. \n\
May not work in some browsers until set to load and show new images automatically.'
,	done:	'Finish and send image to server.'
,	info:	'Show/hide information.'
}};
	return o;
}

document.addEventListener('DOMContentLoaded', this.init, false);
document.write(replaceAll('<style>\
#| {padding: 8px; font-family: "Trebuchet MS"; font-size: 14pt; background-color: #f8f8f8; text-align: center;}\
#| canvas {margin: 0; /*-webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; -o-user-select: none; user-select: none;*/}\
#| input, #| select {font-family: "Trebuchet MS"; font-size: 14pt; margin: 1px;}\
#| input[type="text"] {width: 48px;}\
#| select, #| #|-color-text {width: 80px;}\
#| select {margin-right: 4px;}\
#|-buttons {height: 40px; padding: 8px;}\
#|-info p {padding-left: 32px; line-height: 24px; margin-bottom: 0;}\
#|-info, #|-colors {text-align: left; margin-top: 15px; margin-left: 5px;}\
#|-info, #|-palette {font-size: small;}\
#|-colors table tr td {padding: 0; margin: 0;}\
#|-colors table {border-collapse: collapse;}\
#|-palette {overflow-y: scroll; height: 171px; margin-top: 9px;}\
#|-tools {width: 326px; margin: 0; text-align: left; display: inline-block; vertical-align: top; overflow-x: hidden;}\
.|-L-close {padding-bottom: 24px; border-bottom: 1px solid #000; border-right: 1px solid #000;}\
.|-L-open {padding-top: 24px; border-top: 1px solid #000; border-left: 1px solid #000;}\
.|-button {background-color: #ddd;}\
.|-button, .|-button-active, .|-button-disabled {border: 1px solid #000; cursor: pointer; display: inline-block; width: 32px; height: 32px; padding: 2px; text-align: center; font-family: "Arial Unicode MS"; line-height: 7px;}\
.|-button-active {background-color: #ace;}\
.|-button-active:hover {background-color: #bef;}\
.|-button-disabled {color: gray; cursor: default;}\
.|-button-key, #|-debug {text-align: left;}\
.|-button-key, .|-button-subtitle {vertical-align: top; width: 32px; height: 10px; font-size: 9px; margin: 0; padding: 0;}\
.|-button-vertical {display: inline-block; vertical-align: top; width: 0; height: 32px; padding-bottom: 6px; margin-left: 4px; margin-right: 4px; border-left: 1px solid #000;}\
.|-button:hover {background-color: #eee;}\
.|-paletdark, .|-palettine {border: 2px solid transparent; height: 15px; width: 15px; cursor: pointer;}\
.|-paletdark:hover {border-color: #fff;}\
.|-palettine:hover {border-color: #000;}\
.|-palettine-tool {width: 32px; height: 32px; margin: 1px; border: 1px solid #000; display: inline-block; vertical-align: middle;}\
</style>', '|', NS)+'<div id="'+NS+'">Loading '+NS+'...</div>');

};