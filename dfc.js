var dfc = new function () {

var	NS = 'dfc' //* <- namespace prefix, change here and above; BTW, tabs align to 8 spaces
,	INFO_VERSION = 'v0.9.25'
,	INFO_DATE = '2013-04-01 .. 2013-11-04'
,	INFO_ABBR = 'Dumb Flat Canvas'
,	A0 = 'transparent', IJ = 'image/jpeg'
,	CR = NS+'CanvasRecover', CT = 'Time'
,	C1R = CR+'y', C1T = C1R+CT, BOTH_PANELS_HEIGHT = 640
,	C2R = CR+'2', C2T = C2R+CT, DRAW_PIXEL_OFFSET = -0.5
,	LS = window.localStorage || localStorage

,	TOOLS_REF = [
		{blur: 0, opacity: 1.00, width:  1, color: '0, 0, 0'}		//* <- draw
	,	{blur: 0, opacity: 1.00, width: 20, color: '255, 255, 255'}	//* <- back
	], tools = [{}, {}], tool = tools[0], BOW = ['blur', 'opacity', 'width'], BOWL = 'BOW'
,	RANGE = [
		{min: 0   , max: 100, step: 1}
	,	{min: 0.01, max: 1  , step: 0.01}
	,	{min: 1   , max: 100, step: 1}
	]

,	flushCursor = false, neverFlushCursor = true
,	mode = {debug:	false
	,	shape:	false	//* <- straight line	/ fill area	/ pie pan
	,	step:	false	//* <- curve line	/ erase area	/ rect pan
	,	lowQ:	false	//* TODO: binary pen?
	,	brushView:	false
	,	limitFPS:	false
	,	autoSave:	true
	}, modes = [], modeL = 'DLUQVFA'
,	used = {}, cue = {upd:{}}
,	select = {
		imgRes: {width:640, height:360}
	,	imgLimits: {width:[64,640], height:[64,800]}
	,	lineCaps: {lineCap:0, lineJoin:0}
	,	options: {
			shape	: ['line', 'rectangle', 'circle', 'ellipse', 'pan']
		,	lineCap	: ['round', 'butt', 'square']
		,	lineJoin: ['round', 'bevel', 'miter']
		,	palette	: ['history', 'auto', 'legacy', 'Touhou', 'gradient']//, 'layers']
	}}
,	PALETTE_COL_COUNT = 16	//* <- used if no '\n' found
,	palette = [(LS && LS.historyPalette) ? JSON.parse(LS.historyPalette) : ['#f']
//* '\t' = title, '\n' = line break + optional title, '\r' = special cases, '#f00' = hex color field, anything else = title + plaintext spacer
	, [	'#f', '#d', '#a', '#8', '#5', '#2', '#0',		'#a00', '#740', '#470', '#0a0', '#074', '#047', '#00a', '#407', '#704'
	, '\n',	'#7f0000', '#007f00', '#00007f', '#ff007f', '#7fff00', '#007fff', '#3', '#e11', '#b81', '#8b1', '#1e1', '#1b8', '#18b', '#11e', '#81b', '#b18'
	, '\n',	'#ff0000', '#00ff00', '#0000ff', '#ff7f00', '#00ff7f', '#7f00ff', '#6', '#f77', '#db7', '#bd7', '#7f7', '#7db', '#7bd', '#77f', '#b7d', '#d7b'
	, '\n',	'#ff7f7f', '#7fff7f', '#7f7fff', '#ffff00', '#00ffff', '#ff00ff', '#9', '#faa', '#eca', '#cea', '#afa', '#aec', '#ace', '#aaf', '#cae', '#eac'
	, '\n',	'#ffbebe', '#beffbe', '#bebeff', '#ffff7f', '#7fffff', '#ff7fff', '#c', '#fcc', '#fdc', '#dfc', '#cfc', '#cfd', '#cdf', '#ccf', '#dcf', '#fcd'
	], ['\tWin7'
	,	'#0', '#7f7f7f', '#880015', '#ed1c24', '#ff7f27', '#fff200', '#22b14c', '#00a2e8', '#3f48cc', '#a349a4'
	, '\n',	'#f', '#c3c3c3', '#b97a57', '#ffaec9', '#ffc90e', '#efe4b0', '#b5e61d', '#99d9ea', '#7092be', '#c8bfe7'
	, '\nClassic', '#000000', '#000080', '#008000', '#008080', '#800000', '#800080', '#808000', '#c0c0c0', '\tCGA', '#0', '#00a', '#0a0', '#0aa', '#a00', '#a0a', '#aa0', '#a'
	, '\nClassic', '#808080', '#0000ff', '#00ff00', '#00ffff', '#ff0000', '#ff00ff', '#ffff00', '#ffffff', '\tCGA', '#5', '#55f', '#5f5', '#5ff', '#f55', '#f5f', '#ff5', '#f'
	, '\nGrayScale', '#f', '#e', '#d', '#c', '#b', '#a', '#9', '#8', '#7', '#6', '#5', '#4', '#3', '#2', '#1', '#0'
	, '\nPaint.NET'
	,	'#000000', '#404040', '#ff0000', '#ff6a00', '#ffd800', '#b6ff00', '#4cff00', '#00ff21'
	,	'#00ff90', '#00ffff', '#0094ff', '#0026ff', '#4800ff', '#b200ff', '#ff00dc', '#ff006e'
	, '\n',	'#ffffff', '#808080', '#7f0000', '#7f3300', '#7f6a00', '#5b7f00', '#267f00', '#007f0e'
	,	'#007f46', '#007f7f', '#004a7f', '#00137f', '#21007f', '#57007f', '#7f006e', '#7f0037'
	, '\n',	'#a0a0a0', '#303030', '#ff7f7f', '#ffb27f', '#ffe97f', '#daff7f', '#a5ff7f', '#7fff8e'
	,	'#7fffc5', '#7fffff', '#7fc9ff', '#3f647f', '#a17fff', '#d67fff', '#ff7fed', '#ff7fb6'
	, '\n',	'#c0c0c0', '#606060', '#7f3f3f', '#7f593f', '#7f743f', '#6d7f3f', '#527f3f', '#3f7f47'
	,	'#3f7f62', '#3f7f7f', '#3f647f', '#3f497f', '#503f7f', '#6b3f7f', '#7f3f76', '#7f3f5b'
	, '\nApple II', '#000000', '#7e3952', '#524689', '#df4ef2', '#1e6952', '#919191', '#35a6f2', '#c9bff9', '\tMSX', '#0', '#0', '#3eb849', '#74d07d', '#5955e0', '#8076f1', '#b95e51', '#65dbef'
	, '\nApple II', '#525d0d', '#df7a19', '#919191', '#efb5c9', '#35cc19', '#c9d297', '#a2dcc9', '#ffffff', '\tMSX', '#db6559', '#ff897d', '#ccc35e', '#ded087', '#3aa241', '#b766b5', '#c', '#f'
	, '\nIBM PC/XT CGA', '#000000', '#0000b6', '#00b600', '#00b6b6', '#b60000', '#b600b6', '#b66700', '#b6b6b6', '\tC-64', '#000000', '#ffffff', '#984a43', '#79c1c7', '#9b51a5', '#67ae5b', '#52429d', '#c9d683'
	, '\nIBM PC/XT CGA', '#676767', '#6767ff', '#67ff67', '#67ffff', '#ff6767', '#ff67ff', '#ffff67', '#ffffff', '\tC-64', '#9b6639', '#695400', '#c37b74', '#626262', '#898989', '#a3e599', '#897bcd', '#adadad'
	, '\nZX Spectrum', '#0', '#0000ca', '#ca0000', '#ca00ca', '#00ca00', '#00caca', '#caca00', '#cacaca', '\tVIC-20', '#000000', '#ffffff', '#782922', '#87d6dd', '#aa5fb6', '#55a049', '#40318d', '#bfce72'
	, '\nZX Spectrum', '#0', '#0000ff', '#ff0000', '#ff00ff', '#00ff00', '#00ffff', '#ffff00', '#ffffff', '\tVIC-20', '#aa7449', '#eab489', '#b86962', '#c7ffff', '#ea9ff6', '#94e089', '#8071cc', '#ffffb2'
	], [	'all'	, '#0', '#f', '#fcefe2'
	, '\n', 'Reimu'	, '#fa5946', '#e5ff41', '', '', ''
	,	'Marisa', '#fff87d', '#a864a8'
	, '\n', 'Cirno'	, '#1760f3', '#97ddfd', '#fd3727', '#00d4ae', ''
	,	'Alice'	, '#8787f7', '#fafab0', '#fabad2', '#f2dcc6', '#8'
	, '\n', 'Sakuya', '#59428b', '#bcbccc', '#fe3030', '#00c2c6', '#585456'
	,	'Remilia','#cf052f', '#cbc9fd', '#f22c42', '#f2dcc6', '#464646'
	, '\n', 'Chen'	, '#fa5946', '#6b473b', '#339886', '#464646', '#ffdb4f'
	,	'Ran'	, '#393c90', '#ffff6e', '#c096c0'
	, '\n', 'Yukari', '#c096c0', '#ffff6e', '#fa0000', '#464646', ''
	,	'Reisen', '#dcc3ff', '#2e228c', '#e94b6d'
	, '\n', 'etc'
	], '\rg', '\rl']

,	regHex = /^#?[0-9a-f]{6}$/i
,	regHex3 = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i
,	reg255 = /^([0-9]{1,3}),\s*([0-9]{1,3}),\s*([0-9]{1,3})$/
,	reg255split = /,\s*/
,	regTipBrackets = /[ ]*\([^)]+\)$/
,	regFunc = /\{[^.]+\.([^(]+)\(/
,	regLimit = /^(\d+)\D+(\d+)$/

,	self = this, container, canvas, c2d, canvasShape, c2s
,	fps = 0, ticks = 0, timer = 0
,	interval = {fps: 0, timer: 0, save: 0}, text = {debug:0, timer:0}, outside = this.o = {}, lang

,	draw = {o:{}, cur:{}, prev:{}
	,	refresh:0, time: [0, 0]
	,	line: {started:0, back:0, preview:0}
	,	history: {pos:0, last:0, data:new Array(123)
		,	cur:function() {return this.data[this.pos];}	//* TODO: sep.history per layer
		,	act:function(i) {
//* 0: Write: Refresh
//* 1: Read: Back
//* 2: Read: Forward
	var	t = this, d = t.data.length - 1;
		if (i) {
			if (i == 1 && t.pos > 0) --t.pos; else
			if (i == 2 && t.pos < d && t.pos < t.last) ++t.pos; else return 0;
			canvasRedraw();
			cue.autoSave = true;
			used.history = 'Undo';
		} else {
			if (i !== 0) {if (t.pos < d) t.last = ++t.pos; else for (i = 0; i < d; i++) t.data[i] = t.data[i+1];}
			t.data[t.pos] = c2d.getImageData(0, 0, canvas.width, canvas.height);
		}
		return 1;
	}}};

function historyAct(i) {if (draw.history.act(i)) updateDebugScreen(), updateHistoryButtons();}

function repeat(t,n) {return new Array(n+1).join(t);}
function replaceAll(t,s,j) {return t.split(s).join(j);}
function replaceAdd(t,s,a) {return replaceAll(t,s,s+a);}

function setId(e,id) {return e.id = NS+'-'+id;}
function setClass(e,c) {return e.className = NS+'-'+replaceAll(c,' ',' '+NS+'-');}
function setEvent(e,onWhat,func) {return e.setAttribute(onWhat, NS+'.'+func);}
function setContent(e,c) {
var	a = ['class','id','onChange','onClick'];
	for (i in a) c = replaceAdd(c, ' '+a[i]+'="', NS+(a[i][0]=='o'?'.':'-'));
	return e.innerHTML = c;
}
function dge(id) {return document.getElementById(NS+(id?'-'+id:''));}
function toggleView(e) {e = dge(e); return e.style.display = (e.style.display?'':'none');}
function showInfo() {
	if (dge('colors').style.display == dge('info').style.display) return;
	toggleView('colors');
	setClass(dge('buttonH'), toggleView('info') ? 'button' : 'button-active');
}
function fpsCount() {fps = ticks; ticks = 0;}
function canvasRedraw() {
	c2d.fillStyle = 'white';
	c2d.fillRect(0, 0, canvas.width, canvas.height);
	c2d.putImageData(draw.history.cur(), 0, 0);
}

function updatePalette() {
var	pt = dge('palette-table'), c = select.palette.value, p = palette[c];
	if (LS) LS.lastPalette = c; //* ie-ie
	while (pt.childNodes.length) pt.removeChild(pt.lastChild);

	if (p[0] == '\r') {
		c = p[1];
		if (c == 'g') {//		//* <- gradient
		var	ctx = (c = document.createElement('canvas')).getContext('2d')
		,	hues = [[255,  0,  0]
			,	[255,255,  0]
			,	[  0,255,  0]
			,	[  0,255,255]
			,	[  0,  0,255]
			,	[255,  0,255]
		],	bw = [	[  0,  0,  0]
			,	[127,127,127]
			,	[255,255,255]
		],	l = hues.length, f = 'return false;';

			function linearBlend(from, to, frac, max) {
				if (frac <= 0) return from;
				if (frac >= max) return to;
			var	i = to.length, j = frac/max, k = 1-j, r = [];
				while (i--) r[i] = Math.round(from[i]*k + to[i]*j);
				return r;
			}
			c.width = 300, c.height = 133, c.sat = 100, c.ctx = ctx;

			(c.updateSat = function (sat) {
			var	x = c.width, y = c.height, y2 = Math.floor(y/2), h, i, j, k = c.width/l
			,	d = ctx.createImageData(x, y);
				while (x--) {
					h = linearBlend(hues[y = Math.floor(x/k)], hues[(y+1)%l], x%k, k);
					if (!isNaN(sat)) h = linearBlend(bw[1], h, sat, c.sat);
					y = c.height;
					while (y--) {
						j = linearBlend(h, bw[y < y2?0:2], Math.abs(y-y2), y2);
						i = (x+y*c.width)*4;
						d.data[i  ] = j[0];
						d.data[i+1] = j[1];
						d.data[i+2] = j[2];
						d.data[i+3] = 255;
					}
				}
				ctx.putImageData(d, 0, 0);
			})();

			c.setAttribute('onscroll', f);
			c.setAttribute('oncontextmenu', f);
			c.addEventListener('mousedown', function (event) {pickColor(0, c, event || window.event);}, false);
			setId(c, 'gradient');
			setContent(pt, '<span id="sliderS">'
+'<input onChange="updateSliders(this)" type="range" id="rangeS" value="'+c.sat+'" min="0" max="'+c.sat+'" step="1">'
+'<input onChange="updateSliders(this)" type="text" id="textS" value="'+c.sat+'"></span> '+lang.sat+'<br>');
		} else
		if (c == 'l') {//		//* <- layers
			c = 'TODO: layers';
		} else c = 'Unknown case.';
		pt.appendChild(c.tagName ? c : document.createTextNode(c));
	} else {
	var	tbl = document.createElement('table'), tr, td, fill, t = '', colCount = 0, autoRows = true;
		for (i in p) if (p[i][0] == '\n') {autoRows = false; break;}
		for (i in p) {
			c = p[i];
			if (c[0] == '\n' || !colCount) {
				colCount = PALETTE_COL_COUNT;
				if (tr) tbl.appendChild(tr);
				(tr = document.createElement('tr')).textContent = '\n';
			}
			if (c[0] == '\t') t = c.slice(1); else		//* <- title, no text field
			if (c[0] == '\n') {
				if (c.length > 1) t = c.slice(1);	//* <- new line, title optional
			} else {
				(td = document.createElement('td')).textContent = '\n';
				if (c.length > 1 && c[0] == '#') {
				var	v = (c.length < 7 ? (c.length < 4 ?
						parseInt((c += repeat(c[1], 5))[1], 16)*3 : (
						parseInt(c[1], 16)+
						parseInt(c[2], 16)+
						parseInt(c[3], 16)))*17 : (
						parseInt(c.substr(1,2), 16)+
						parseInt(c.substr(3,2), 16)+
						parseInt(c.substr(5,2), 16)));
					setClass(fill = document.createElement('div'), v > 380 ? 'palettine' : 'paletdark');
					setEvent(fill, 'onclick', 'updateColor("'+c+'",0);');
					setEvent(fill, 'oncontextmenu', 'updateColor("'+c+'",1); return false;');
					fill.title = c+(t?(' ('+t+')'):'');
					td.style.backgroundColor = c;
					td.appendChild(fill);		//* <- color field
				} else if (c) {
					td.textContent = t = c;		//* <- title + text field
					setClass(td, 't');
				}
				tr.appendChild(td);			//* <- otherwise - empty spacer
				if (autoRows) --colCount;
			}
		}
		tbl.appendChild(tr);
		pt.appendChild(tbl);
	}
}

function updateDebugScreen() {
	if (!mode.debug) return;
	ticks ++;
var	t = '</td><td>', r = '</td></tr>	<tr><td>', c = draw.step;
	text.debug.innerHTML = '<table><tr><td>'
+draw.refresh+t+'1st='+draw.time[0]+t+'last='+draw.time[1]+t+'fps='+fps
+r+'Relative'+t+'x='+draw.o.x+t+'y='+draw.o.y+(isMouseIn()?t+'rgb='+pickColor(1):'')
+r+'DrawOfst'+t+'x='+draw.cur.x+t+'y='+draw.cur.y
+r+'Previous'+t+'x='+draw.prev.x+t+'y='+draw.prev.y+(c?''
+r+'CurvStrt'+t+'x='+c.prev.x+t+'y='+c.prev.y
+r+'CurveEnd'+t+'x='+c.cur.x+t+'y='+c.cur.y:'')+'</td></tr></table>';
}

function updatePosition(event) {
var	d = (select.shape.value == 4 || ((draw.active?c2d.lineWidth:tool.width) % 2) ? DRAW_PIXEL_OFFSET : 0);	//* <- not a 100% fix yet
	draw.cur.x = d + (draw.o.x = event.pageX - draw.field.offsetLeft);
	draw.cur.y = d + (draw.o.y = event.pageY - draw.field.offsetTop);
}

function drawCursor() {
	c2d.beginPath();
	c2d.lineWidth = 1;
	if (mode.brushView) {
		c2d.fillStyle = 'rgba('+tool.color+', '+tool.opacity+')';
		c2d.shadowColor = ((c2d.shadowBlur = tool.blur) ? 'rgb('+tool.color+')' : A0);
	} else {
		c2d.strokeStyle = 'rgb(123,123,123)';
		c2d.shadowColor = A0;
		c2d.shadowBlur = 0;
	}
	c2d.arc(draw.cur.x, draw.cur.y, tool.width/2, 0, 7/*Math.PI*2*/, false);
	c2d.closePath();
	mode.brushView ? c2d.fill() : c2d.stroke();
	if (!neverFlushCursor) flushCursor = true;
}

function drawShapeMode() {return (mode.shape || select.shape.value != 0);}
function drawStart(event) {
	updatePosition(event);
	canvas.focus();
	event.preventDefault();
var	s = select.shape.value;
	if (draw.step) {
		if (mode.step && ((mode.shape && s == 0) || s == 4)) {
			draw.step.done = 1;
			for (i in draw.o) draw.prev[i] = draw.cur[i];
			return;
		} else draw.step = 0;
	}
	switch (event.which) {
		case 2: pickColor(); break;
		case 1: case 3:
		event.stopPropagation();
		event.cancelBubble = true;
		draw.active = 1;
		if (!draw.time[0]) draw.time[0] = draw.time[1] = +new Date();
		if (!interval.timer) {
			interval.timer = setInterval(timeElapsed, 1000);
			interval.save = setInterval(autoSave, 60000);
		}
	//	canvasRedraw();
		for (i in draw.o) draw.prev[i] = draw.cur[i];
		for (i in draw.line) draw.line[i] = false;
		for (i in select.lineCaps) c2s[i] = c2d[i] = select.options[i][select[i].value];
	var	i = (event.which == 1 ? 1 : 0), t = tools[1-i];
		for (i in (t = {
			lineWidth: (s == 4?1:t.width)
		,	fillStyle: (mode.shape && s != 0 && s != 4 ? 'rgba('+tools[i].color+', '+t.opacity+')' : A0)
		,	strokeStyle: 'rgba('+t.color+', '+(s == 4?(draw.step?0.33:0.66):t.opacity)+')'
		,	shadowColor: (t.blur ? 'rgb('+t.color+')' : A0)
		,	shadowBlur: t.blur
		})) c2s[i] = c2d[i] = t[i];
		c2d.beginPath();
		c2d.moveTo(draw.cur.x, draw.cur.y);
	}
}

function drawMove(event) {
var	redraw = true, newLine = (draw.active && !drawShapeMode()), s = select.shape.value;
	updatePosition(event);
	if (newLine) {
		if (draw.line.preview) {
			drawShape(c2d, s);
		} else
		if (draw.line.back = mode.step) {
			if (draw.line.started) c2d.quadraticCurveTo(draw.prev.x, draw.prev.y, (draw.cur.x + draw.prev.x)/2, (draw.cur.y + draw.prev.y)/2);
		} else c2d.lineTo(draw.cur.x, draw.cur.y);
		draw.line.preview =	!(draw.line.started = true);
	} else if (draw.line.back) {
		c2d.lineTo(draw.prev.x, draw.prev.y);
		draw.line.back =	!(draw.line.started = true);
	}
	if (mode.limitFPS) {
	var	t = +new Date();
		if (t-draw.refresh > 30) draw.refresh = t; else redraw = false;		//* <- put "> 1000/N" to redraw maximum N FPS
	}
	if (redraw) {
		if ((flushCursor || neverFlushCursor) && !(mode.lowQ && draw.active)) canvasRedraw();
		if (draw.active) {
			if (drawShapeMode()) {
				draw.line.preview = true;
				if (mode.step && s != 0 && s != 4) {
					c2d.beginPath();
					drawShape(c2d, s, 1);	//* <- erase shape area
				} else {
					c2s.clearRect(0, 0, canvas.width, canvas.height);
					c2s.beginPath();
					drawShape(c2s, (mode.step && s == 4 && (!draw.step || !draw.step.done))?1:s);
					c2s.stroke();
					c2d.drawImage(c2s.canvas, 0, 0);		//* <- draw 2nd canvas overlay with sole shape
				}
			}
			if (draw.line.started) c2d.stroke();
		} else if (neverFlushCursor && !mode.lowQ && isMouseIn()) drawCursor();
		updateDebugScreen();
	}
	if (newLine) for (i in draw.o) draw.prev[i] = draw.cur[i];
}

function drawEnd(event) {
var	s = select.shape.value;
	if (draw.active) {
		if (!draw.step && mode.step && ((mode.shape && s == 0) || s == 4)) {
			draw.step = {prev:{x:draw.prev.x, y:draw.prev.y}, cur:{x:draw.cur.x, y:draw.cur.y}};	//* <- normal straight line as base
			return;
		}
		draw.time[1] = +new Date();
		canvasRedraw();
		if (mode.step && s != 0 && s != 4) {
			drawShape(c2d, s, 1);
		} else {
		var	m = drawShapeMode();
			if (m && draw.line.preview) {
				c2d.fillStyle = c2s.fillStyle;
				drawShape(c2d, s);
			} else if (m || draw.line.back || !draw.line.started) {//* <- draw 1 pixel on short click, regardless of mode or browser
				c2d.lineTo(draw.cur.x, draw.cur.y + (draw.cur.y == draw.prev.y ? 0.01 : 0));
			}
			if (s != 4) c2d.stroke(); else used.move = 'Move';
		}
		historyAct();
		cue.autoSave = true;
		draw.active = draw.step = 0;
	}
	updateDebugScreen();
}

function drawShape(ctx, i, clear) {
var	s = draw.step;
	switch (parseInt(i)) {
		case 1:	if (s) {
		//		if (i = ctx.setLineDash) i([3,3]);
				ctx.strokeRect(s.prev.x, s.prev.y, s.cur.x-s.prev.x, s.cur.y-s.prev.y);	//* pan zone
		//		if (i) i();
			} else if (clear) c2d.clearRect(draw.prev.x, draw.prev.y, draw.cur.x-draw.prev.x, draw.cur.y-draw.prev.y);
			else {
				if (ctx.fillStyle != A0)	//* rect
				ctx.fillRect(draw.prev.x, draw.prev.y, draw.cur.x-draw.prev.x, draw.cur.y-draw.prev.y);
				ctx.strokeRect(draw.prev.x, draw.prev.y, draw.cur.x-draw.prev.x, draw.cur.y-draw.prev.y);
			}
			break;
		case 2:
		var	xCenter = (draw.prev.x+draw.cur.x)/2	//* circle
		,	yCenter = (draw.prev.y+draw.cur.y)/2
		,	radius = Math.sqrt(Math.pow(draw.cur.x-xCenter, 2) + Math.pow(draw.cur.y-yCenter, 2));
			ctx.moveTo(xCenter+radius, yCenter);
			ctx.arc(xCenter, yCenter, radius, 0, 7, false);
			if (clear) {
				c2d.save();
				c2d.clip();
				c2d.clearRect(0, 0, canvas.width, canvas.height);
				c2d.restore();
			} else if (ctx.fillStyle != A0) ctx.fill();
			ctx.moveTo(draw.cur.x, draw.cur.y);
			break;
		case 3:
		var	xCenter = (draw.prev.x+draw.cur.x)/2	//* ellipse
		,	yCenter = (draw.prev.y+draw.cur.y)/2
		,	xRadius = Math.abs(draw.cur.x-xCenter)
		,	yRadius = Math.abs(draw.cur.y-yCenter), qx = 1, qy = 1;
			if (xRadius > 0 && yRadius > 0) {
				ctx.save();
				if (xRadius > yRadius) ctx.scale(1, qy = yRadius/xRadius); else
				if (xRadius < yRadius) ctx.scale(qx = xRadius/yRadius, 1);
				ctx.moveTo((xCenter+xRadius)/qx, yCenter/qy);
				ctx.arc(xCenter/qx, yCenter/qy, Math.max(xRadius, yRadius), 0, 7, false);
				ctx.restore();
				if (clear) {
					c2d.save();
					c2d.clip();
					c2d.clearRect(0, 0, canvas.width, canvas.height);
					c2d.restore();
				} else if (ctx.fillStyle != A0) ctx.fill();
			}
			ctx.moveTo(draw.cur.x, draw.cur.y);
			break;
		case 4:	if (draw.prev.x != draw.cur.x		//* pan
			|| (draw.prev.y != draw.cur.y)) moveScreen(draw.cur.x-draw.prev.x, draw.cur.y-draw.prev.y);
			break;
		default:if (s) {
			var	p = (s.prev.x == draw.prev.x && s.prev.y == draw.prev.y ? draw.cur : draw.prev);
				ctx.moveTo(s.prev.x, s.prev.y);
				ctx.bezierCurveTo(p.x, p.y, draw.cur.x, draw.cur.y, s.cur.x, s.cur.y);
				return;
			}
			ctx.moveTo(draw.prev.x, draw.prev.y);	//* line
			ctx.lineTo(draw.cur.x, draw.cur.y);
	}
}

function moveScreen(x, y) {
var	d = draw.history.cur(), p = draw.step;
	c2d.fillStyle = 'rgb(' + tools[1].color + ')';
	if (p) {
		for (i in {min:0,max:0}) p[i] = {
			x:Math[i](p.cur.x, p.prev.x)
		,	y:Math[i](p.cur.y, p.prev.y)
		};
		c2d.fillRect(p.min.x, p.min.y, p.max.x -= p.min.x, p.max.y -= p.min.y);
		c2d.putImageData(d, x, y, p.min.x, p.min.y, p.max.x, p.max.y);
	} else {
		c2d.fillRect(0, 0, canvas.width, canvas.height);
		c2d.putImageData(d, x, y);
	}
}

function fillCheck() {
var	d = draw.history.cur(), i = d.data.length;
	while (--i) if (d.data[i] != d.data[i%4]) return 0; return 1;	//* <- fill flood confirmed
}

function fillScreen(i) {
	if (isNaN(i)) {
		used.wipe = 'Wipe';
		c2d.clearRect(0, 0, canvas.width, canvas.height);
	} else
	if (i < 0) {
	var	d = draw.history.cur();
		if (i == -1) {
			used.inv = 'Invert';
			i = d.data.length;
			while (i--) if (i%4 != 3) d.data[i] = 255 - d.data[i];	//* <- modify current history point, no push
		} else {
		var	hw = d.width, hh = d.height, w = canvas.width, h = canvas.height
		,	hr = (i == -2), j, k, l = (hr?w:h)/2, m, n, x, y;
			if (hr) used.flip_h = 'Hor.Flip';
			else	used.flip_v = 'Ver.Flip';
			x = canvas.width; while (x--) if ((!hr || x >= l) && x < hw) {
			y = canvas.height; while (y--) if ((hr || y >= l) && y < hh) {
				m = (hr?w-x-1:x);
				n = (hr?y:h-y-1);
				i = (x+y*hw)*(k = 4);
				j = (m+n*hw)*k;
				while (k--) {
					m = d.data[i+k];
					n = d.data[j+k];
					d.data[i+k] = n;
					d.data[j+k] = m;
				}
			}}
		}
		c2d.putImageData(d, 0, 0);
		return;
	} else {
		used.fill = 'Fill';
		c2d.fillStyle = 'rgb(' + tools[i].color + ')';
		c2d.fillRect(0, 0, canvas.width, canvas.height);
	}
	cue.autoSave = false;
	historyAct();
}

function pickColor(keep, c, event) {
var	d;
	if (c) {
		d = c.ctx.getImageData(0, 0, c.width, c.height);
		c = (event.pageX - c.offsetLeft
		+   (event.pageY - c.offsetTop)*c.width)*4;
	} else {
		d = draw.history.cur();
		c = (draw.o.x + draw.o.y*canvas.width)*4;
	}
	c = (d.data[c]*65536 + d.data[c+1]*256 + d.data[c+2]).toString(16);
	while (c.length < 6) c = '0'+c; c = '#'+c;
	return keep ? c : updateColor(c, (!event || event.which != 3)?0:1);
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
		if (v[0] != '#') v = '#'+v;
		if (v.length == 2) v += repeat(v[1], 5);
		if (regHex3.test(v)) v = v.replace(regHex3, '#$1$1$2$2$3$3');
		if (!regHex.test(v)) return c.style.backgroundColor = 'red';
		if (value != '') t.color =
			parseInt(v.substr(1,2), 16)+', '+
			parseInt(v.substr(3,2), 16)+', '+
			parseInt(v.substr(5,2), 16);
	}
	if (t == tool) c.value = v, c.style.backgroundColor = '';

//* put on top of history palette:
var	p = palette[0], found = p.length, i;
	for (i = 0; i < found; i++) if (p[i] == v) found = i;
	if (found) {
		i = Math.min(found+1, PALETTE_COL_COUNT*9);		//* <- history length limit
		while (i--) p[i] = p[i-1];
		p[0] = v;
		if (0 == select.palette.value) updatePalette();
		if (LS) LS.historyPalette = JSON.stringify(p);
	}

//* update buttons:
	c = 0;
var	a = t.color.split(reg255split), e = dge((t == tool) ? 'colorF' : 'colorB');
	for (i in a) c += parseInt(a[i]);
	e.style.color = (c > 380 ? '#000' : '#fff');			//* <- inverted font color
	e.style.background = 'rgb(' + t.color + ')';
	return v;
}

function updateSlider(i,e) {
var	j = (e?i:BOWL[i])
,	s = dge('range'+j)
,	t = dge('text'+j) || s
,	r = (e?s:RANGE[i]), v = (e?parseFloat(e.value):tool[i = BOW[i]]);
	if (v < r.min) v = r.min; else
	if (v > r.max) v = r.max;
	if (r.step < 1) v = parseFloat(v).toFixed(2);
	if (e && (e = dge('gradient'))) {
		e.updateSat(v);
	} else tool[i] = v;
	s.value = t.value = v;
}

function updateSliders(s) {
	if (s && s.id) {
	var	prop = s.id[s.id.length-1];
		for (i in BOW) if (prop == BOWL[i]) {
			tool[BOW[i]] = parseFloat(s.value);
			return updateSlider(i);
		}
		return updateSlider(prop, s);
	} else {
		if (s) updateSlider(s); else
		for (i in BOW) updateSlider(i);
		if (draw.o.length) {
			drawEnd();
			s = tool.width+4;
			c2d.putImageData(draw.history.cur(), 0, 0, draw.o.x - s/2, draw.o.y - s/2, s, s);
			drawCursor();
		}
	}
}

function updateShape(s) {
	if (!isNaN(s)) select.shape.value = s, s = 0;
	setClass(dge('bottom'), ((s?s:s=select.shape).value == 0?'b c':(s.value == 4?'a b':'a c')));
}

function updateHistoryButtons() {
var	a = {R:draw.history.last,U:0}, b = 'button', d = b+'-disabled', e;
	for (i in a) setClass(dge(b+i), draw.history.pos == a[i] ?d:b);
	cue.upd = {J:1,P:1};
}

function updateSaveFileSize(e) {
var	i = e.id.slice(-1);
	if (cue.upd[i]) cue.upd[i] = 0,
	e.title = e.title.replace(regTipBrackets, '')+' ('+(canvas.toDataURL({J:IJ,P:''}[i]).length / 1300).toFixed(0)+' KB)';
}

function updateDim(i) {
	if (i) {
	var	a = dge('img-'+i), b, c = canvas[i], v = parseInt(a.value) || 0;
		canvasShape[i] = canvas[i] = a.value = v = (
			v < (b = select.imgLimits[i][0]) ? b : (
			v > (b = select.imgLimits[i][1]) ? b : v)
		);
		if (v > c) {
			canvasRedraw();
			historyAct(0);
		}
	}
	if (!i || i[0] == 'h') {
	var	b = dge('buttonH')
	,	c = dge('colors').style
	,	i = dge('info').style;
		if (canvas.height < BOTH_PANELS_HEIGHT) {
		var	a = (b.className.indexOf('active') >= 0), v = 'none';
			c.display = (a?v:'');
			i.display = (a?'':v);
		} else {
			c.display = i.display = '';
			setClass(b, 'button-active');
		}
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
		for (i in select.lineCaps) select[i].value = 0;
		if (mode.shape) toggleMode(1);
		updateShape(0);
		tool.width = 3; //* <- arbitrary default
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

function toggleMode(i, keep) {
	if (i >= 0 && i < modes.length) {
	var	n = modes[i], v = mode[n];
		if (!keep) v = mode[n] = !v;
		if (e = dge('check'+modeL[i])) setClass(e, v ? 'button-active' : 'button');
		if (n == 'debug') {
			text.debug.textContent = '';
			interval.fps ? clearInterval(interval.fps) : (interval.fps = setInterval(fpsCount, 1000));
		}
	} else alert(lang.bad_id);

}

function unixDateToHMS(t,u) {
var	d = (t ? new Date(t+(t > 0 ? 0 : new Date())) : new Date());
	t = ['Hours','Minutes','Seconds'];
	u = 'get'+(u?'UTC':'');
	for (i in t) if ((t[i] = d[u+t[i]]()) < 10) t[i] = '0'+t[i];
	return t.join(':');
}

function timeElapsed() {text.timer.textContent = unixDateToHMS(timer += 1000, 1);}
function autoSave() {if (mode.autoSave && cue.autoSave) {sendPic(2,true); cue.autoSave = false;}}

function sendPic(dest, auto) {
var	a = auto || false, c, d, e, t;
	canvasRedraw();
	switch (dest) {
	case 0:
	case 1: window.open(c = canvas.toDataURL(dest?IJ:''), '_blank');
		break;
	case 2:
		if (fillCheck()) return alert(lang.flood);
		c = canvas.toDataURL();
		if (!LS) return a?c:alert(lang.no_LS);
		d = LS[C1R];
		if (d == c) return a?c:alert(lang.no_change);
		t = LS[C1T], e = LS[C2R] || 0;
		if (!a && e == c) {
			LS[C1R] = e;
			LS[C1T] = LS[C2T];
			LS[C2R] = d;
			LS[C2T] = t;
			alert(lang.found_swap);
		} else
		if (a || confirm(lang.confirm_save)) {
			if (LS[C1T]) {
				LS[C2R] = d;
				LS[C2T] = t;
			}
			LS[C1R] = c;
			LS[C1T] = draw.time.join('-');
			dge('saveTime').textContent = unixDateToHMS();
			setClass(dge('buttonL'), 'button');
			cue.autoSave = false;
		}
		break;
	case 3:
		if (!LS) return alert(lang.no_LS);
		t = LS[C1T];
		if (!t) return;
		d = LS[C1R];
		if (d == (c = canvas.toDataURL())) {
			if ((!(t = LS[C2T]) || ((d = LS[C2R]) == c))) return alert(lang.no_change);
	/*		LS[C2R] = LS[C1R];
			LS[C2T] = LS[C1T];	//* <- swap save slots
			LS[C1R] = d;
			LS[C1T] = t;
	*/	}
		if (confirm(lang.confirm_load)) {
			draw.time = t = t.split('-'), dge('saveTime').textContent = unixDateToHMS(+t[1]);
			readPic(d);
			used.LS = 'Local Storage';
		}
		break;
	case 4:	
		if ((outside.read || (outside.read = dge('read'))) && (a = outside.read.value)) {
			draw.time = [0, 0];
			readPic(a);
			used.read = 'File Read';
		}
		break;
	default:
		if (dest) alert(lang.bad_id); else
		if (!outside.send) alert(lang.no_form); else
		if (fillCheck()) alert(lang.flood); else
		if (confirm(lang.confirm_send)) {
		var	pngData = sendPic(2, 1), jpgData, a = {txt:0,pic:0};
			for (i in a) if (!(a[i] = dge(i))) {
				setId(e = a[i] = document.createElement('input'), e.name = i);
				e.type = 'hidden';
				outside.send.appendChild(e);
			}
			e = [];
			for (i in used) e.push(used[i]);
			a.txt.value = outside.t0 +','+ draw.time.join('-') +','+ NS +' '+ INFO_VERSION + (e.length?' (used '+e.join(', ')+')':'');
			a.pic.value = ((((outside.jp
				&& pngData.length > outside.jp) || (outside.jpg_pref
				&& pngData.length > outside.jpg_pref))
				&& pngData.length > (jpgData = canvas.toDataURL(IJ)).length
			) ? jpgData : pngData);
			outside.send.submit();
		}
	}
	return c;
}

function readPic(s) {
var	id = 'read-img', i = dge(id);
	if (!i) setId(i = new Image(), id);
	i.onload = function () {
		for (d in select.imgRes) dge('img-'+d).value = canvasShape[d] = canvas[d] = i[d];
		updateDim();
		c2d.drawImage(i,0,0);
		historyAct();
		cue.autoSave = false;
		draw.field.removeChild(i);
	}
	draw.field.appendChild(i);
	i.src = s;
}

function isMouseIn() {return (draw.o.x >= 0 && draw.o.y >= 0 && draw.o.x < canvas.width && draw.o.y < canvas.height);}
function browserHotKeyPrevent(event) {return isMouseIn() ? (event.returnValue = false) || event.preventDefault() || true : false;}
function hotKeys(event) {
	if (browserHotKeyPrevent(event)) {
		function c(s) {return s.charCodeAt(0);}
	var	n = event.keyCode - c('0');
		if ((n?n:n=10) > 0 && n < 11) {
			(event.AltKey ? toolTweak('B', n/10) :
			(event.CtrlKey? toolTweak('O', n/10) :
					toolTweak('W', n>5 ? (n-5)*10 : n)));
		} else
		switch (event.keyCode) {
			case c('Z'):	historyAct(1);	break;
			case c('X'):	historyAct(2);	break;
			case c('C'):	pickColor();	break;
			case c('F'):	fillScreen(0);	break;
			case c('D'):	fillScreen(1);	break;
//			case c('W'):	fillScreen();	break;
			case c('I'):	fillScreen(-1);	break;
			case c('H'):	fillScreen(-2);	break;
			case c('V'):	fillScreen(-3);	break;
			case c('S'):	toolSwap();	break;
			case c('A'):	toolSwap(1);	break;
			case c('E'):	toolSwap(2);	break;
			case c('R'):	toolSwap(3);	break;

			case 8:
if (text.debug.innerHTML.length)	toggleMode(0);	break; //* 45=Ins, 42=106=Num *, 8=bksp
			case c('L'):	toggleMode(1);	break;
			case c('U'):	toggleMode(2);	break;
		//	case 118:	toggleMode(3);	break;
			case 116:	toggleMode(4);	break;
		//	case 120:	toggleMode(5);	break;

			case 112:	showInfo();	break;
			case c('P'):	sendPic(0);	break;
			case c('J'):	sendPic(1);	break;
			case 113:	sendPic(2);	break;
			case 115:	sendPic(3);	break;
			case 117:	sendPic(4);	break;
			case 119:	sendPic();	break;

			case c('Q'):	updateShape(0);	break;
			case c('W'):	updateShape(1);	break;
			case c('B'):	updateShape(2);	break;
			case c('N'):	updateShape(3);	break;
			case c('M'):	updateShape(4);	break;

		/*	case c('Q'):	toolTweak('W', -1);	break;
			case c('W'):	toolTweak('W');		break;
			case c('T'):	toolTweak('O', -1);	break;
			case c('Y'):	toolTweak('O');		break;
			case c('N'):	toolTweak('B', -1);	break;
			case c('M'):	toolTweak('B');		break;*/

			case 106: case 42:
text.debug.innerHTML = replaceAll(
"<a href=\"javascript:var s=' ',t='';for(i in |)t+='\\n'+i+' = '+(|[i]+s).split(s,1);alert(t);\">|.props</a>\n"+
"<a href=\"javascript:var t='',o=|.o;for(i in o)t+='\\n'+i+' = '+o[i];alert(t);\">|.outside</a>\n"+
(outside.read?'':'F6=read: <textarea id="|-read" value="/9.png"></textarea>'), '|', NS); break;

			default: if (mode.debug) text.debug.innerHTML += '\n'+String.fromCharCode(event.keyCode)+'='+event.keyCode;
		}
	}
	return false;
}

function hotWheel(event) {
	if (browserHotKeyPrevent(event)) {
	var	d = event.deltaY || event.detail || event.wheelDelta
	,	b = event.altKey?'B':(event.CtrlKey?'O':'W');
		toolTweak(b, d < 0?0:-1);
		if (mode.debug) text.debug.innerHTML += ' d='+d;
	}
	return false;
}




this.init = function() {
	if (!get_form()) document.title += ': '+NS+' '+INFO_VERSION;
var	a, b, c = 'canvas', d = '<div id="', e = '"></div>', f, i, j, n = '\n	', o = outside, p, s;
	setContent(container = dge(),
n+d+'load"><'+c+' id="'+c+'" tabindex="0">'+lang.no_canvas+'</'+c+'></div>'+
n+d+'right'+e+n+d+'bottom'+e+n+d+'debug'+e+'\n');

	if (!(canvas = dge(c)).getContext) return;
	canvasShape = document.createElement(c);
	for (i in select.imgRes) {
		canvasShape[i] = canvas[i] = (o[a = i[0]]?o[a]:o[a] = (o[i]?o[i]:select.imgRes[i]));
		if ((o[b = a+'l'] || o[b = i+'Limit']) && (f = o[b].match(regLimit))) select.imgLimits[i] = [parseInt(f[1]), parseInt(f[2])];
	}

	c2s = canvasShape.getContext('2d');
	c2d = canvas.getContext('2d');
	c2d.fillStyle = 'white';
	c2d.fillRect(0, 0, o.w, o.h);

	canvas.setAttribute('onscroll', f = 'return false;');
	canvas.setAttribute('oncontextmenu', f);
	canvas.addEventListener('mousedown'	, drawStart, f = false);
	document.addEventListener('mousemove'	, drawMove, f);	//* <- using 'document' to prevent negative clipping
	document.addEventListener('mouseup'	, drawEnd, f);
	container.addEventListener('keypress'	, browserHotKeyPrevent, f);
	container.addEventListener('keydown'	, hotKeys, f);
	container.addEventListener('mousewheel'	, e = hotWheel, f);
	container.addEventListener('wheel'	, e, f);
	container.addEventListener('scroll'	, e, f);

	c = '</td><td class="r">', a = ': '+c+'	', e = n+'	', f = e+'	', b = e+d+'colors">'+d+'sliders">', i = BOW.length;
	while (i--) {
		b += f+'<span id="slider'+BOWL[i]+'"><input type="range" id="range'+BOWL[i]+'" onChange="updateSliders(this)';
		for (j in RANGE[i]) b += '" '+j+'="'+RANGE[i][j];
		b += '"></span>	'+lang.tool[BOWL[i]]+(i?'<br>':'');
	}

	b += e+'</div>'+e+'<table width="100%"><tr><td>'
+f+lang.shape	+a+'<select id="shape" onChange="updateShape(this)"></select>';
	for (i in select.lineCaps) b += c+'<select id="'+i+'" title="'+(select.lineCaps[i] || i)+'"></select>';
	setContent(dge('right'), b+'	</td></tr><tr><td>'
+f+lang.hex	+a+'<input type="text" value="#000" id="color-text" onChange="updateColor()" title="'+lang.hex_hint+'">	'+c
+f+lang.palette	+a+'<select id="palette" onChange="updatePalette()"></select>	</td></tr></table>'
+f+d+'palette-table"></div>'+e+'</div>'+e+d+'info">'+e+'</div>'+n);

	a = '<abbr title="', b = '">', c = '</abbr>', d = '';
	for (i in select.imgRes) d += (d?' x ':'')+'<input type="text" value="'+o[i[0]]+'" id="img-'+i+'" onChange="updateDim(\''+i+'\')" title="'+lang.size_hint+select.imgLimits[i]+'">';
	setContent(dge('info'), f+replaceAll(
'<p class="L-open">'+lang.info[0]+'</p>\
|<p>	'+lang.info[1].join('|<br>	')+' <span id="saveTime">'+lang.info[2]+'</span>.\
|</p>	<p class="L-close"> ', '|', f)
+a+INFO_ABBR+b+NS.toUpperCase()+c+' '+lang.info[3]+' '
+a+INFO_DATE+b+INFO_VERSION+c+'</p>'+f+'<table>'+f+'	<tr><td>'+lang.size+':	'+d+'</td></tr>'
+f+'	<tr><td><span onClick="toggleView(\'timer\')" title="'+lang.hide_hint+'"> '+lang.info[4]
+'	<abbr id="timer">00:00:00</abbr></span></td></tr>'+f+'</table>'+e);

	if (c = (canvas.height < BOTH_PANELS_HEIGHT)) toggleView('info');
	for (i in text) text[i] = dge(i);
	draw.field = dge('load');

	a = 'historyAct(', b = 'button', d = 'toggleMode(', e = 'sendPic(', f = 'fillScreen(', i = '&nbsp;';
	a = [
//* subtitle, hotkey, pictogram, function, id
	['undo'	,'Z'	,'&#x2190;'	,a+'1)'	,b+'U'
],	['redo'	,'X'	,'&#x2192;'	,a+'2)'	,b+'R'
],
0,	['fill'	,'F'	,i		,f+'0)'	,(a='color')+'F'
],	['swap'	,'S'	,'&#X21C4;'	,'toolSwap()'
],	['erase','D'	,i		,f+'1)'	,a+'B'
],
0,	['invert','I'	,'&#x25D0;'	,f+'-1)'
],	['flip_h','H'	,'&#x2194;'	,f+'-2)'
],	['flip_v','V'	,'&#x2195;'	,f+'-3)'
],
0,	['pencil','A'	,'i'		,(a='toolSwap(')+'1)'
],	['eraser','E'	,'&#x25CB;'	,a+'2)'
],	['reset','R'	,'&#x25CE;'	,a+'3)'
],
0,	['line|shape|global','L'	,'&#x25C7;|&#x25A0;|&#x25A4;'	,d+'1)'	,(a='check')+'L'
],	['curve|shaper|rect','U'	,'&#x2307;|&#x25A1;|&#x25AD;'	,d+'2)'	,a+'U'
],	['cursor','F5'	,'&#x25CF;'	,d+'4)'	,a+'V'
/*],	['rough','F7'	,'&#x25A0;'	,d+'3)'	,a+'Q'
],	['fps'	,'F9'	,'&#x231A;'	,d+'5)'	,a+'F'
*/],
0,	['png'	,'P'	,'P'		,e+'0)'	,b+'P'
],	['jpeg'	,'J'	,'J'		,e+'1)'	,b+'J'
],	['save'	,'F2'	,'&#x22C1;'	,e+'2)'
],	['load'	,'F4'	,'&#x22C0;'	,e+'3)'	,b+'L'
],!o.read || 0 == o.read?1:
	['read'	,'F6'	,'&#x21E7;'	,e+'4)'
],!o.send || 0 == o.send?1:
	['done'	,'F8'	,'&#x21B5;'	,e+')'
],c?0:1
,!c?1:	['info'	,'F1'	,'?'	,'showInfo()'	,b+'H'
]], f = dge('bottom'), d = '<div class="button-', c = '</div>';

	function btnContent(e, subt, pict) {
	var	t = lang.b[subt];
		e.title = (t.t?t.t:t);
		setContent(e, d+'key">'+b[1]+c+pict+d+'subtitle"><br>'+(t.t?t.sub:subt)+c);
		return e;
	}

	for (i in a) if (1 !== (b = a[i])) {
		f.innerHTML += n+(b?'':'&nbsp;')+'	';	//* <- need any whitespace for correct visual result
		if (b) {
			e = document.createElement('span');

			if (b[0].indexOf('|') > 0) {
				s = b[0].split('|');
				p = b[2].split('|');
				for (j in s) setClass(e.appendChild(btnContent(document.createElement('span'), s[j], p[j])), 'abc'[j]);
			} else btnContent(e, b[0], b[2]);

			setClass(e, 'button');
			setEvent(e, 'onclick', b[3]);
			if (b.length > 4) setId(e, b[4]);
			f.appendChild(e);
		}
	}
	f.innerHTML += '	';
	for (name in mode) if (mode[modes[i = modes.length] = name]) toggleMode(i,1);

	if (!LS || !LS[C1T]) setClass(dge('buttonL'), 'button-disabled');

	i = (a = 'JP').length;
	while (i--) if (b = dge('button'+a[i])) setEvent(b, 'onmouseover', 'updateSaveFileSize(this)');

	a = 'range', b = 'text', d = (dge(a+'W').type == a);
	for (i in BOW) if (d) {
		e = document.createElement('input');
		setId(e, (e.type = b)+BOWL[i]);
		setEvent(e, 'onchange', 'updateSliders(this)');
		dge('slider'+BOWL[i]).appendChild(e);
	} else 	dge(a+BOWL[i]).type = b;

	for (i in (a = ['input','select','span']))
	for (c in (b = container.getElementsByTagName(a[i])))
	for (e in (d = ['onchange','onclick', 'onmouseover'])) if ((f = b[c][d[e]]) && !self[f = (''+f).match(regFunc)[1]]) self[f] = eval(f);

	a = select.options, c = select.translated || a, f = (LS && LS.lastPalette && palette[LS.lastPalette]) ? LS.lastPalette : 1;
	for (b in a) {
		e = select[b] = dge(b);
		for (i in a[b]) (
			e.options[e.options.length] = new Option(c[b][i], i)
		).selected = (b == 'palette'?(i == f):!i);
	}

//* safe palette constructor, step recomended to be: 1, 3, 5, 15, 17, 51, 85, 255
  function generatePalette(p, step, slice) {
	if (!(p = palette[p])) return;
var	letters = [0, 0, 0], l = p.length;
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
	generatePalette(1, 85, 0);

	toolSwap(3);
	updatePalette();
	updateSliders();
	historyAct(0);
}; //* END this.init()




function get_form() {
	outside.read = dge('read');
var f = outside.send = dge('send'), o = f, e;
	if (o && o.name) for (i in (o = o.name.split(';'))) if ((e = o[i].split('=', 2)).length > 1) outside[e[0]] = e[1];
	if (!outside.t0) outside.t0 = Math.floor((+new Date())/1000);

	if (!outside.lang) outside.lang = document.documentElement.lang || 'en';
	if (outside.lang == 'ru')
select.lineCaps = {lineCap: 'край', lineJoin: 'сгиб'}
, select.translated = {
	shape	: ['линия', 'прямоугольник', 'круг', 'овал', 'сдвиг']
,	lineCap	: ['круг', 'бочка', 'квадрат']
,	lineJoin: ['круг', 'срез', 'угол']
,	palette	: ['история', 'авто', 'разное', 'Тохо', 'градиент', 'слои']
}, lang = {
	bad_id:		'Ошибка выбора.'
,	flood:		'Полотно пусто.'
,	confirm_send:	'Отправить рисунок в сеть?'
,	confirm_save:	'Сохранить рисунок в Локальное Хранилище?'
,	confirm_load:	'Вернуть рисунок из Локального Хранилища?'
,	found_swap:	'Рисунок был в запасе, поменялись местами.'
,	no_LS:		'Локальное Хранилище недоступно.'
,	no_form:	'Назначение недоступно.'
,	no_change:	'Нет изменений.'
,	no_canvas:	'Ваша программа не поддерживает HTML5-полотно.'
, tool: {	B:	'Тень'
	,	O:	'Непрозр.'
	,	W:	'Толщина'
},	shape:		'Форма'
,	palette:	'Палитра'
,	sat:		'Насыщ.'
,	hex:		'Цвет'
,	hex_hint:	'Формат ввода - #a, #f90, #ff9900, или 0,123,255'
,	hide_hint:	'Кликните, чтобы спрятать или показать.'
,	info: ['Управление (указатель над полотном):'
	,	[	'C / средний клик = подобрать цвет с рисунка'
		,	'Q / W / B / N / M = выбор формы'
		,	'1-10 / колесо мыши = толщина кисти'
		,	'Ctrl + 1-10 / колесо = прозрачность'
		,	'Alt + 1-10 / колесо = размытие тени'
		,	'Автосохранение раз в минуту:'
	],	'ещё не было'
	,	'- доска для набросков,'
	,	'Времени прошло'
],	size:	'Размер полотна'
,	size_hint: 'Число между '
, b: {	undo:	{sub:'назад',	t:'Отменить последнее действие.'
},	redo:	{sub:'вперёд',	t:'Отменить последнюю отмену.'
},	fill:	{sub:'залить',	t:'Залить полотно основным цветом.'
},	erase:	{sub:'стереть',	t:'Залить полотно запасным цветом.'
},	invert:	{sub:'инверт.',	t:'Обратить цвета полотна.'
},	flip_h:	{sub:'отразить',t:'Отразить полотно слева направо.'
},	flip_v:	{sub:'перевер.',t:'Перевернуть полотно вверх дном.'
},	pencil:	{sub:'каранд.',	t:'Инструмент - тонкий простой карандаш.'
},	eraser:	{sub:'стёрка',	t:'Инструмент - толстый белый карандаш.'
},	swap:	{sub:'смена',	t:'Поменять инструменты местами.'
},	reset:	{sub:'сброс',	t:'Сбросить инструменты к начальным.'
},	line:	{sub:'прямая',	t:'Прямая линия 1 зажатием.'
},	curve:	{sub:'кривая',	t:'Сглаживать углы пути / кривая линия 2 зажатиями.'
},	shape:	{sub:'закрас.',	t:'Закрашивать площадь геометрических фигур.'
},	shaper:	{sub:'прозр.',	t:'Стирать площадь фигур до прозрачности.'
},	global:	{sub:'глобал.',	t:'Сдвиг всех слоёв сразу.'
},	rect:	{sub:'прямоуг.',t:'Сдвиг прямоугольником.'
},	cursor:	{sub:'указат.',	t:'Показывать кисть на указателе.'
},	rough:	{sub:'п.штрих',	t:'Уменьшить нагрузку, пропуская перерисовку штриха.'
},	fps:	{sub:'п.кадры',	t:'Уменьшить нагрузку, пропуская кадры.'
},	png:	{sub:'сохр.png',t:'Сохранить рисунок в PNG файл.'
},	jpeg:	{sub:'сохр.jpg',t:'Сохранить рисунок в JPEG файл.'
},	save:	{sub:'сохран.',	t:'Сохранить рисунок в Локальное Хранилище, 2 последние позиции по очереди.'
},	load:	{sub:'загруз.',	t:'Вернуть рисунок из Локального Хранилища, 2 последние позиции по очереди. \n\
Может не сработать в некоторых браузерах, если не настроить автоматическую загрузку и показ изображений.'
},	read:	{sub:'зг.файл',	t:'Прочитать локальный файл. Может не сработать вообще, особенно при запуске самой рисовалки не с диска.'
},	done:	{sub:'готово',	t:'Завершить и отправить рисунок в сеть.'
},	info:	{sub:'помощь',	t:'Показать или скрыть информацию.'
}}};
else lang = {
	bad_id:		'Invalid case.'
,	flood:		'Canvas is empty.'
,	confirm_send:	'Send image to server?'
,	confirm_save:	'Save image to your Local Storage?'
,	confirm_load:	'Restore image from your Local Storage?'
,	found_swap:	'Found image at slot 2, swapped slots.'
,	no_LS:		'Local Storage not supported.'
,	no_form:	'Destination unavailable.'
,	no_change:	'Nothing changed.'
,	no_canvas:	'Your browser does not support HTML5 canvas.'
, tool: {	B:	'Shadow'
	,	O:	'Opacity'
	,	W:	'Width'
},	shape:		'Shape'
,	palette:	'Palette'
,	sat:		'Saturat.'
,	hex:		'Color'
,	hex_hint:	'Valid formats - #a, #f90, #ff9900, or 0,123,255'
,	hide_hint:	'Click to show/hide.'
,	info: ['Hot keys (mouse over image only):'
	,	[	'C / Mouse Mid = pick color from image'
		,	'Q / W / B / N / M = select shape'
		,	'1-10 / Mouse Wheel = brush width'
		,	'Ctrl + 1-10 / Wheel = brush opacity'
		,	'Alt + 1-10 / Wheel = brush shadow blur'
		,	'Autosave every minute, last saved:'
	],	'not yet'
	,	'sketch pad'
	,	'Time elapsed'
],	size:	'Image size'
,	size_hint: 'Number between '
, b: {	undo:	'Revert last change.'
,	redo:	'Redo next reverted change.'
,	fill:	'Fill image with main color.'
,	erase:	'Fill image with back color.'
,	invert:	'Invert image colors.'
,	flip_h:	{sub:'flip hor.',t:'Flip image horizontally.'
},	flip_v:	{sub:'flip ver.',t:'Flip image vertically.'
},	pencil:	'Set tool to sharp black.'
,	eraser:	'Set tool to large white.'
,	swap:	'Swap your tools.'
,	reset:	'Reset both tools.'
,	line:	'Draw straight line with 1 drag.'
,	curve:	'Smooth path corners / draw single curve with 2 drags.'
,	shape:	'Fill geometric shapes.'
,	shaper:	'Erase shape area to transparent.'
,	global:	'Move all layers at once.'
,	rect:	'Move rectangle.'
,	cursor:	'Brush preview on cursor.'
,	rough:	'Skip draw cleanup while drawing to use less CPU.'
,	fps:	'Limit FPS when drawing to use less CPU.'
,	png:	'Save image as PNG file.'
,	jpeg:	'Save image as JPEG file.'
,	save:	'Save image copy to your Local Storage, two slots in a queue.'
,	load:	'Load image copy from your Local Storage, two slots in a queue. \n\
May not work in some browsers until set to load and show new images automatically.'
,	read:	'Load image from your local file. May not work at all, especially if sketcher itself is not started from disk.'
,	done:	'Finish and send image to server.'
,	info:	'Show/hide information.'
}};
	return f;
}




document.addEventListener('DOMContentLoaded', this.init, false);
document.write(replaceAll(replaceAdd('\n<style>\
#| canvas {margin: 0; border: 1px solid #aaa; cursor: \
/* 3x3*/	url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAADCAYAAABWKLW/AAAAG0lEQVR42mNgYGD439DQ8B9EM4AYIAAVQMgAAFVYEfXw7aeiAAAAAElFTkSuQmCC\')\
, auto; /*-webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; -o-user-select: none; user-select: none;*/}\
#| input[type="text"] {width: 48px;}\
#| input[type="range"] {width: 156px; height: 16px; margin: 0; padding: 0;}\
#| select, #| #|-color-text {width: 78px;}\
#| {text-align: center; padding: 12px; background-color: #f8f8f8;}\
#|, #| input, #| select {font-family: "Arial"; font-size: 14pt;}\
#|-bottom > span {font-family: "Arial Unicode MS"; line-height: 7px; border: 1px solid #000; width: 32px; height: 32px; padding: 2px; cursor: pointer; text-align: center; display: inline-block;}\
#|-bottom {height: 30px; padding: 8px;}\
#|-info p {padding-left: 32px; line-height: 24px; margin: 0;}\
#|-info p, #|-palette-table table {color: #000; font-size: small;}\
#|-right span > input[type="text"] {margin: 2px;}\
#|-right table {border-collapse: collapse; margin-top: 7px;}\
#|-right td {padding: 0 2px; height: 32px;}\
#|-right {color: gray; width: 321px; margin: 0; margin-left: 5px; text-align: left; display: inline-block; vertical-align: top; overflow-x: hidden;}\
#|-palette-table .|-t {padding: 0 4px;}\
#|-palette-table table {margin: 0;}\
#|-palette-table td {margin: 0; padding: 0; height: 16px;}\
#|-palette-table {overflow-y: scroll; height: 171px; margin: 7px 0 12px 0;}\
#|-load {position: relative; display: inline-block;}\
#|-load img {position: absolute; top: 1px; left: 1px; margin: 0;}\
.|-L-close {padding-bottom: 24px; border-bottom: 1px solid #000; border-right: 1px solid #000;}\
.|-L-open {padding-top: 24px; border-top: 1px solid #000; border-left: 1px solid #000;}\
.|-button {background-color: #ddd;}\
.|-button-active {background-color: #ace;}\
.|-button-active:hover {background-color: #bef;}\
.|-button-disabled {color: gray; cursor: default;}\
.|-button-key, #|-debug {text-align: left;}\
.|-button-key, .|-button-subtitle {vertical-align: top; height: 10px; font-size: 9px; margin: 0; padding: 0;}\
.|-button-subtitle {margin: 0 -3px;}\
.|-button:hover {background-color: #eee;}\
.|-paletdark, .|-palettine {border: 2px solid transparent; height: 15px; width: 15px; cursor: pointer;}\
.|-paletdark:hover {border-color: #fff;}\
.|-palettine:hover {border-color: #000;}\
.|-r {text-align: right;}\
.|-a .|-a, .|-b .|-b, .|-c .|-c {display: none;}\
</style>', '}', '\n'), '|', NS)+'\n<div id="'+NS+'">Loading '+NS+'...</div>\n');
};