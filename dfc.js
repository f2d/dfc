var dfc = new function() {

var	NS = 'dfc' //* <- namespace prefix; BTW, tabs align to 8 spaces
,	INFO_VERSION = 'v0.6.2'
,	INFO_DATE = '2013-04-01 .. 2013-05-22, forked from Feijoa v1.4.6'

,	self = this
,	LS = window.localStorage
,	CANVAS_WIDTH = 640, CANVAS_HEIGHT = 360, DRAW_PIXEL_OFFSET = 0.5
,	container, canvas, c2d, canvasLine, cLn, selectShape, selectPalette, sendForm, debugText, fpsInterval, fps = 0, ticks = 0

,	xInside = -1, yInside = -1, xInDraw, yInDraw, xInPrev, yInPrev, drawLineStarted, drawLineBack, drawShapePreview
,	TOOLS_REF = [
		{'blur' : 0, 'opacity' : 1.00, 'width' :  1, 'color' : '0, 0, 0'}	//* <- draw
	,	{'blur' : 0, 'opacity' : 1.00, 'width' : 20, 'color' : '255, 255, 255'}	//* <- back
	], tools = [{}, {}], tool = tools[0], BOW = ['blur', 'opacity', 'width'], BOWL = 'BOW'

,	drawingActive = false, flushCursor = false, neverFlushCursor = true, cueAutoSave = false
,	mode = {'debug' :	false
	,	'shape' :	false
	,	'curve' :	false
	,	'lowQ' :	false
	,	'brushView' :	false
	,	'limitFPS' :	true
	,	'autoSave' :	true
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
, 'Web 216' : []
, 'history' : (!!LS && !!LS.historyPalette) ? JSON.parse(LS.historyPalette) : []
},	currentPalette = (!!LS && !!LS.lastPalette) ? LS.lastPalette : 'auto';




function replaceAll(t,s,j) {return t.split(s).join(j);}
function replaceAdd(t,s,a) {return replaceAll(t,s,s+a);}
function setId(e,id) {return e.id = NS+'-'+id;}
function setClass(e,c) {return e.className = NS+'-'+c;}
function setEvent(e,onWhat,func) {return e.setAttribute(onWhat, NS+'.'+func);}
function setContent(e,cont) {return e.innerHTML = replaceAdd(replaceAdd(replaceAdd(cont
,' class="'	, NS+'-')
,' id="'	, NS+'-')
,' onChange="'	, NS+'.');}
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
	xInside = event.pageX - canvas.offsetLeft;
	yInside = event.pageY - canvas.offsetTop;
	if (draw) {
		xInDraw = DRAW_PIXEL_OFFSET + xInside;
		yInDraw = DRAW_PIXEL_OFFSET + yInside;
	}
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
	c2d.arc(xInside, yInside, tool.width/2, 0, 7/*Math.PI*2*/, false);
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
		cLn.lineWidth =
		c2d.lineWidth = t.width;
		cLn.lineCap = cLn.lineJoin =
		c2d.lineCap = c2d.lineJoin = 'round';
		cLn.shadowColor =
		c2d.shadowColor = ((
			cLn.shadowBlur =
			c2d.shadowBlur = t.blur
		) ? 'rgb('+t.color+')' : 'transparent');
		cLn.strokeStyle =
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
				cLn.clearRect(0, 0, canvas.width, canvas.height);
				cLn.beginPath();
				drawShape(cLn, selectShape.value);
				cLn.stroke();
		//		cLn.closePath();
				c2d.drawImage(cLn.canvas, 0, 0);			//* <- draw 2nd canvas overlay with sole shape
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

function updateSliders(s) {
	if (s) {
		s = (s === 2 ? 'text' : 'range');
		for (i in BOW) tool[BOW[i]] = parseFloat(dge(s+BOWL[i]).value);
	}
	for (i in BOW) {
	var	r = dge('range'+BOWL[i])
	,	t = dge('text'+BOWL[i])
	,	b = BOW[i], v = tool[b]
	,	r_min = parseFloat(r.min)
	,	r_max = parseFloat(r.max);
		if (v < r_min) tool[b] = v = r_min; else
		if (v > r_max) tool[b] = v = r_max;
		if (parseFloat(r.step) < 1) v = parseFloat(v).toFixed(2);
		       r.value = v;
		if (t) t.value = v;
	}
	drawEnd();
	if (isMouseIn()) {
		s = tool.width+4;
		c2d.putImageData(history[historyPosition], 0, 0, xInside - s/2, yInside - s/2, s, s);
		drawCursor();
	}
}

function toolTweak(prop, value) {
	for (i in BOW) if (prop == BOWL[i]/* || prop == BOW[i]*/) {
	var	b = BOW[i];
		if (value > 0) tool[b] = value;
		else {
		var	step = new Number(dge('range'+BOWL[i]).step), v = new Number(tool[b]);
			tool[b] = (value ? (v - step) : (v + step));
		}
		return updateSliders();
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
	i = Math.min(found+1, PALETTE_COL_COUNT*9);	//* <- history length limit
	while (i--) p[i] = p[i-1];
	p[0] = v;
	if (currentPalette == 'history') updatePalette();
	if (!!LS) LS.historyPalette = JSON.stringify(p);

//* update buttons:
	c = 0;
var	a = t.color.split(reg255split), e = dge((t == tool) ? 'colorF' : 'colorB');
	for (i in a) c += parseInt(a[i]);
	e.style.color = (c > 380 ? '#000' : '#fff');	//* <- inverted font color
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
	} else alert('Invalid case.');

}

function autoSave() {if (mode.autoSave && cueAutoSave) {sendPic(3,true); cueAutoSave = false;}}


function unixDateToHMS(t) {
	t = (t ? new Date(t) : new Date());
	t = [t.getHours(), t.getMinutes(), t.getSeconds()];
	for (i in t) if (t[i] < 10) t[i] = '0'+t[i];
	return t.join(':');
}

function sendPic(dest, auto) {
var	a = auto || false;
	if (dest > 2 && !LS) {
		 if (!a) alert('Local Storage not supported.');
	} else switch (dest) {
		case 0:
			if (!sendForm) alert('Destination unavailable.'); else
			if (confirm('Send image to server?')) {
			var	pngData = canvas.toDataURL()
			,	jpgData = canvas.toDataURL('image/jpeg')
			,	times = dge('times')
			,	image = dge('pic');
				if (!image) {
					times = document.createElement('input');
					image = document.createElement('input');
					image.type = times.type = 'hidden';
					setId(times, times.name = 'times');
					setId(image, image.name = 'pic');
					sendForm.appendChild(image);
					sendForm.appendChild(times);
				}
				image.value = ((jpgData.length < pngData.length && pngData.length > 50000) ? jpgData : pngData);
				times.value = drawTimeStart +'-'+ drawTimeLast;
				sendForm.submit();
			}
			break;
		case 1: window.open(canvas.toDataURL(		 ), '_blank'); break;
		case 2: window.open(canvas.toDataURL('image/jpeg'), '_blank'); break;
		case 3:	
		var	d = LS.canvasRecovery, cd = canvas.toDataURL();
			if (d == cd) return alert('Nothing changed.');
		var	t = LS.canvasRecoveryTime, d2 = LS.canvasRecovery2 || 0;
			if (d2 == cd) {
				LS.canvasRecovery = d2;
				LS.canvasRecoveryTime = LS.canvasRecovery2Time;	//* <- swap save slots
				LS.canvasRecovery2 = d;
				LS.canvasRecovery2Time = t;
			} else
			if (a || confirm('Save image to your Local Storage?')) {
				canvasRedraw();
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
				if ((!(t = LS.canvasRecovery2Time) || ((d = LS.canvasRecovery2) == cd))) return alert('Nothing changed.');
				LS.canvasRecovery2 = LS.canvasRecovery;
				LS.canvasRecovery2Time = LS.canvasRecoveryTime;	//* <- swap save slots
				LS.canvasRecovery = d;
				LS.canvasRecoveryTime = t;
			}
			if (confirm('Restore image from your Local Storage?')) {
				function canvasRecovery(i,t) {
					c2d.drawImage(i, 0, 0);
					t = t.split('-');
					drawTimeStart = t[0];
					drawTimeLast = t[1];
					dge('saveTime').textContent = unixDateToHMS(+t[1]);
					historyAct();
					cueAutoSave = false;
					if (i.alt) container.removeChild(i);
				}
			var	i = dge(t);
				if (!i) {
					i = new Image();
					i.src = d;
					i.onload = canvasRecovery(i,t);
					setId(i,t);
				}
			/*	if (!i.complete) {
					i.alt =
'If you see this text, try to right-click this image and load manually. If you see the image, try to left-click on it.';
					container.appendChild(i);
					i.onclick = i.onload;
				}*/
			}
			break;
		default: alert('Invalid case.');
	}
}

function isMouseIn() {return (xInside >= 0 && yInside >= 0 && xInside < canvas.width && yInside < canvas.height);}
function browserHotKeyPrevent(event) {return isMouseIn() ? event.preventDefault() || true : false;}
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
			case 119   : toggleMode(5);	break;

			case 112   : showInfo();	break;
			case c('P'): sendPic(1);	break;
			case c('J'): sendPic(2);	break;
			case 113   : sendPic(3);	break;
			case 115   : sendPic(4);	break;
			case 117   : sendPic(0);	break;

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
		if (d > 0) toolTweak(b, -1); else
		if (d < 0) toolTweak(b); else
		if (mode.debug) debugText.innerHTML += ' d='+d;
	}
	return false;
}

this.updateColor   = updateColor;
this.updatePalette = updatePalette;
this.updateSliders = updateSliders;

this.init = function() {
	if (!(sendForm = dge('send'))) document.title += ': '+NS+' '+INFO_VERSION;
	setContent(container = dge(),
'		<canvas id="canvas" tabindex="0">Your browser does not support HTML5 canvas.</canvas>\
		<div id="tools">\
			<span id="sliderW"><input type="range" id="rangeW" onChange="updateSliders(1);" min="1" max="123" step="1"></span>	Width<br>\
			<span id="sliderO"><input type="range" id="rangeO" onChange="updateSliders(1);" min="0.01" max="1" step="0.01"></span>	Opacity<br>\
			<span id="sliderB"><input type="range" id="rangeB" onChange="updateSliders(1);" min="0" max="123" step="1"></span>	Shadow<br>\
			<div id="colors">\
				Shape: <select id="shape-select"></select>\
			<br>	Palette: <select id="palette-select" onChange="updatePalette();"></select>\
				Hex: <input type="text" value="#000" id="color-text" onChange="updateColor();">\
				<div id="palette"></div>\
			</div>\
			<div id="info">\
					<p class="L-open">Hot keys (mouse over image only):</p>\
				<p>	C, Mouse Mid = pick color from image.\
				<br>	1-5, Q, W, Mouse Wheel = brush width.\
				<br>	6-0, T, Y, Ctrl+Wheel = brush opacity.\
				<br>	N, M, Shift+Wheel = brush shadow.\
				<br>	Autosave every minute, last saved: <span id="saveTime">not yet</span>.\
				</p>	<p class="L-close"><abbr title="Dumb Flat Canvas">DFC</abbr> sketch pad <abbr id="version"></abbr></p>\
			</div>\
		</div>\
		<div id="buttons"></div>\
		<div id="debug"></div>'
	);
	toggle_display('info');

var	a = [//* subtitle, hotkey, pictogram, function, tooltip, id	//* used once within next 10 lines of code
	['undo'	,'Z'	,'&#x2190;'	,'historyAct(1)'	,'Revert last change.'		,'buttonU'
],	['redo'	,'X'	,'&#x2192;'	,'historyAct(2)'	,'Redo next reverted change.'	,'buttonR'
],
0,	['fill'	,'F'	,'&nbsp;'	,'fillScreen(0)'	,'Fill image with main color.'	,'colorF'
],	['swap'	,'S'	,'&#x2194;'	,'toolSwap()'		,'Swap your tools.'
],	['wipe'	,'D'	,'&nbsp;'	,'fillScreen(1)'	,'Fill image with back color.'	,'colorB'
],	['invert','I'	,'&#x25D0;'	,'fillScreen(-1)'	,'Invert image colors.'
],
0,	['pencil','A'	,'i'		,'toolSwap(1)'		,'Set tool to sharp black.'
],	['eraser','E'	,'&#x25CB;'	,'toolSwap(2)'		,'Set tool to large white.'
],	['reset','R'	,'&#x25CE;'	,'toolSwap(3)'		,'Reset both tools.'
],
0,	['shape','L'	,'&#x25C7;'	,'toggleMode(1)'	,'Draw strict geometric shape.'	,'checkL'
],	['curve','U'	,'&#x2307;'	,'toggleMode(2)'	,'Quadratic bezier curve for line corner smoothing.'	,'checkU'
],	['rough','G'	,'&#x25A0;'	,'toggleMode(3)'	,'Skip draw cleanup while drawing to use less CPU.'	,'checkQ'
],	['cursor','V'	,'&#x25CF;'	,'toggleMode(4)'	,'Brush preview on cursor.'	,'checkV'
],	['fps','F8'	,'&#x231A;'	,'toggleMode(5)'	,'Limit FPS when drawing to use less CPU.'	,'checkF'
],
0,	['png'	,'P'	,'P'		,'sendPic(1)'		,'Save image as PNG file.'	,'buttonSP'
],	['jpeg'	,'J'	,'J'		,'sendPic(2)'		,'Save image as JPEG file.'	,'buttonSJ'
],	['save'	,'F2'	,'&#x22C1;'	,'sendPic(3)'		,'Save image copy to your Local Storage. Two slots available in a queue.'
],	['load'	,'F4'	,'&#x22C0;'	,'sendPic(4)'		,'Load image copy from your Local Storage. Two slots available in a queue. \n\
May not work in some browsers until set to load and show new images automatically.'		,'buttonL'
],	['done'	,'F6'	,'&#x21B5;'	,'sendPic(0)'		,'Finish your work and send image to server.'
],
0,	['info'	,'F1'	,'?'		,'showInfo()'		,'Show/hide information.'	,'buttonH'
]], d = dge('buttons'), b, e, i;
	for (i in a) {
		e = document.createElement('span');
		if (b = a[i]) {
			if (b.length > 5) setId(e, b[5]);
			e.title = b[4]/*+(b[1]?' ('+b[1]+')':'')*/;
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
	for (name in mode) {
	var	i = modes.length;
		if (mode[modes[i] = name]) toggleMode(i,1);
	}
	setClass(dge('buttonL'), LS.canvasRecoveryTime ? 'button' : 'button-disabled');

	debugText = dge('debug');
	canvas = dge('canvas');
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

	canvasLine = document.createElement('canvas');
	canvasLine.width  = canvas.width  = CANVAS_WIDTH;
	canvasLine.height = canvas.height = CANVAS_HEIGHT;

	cLn = canvasLine.getContext('2d');
	c2d = canvas.getContext('2d');
	c2d.fillStyle = 'white';
	c2d.fillRect(0, 0, canvas.width, canvas.height);
	history[0] = c2d.getImageData(0, 0, canvas.width, canvas.height);

var	e = dge('rangeW'), i = BOWL.length;
	if (e.type == 'range') while (i--) {
		e = document.createElement('input');
		e.type = 'text';
		setId(e, 'text'+BOWL[i]);
		setEvent(e, 'onchange', 'updateSliders(2);');
		dge('slider'+BOWL[i]).appendChild(e);
	} else while (i--) {
		dge('range'+BOWL[i]).type = 'text';
	}

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
	generatePalette('Web 216', 51, 6);

	e = selectShape = dge('shape-select');
	for (i in shapes) (
		e.options[e.options.length] = new Option(shapes[i], i)
	).selected = (i == 0);
	e = selectPalette = dge('palette-select');
	for (i in palette) (
		e.options[e.options.length] = new Option(i, i)
	).selected = (i == currentPalette);

	(e = dge('version')).textContent = INFO_VERSION;
	e.title = INFO_DATE;

	toolSwap(3);
	updateDebugScreen();
	updatePalette();
	updateButtons();
	updateSliders();

	setInterval(autoSave, 60000);
}; //* END this.init()

document.addEventListener('DOMContentLoaded', this.init, false);
document.write('<link rel="stylesheet" href="'+NS+'.css"><div id="'+NS+'">Loading...</div>');

};