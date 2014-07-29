//* Global wrapper *-----------------------------------------------------------

var milf = new function () {
var	NS = 'milf'	//* <- namespace prefix, change here and above; BTW, tabs align to 8 spaces

//* Configuration *------------------------------------------------------------

,	INFO_VERSION = 'v1.2'
,	INFO_DATE = '2014-07-16 — 2014-07-30'
,	INFO_ABBR = 'Multi-Layer Fork of DFC'
,	A0 = 'transparent', IJ = 'image/jpeg'
,	CR = 'CanvasRecover', CT = 'Time', CL = 'Layers'
,	C1R, C1T, C1L, C2R, C2T, C2L
,	LS = window.localStorage || localStorage
,	DRAW_PIXEL_OFFSET = -0.5
,	DRAW_HELPER = {lineWidth: 1, shadowBlur: 0, shadowColor: A0, strokeStyle: 'rgba(123,123,123,0.5)'}

,	mode = {debug:	false
	,	shape:	false	//* <- straight line	/ fill area	/ copy
	,	step:	false	//* <- curve line	/ outline	/ move rect select
	,	lowQ:	false
	,	erase:	false
	,	brushView:	false
	,	limitFPS:	false
	,	autoSave:	true
	,	globalHistory:	false
	}, modes = [], modeL = 'DLUQEVFAG', flushCursor = false, neverFlushCursor = true

,	RANGE = {
		B: {min: 0   , max: 100, step: 1}
	,	O: {min: 0.01, max: 1  , step: 0.01}
	,	W: {min: 1   , max: 100, step: 1}
	}, BOW = ['blur', 'opacity', 'width'], BOWL = 'BOW'

,	TOOLS_REF = [
		{blur: 0, opacity: 1.00, width:  1, color: '0, 0, 0'}		//* <- draw
	,	{blur: 0, opacity: 1.00, width: 10, color: '255, 255, 255'}	//* <- back
	], tools = [{}, {}], tool = tools[0]

,	select = {
		imgRes: {width:640, height:360}
	,	imgLimits: {width:[64,640], height:[64,800]}
	,	lineCaps: {lineCap:0, lineJoin:0}
	,	shapeFlags: [1,10, 2,2,2, 4]
	,	options: {
			shape	: ['line', 'poly', 'rectangle', 'circle', 'ellipse', 'pan']
		,	lineCap	: ['round', 'butt', 'square']
		,	lineJoin: ['round', 'bevel', 'miter']
		,	palette	: ['history', 'auto', 'legacy', 'Touhou', 'gradient']
	}}

,	PALETTE_COL_COUNT = 16	//* <- used if no '\n' found, for example - unformatted history
,	palette = [(LS && LS.historyPalette) ? JSON.parse(LS.historyPalette) : ['#f']

//* '\t' = title, '\n' = line break + optional title, '\r' = special cases, '#f00' = hex color field, anything else = title + plaintext spacer
	, [	'#f', '#d', '#a', '#8', '#5', '#2', '#0',				'#a00', '#740', '#470', '#0a0', '#074', '#047', '#00a', '#407', '#704'
	, '\n',	'#7f0000', '#007f00', '#00007f', '#ff007f', '#7fff00', '#007fff', '#3', '#e11', '#b81', '#8b1', '#1e1', '#1b8', '#18b', '#11e', '#81b', '#b18'
	, '\n',	'#ff0000', '#00ff00', '#0000ff', '#ff7f00', '#00ff7f', '#7f00ff', '#6', '#f77', '#db7', '#bd7', '#7f7', '#7db', '#7bd', '#77f', '#b7d', '#d7b'
	, '\n',	'#ff7f7f', '#7fff7f', '#7f7fff', '#ffff00', '#00ffff', '#ff00ff', '#9', '#faa', '#eca', '#cea', '#afa', '#aec', '#ace', '#aaf', '#cae', '#eac'
	, '\n',	'#ffbebe', '#beffbe', '#bebeff', '#ffff7f', '#7fffff', '#ff7fff', '#c', '#fcc', '#fdc', '#dfc', '#cfc', '#cfd', '#cdf', '#ccf', '#dcf', '#fcd'

	], ['\tWin7'
	,	'#0', '#7f7f7f', '#880015', '#ed1c24', '#ff7f27', '#fff200', '#22b14c', '#00a2e8', '#3f48cc', '#a349a4'
	, '\n',	'#f', '#c3c3c3', '#b97a57', '#ffaec9', '#ffc90e', '#efe4b0', '#b5e61d', '#99d9ea', '#7092be', '#c8bfe7'
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
	, '\nClassic', '#000000', '#000080', '#008000', '#008080', '#800000', '#800080', '#808000', '#c0c0c0', '\tApple II', '#000000', '#7e3952', '#524689', '#df4ef2', '#1e6952', '#919191', '#35a6f2', '#c9bff9'
	, '\nClassic', '#808080', '#0000ff', '#00ff00', '#00ffff', '#ff0000', '#ff00ff', '#ffff00', '#ffffff', '\tApple II', '#525d0d', '#df7a19', '#919191', '#efb5c9', '#35cc19', '#c9d297', '#a2dcc9', '#ffffff'
	, '\nCGA', '#0', '#00a', '#0a0', '#0aa', '#a00', '#a0a', '#aa0', '#a', '\tMSX', '#0', '#0', '#3eb849', '#74d07d', '#5955e0', '#8076f1', '#b95e51', '#65dbef'
	, '\nCGA', '#5', '#55f', '#5f5', '#5ff', '#f55', '#f5f', '#ff5', '#f', '\tMSX', '#db6559', '#ff897d', '#ccc35e', '#ded087', '#3aa241', '#b766b5', '#c', '#f'
	, '\nIBM PC/XT CGA', '#000000', '#0000b6', '#00b600', '#00b6b6', '#b60000', '#b600b6', '#b66700', '#b6b6b6', '\tC-64', '#000000', '#ffffff', '#984a43', '#79c1c7', '#9b51a5', '#67ae5b', '#52429d', '#c9d683'
	, '\nIBM PC/XT CGA', '#676767', '#6767ff', '#67ff67', '#67ffff', '#ff6767', '#ff67ff', '#ffff67', '#ffffff', '\tC-64', '#9b6639', '#695400', '#c37b74', '#626262', '#898989', '#a3e599', '#897bcd', '#adadad'
	, '\nZX Spectrum', '#0', '#0000ca', '#00ca00', '#00caca', '#ca0000', '#ca00ca', '#caca00', '#cacaca', '\tVIC-20', '#000000', '#ffffff', '#782922', '#87d6dd', '#aa5fb6', '#55a049', '#40318d', '#bfce72'
	, '\nZX Spectrum', '#0', '#0000ff', '#00ff00', '#00ffff', '#ff0000', '#ff00ff', '#ffff00', '#ffffff', '\tVIC-20', '#aa7449', '#eab489', '#b86962', '#c7ffff', '#ea9ff6', '#94e089', '#8071cc', '#ffffb2'

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

	], '\rg']

//* Set up (don't change) *----------------------------------------------------

,	o12 = /^Opera.* Version\D*12\.\d+$/i.test(navigator.userAgent)
,	abc = 'abc'.split('')
,	regHex = /^#*[0-9a-f]{6}$/i
,	regHex3 = /^#*([0-9a-f])([0-9a-f])([0-9a-f])$/i
,	reg255 = /^([0-9]{1,3}),\s*([0-9]{1,3}),\s*([0-9]{1,3})$/
,	reg255split = /,\s*/
,	regTipBrackets = /[ ]*\([^)]+\)$/
,	regFunc = /\{[^.]+\.([^(]+)\(/
,	regLimit = /^(\d+)\D+(\d+)$/

,	self = this, outside = this.o = {}, lang, container
,	fps = 0, ticks = 0, timer = 0
,	interval = {fps:0, timer:0, save:0}, text = {debug:0, timer:0}
,	ctx = {}, cv = {view:0, draw:0, temp:0, lower:0, upper:0}
,	used = {}, cue = {upd:{}}, count = {layers:0, strokes:0}

,	draw = {o:{}, cur:{}, prev:{}
	,	refresh:0, time: [0, 0]
	,	line: {started:0, back:0, preview:0}
	,	history: {pos:0, last:0, layer:0, layers:[{show:1, color:'#f'}]
		,	cur: function() {
			var	t = this.layer;
				return (t && (t = this.layers[t]) ? t.data[t.pos] : 0);
			}
		,	act: function(i) {
			var	t = this.layer;
				if (!t) return 0;
		//* 0: Write: Refresh
		//* 1: Read: Back
		//* 2: Read: Forward
			var	t = this.layers[t], d = t.data.length - 1;
				if (i) {
					if (i < 0 && t.pos > 0) --t.pos; else
					if (i > 0 && t.pos < d && t.pos < t.last) ++t.pos; else return 0;
					draw.view(1);
					cue.autoSave = true;
					used.history = 'Undo';
				} else {
					if (i !== false) t.reversable = 0;
					else if (t.reversable) return 0;
					else t.reversable = 1, draw.view();
					if (i !== 0) {if (t.pos < d) t.last = ++t.pos; else for (i = 0; i < d; i++) t.data[i] = t.data[i+1];}
					t.data[t.pos] = ctx.draw.getImageData(0, 0, cv.view.width, cv.view.height);
				}
				return 1;
			}
		}
	,	preload: function(i) {
		var	y = this.history, c = y.layer, d = y.layers, a = (i
				? {	lower: [0,c-1]
				,	draw: [c,c]
				,	upper: [c+1,d.length-1]
				}
				: {	draw: [c,c]
				}
			), j, k, l, t;
			for (i in a) {
				ctx[i].clearRect(0, 0, cv.view.width, cv.view.height);
				for (j = a[i][0], l = a[i][1]; j <= l; j++) if ((t = d[j]).show) {
					if (!j) {
						ctx[i].fillStyle = t.color;
						ctx[i].fillRect(0, 0, cv.view.width, cv.view.height);
					} else
					if (k = t.data[t.pos]) {
						if (j == c) ctx[i].putImageData(k, 0, 0);
						else {
							ctx.temp.putImageData(k, 0, 0);
							ctx[i].globalAlpha = t.alpha/RANGE.A.max;
							ctx[i].drawImage(cv.temp, 0, 0);
						}
					}
				}
				ctx[i].globalAlpha = 1;
			}
		}
	,	view: function(i) {
			if (i) draw.preload(i === 2);
		var	y = this.history, c = y.layer, a = ['lower', 'draw', 'upper'];
			ctx.view.clearRect(0, 0, cv.view.width, cv.view.height);
			for (i in a) {
				ctx.view.globalAlpha = ((c && i == 1) ? y.layers[c].alpha/RANGE.A.max : 1);
				ctx.view.drawImage(cv[a[i]], 0, 0);
			}
		}
	};

function historyAct(i) {
	y = draw.history;
	if (y.act(i)) {
	var	d = y.layers, c = d.length, x = d[0].max, y, z;
	//* after loading saved layers stack, put them in saved order:
		if (x && (c == x)) {
			y.layer = c-1, x = [d[0]], delete d[0].max;
			while (--c) z = d[c], x[z.z] = z, delete z.z;
			y.layers = x;
		}
		updateDebugScreen(), updateLayers(!x), updateHistoryButtons();
	}
}

function updateHistoryButtons() {
var	y = draw.history, c = y.layer, y = y.layers[c], a = c?{R:y.last,U:0}:0, b = 'button', d = b+'-disabled', i;
	for (i in a) setClass(id(b+i), (!c || y.pos == a[i]) ?d:b);
	cue.upd = {J:1,P:1};
}

//* Layers, here for now *-----------------------------------------------------

function newLayer(load) {
	if (draw.active) drawEnd();
var	y = draw.history, c = y.layer, d = y.layers, z, u;
	if (!isNaN(load) && !c) return;
	if (load === -1) {
//* merge down
		if (c < 2) return;
		if (z = y.cur()) {
			d[c--].show = 0;
			if (u = d[c].data[d[c].pos]) ctx.draw.putImageData(u, 0, 0);
			else ctx.draw.clearRect(0, 0, cv.view.width, cv.view.height);
			ctx.temp.putImageData(z, 0, 0);
			ctx.draw.globalAlpha = d[y.layer--].alpha/RANGE.A.max;
			ctx.draw.drawImage(cv.temp, 0, 0);
			ctx.draw.globalAlpha = 1;
			historyAct();
			cue.autoSave = true;
		}
		return updateLayers(2);
	}
//* new
var	x = {pos:0, last:0, show:1, alpha:100, name: lang.layer.prefix+'_'+(++count.layers)};
	x.data = new Array(outside.undo);
	if (load === 1) {
//* copy
		draw.preload();
		x.data[0] = ctx.draw.getImageData(0, 0, cv.view.width, cv.view.height);
		x.name = d[c].name+' (2)';
	} else
//* saved
	if (load) for (z in {z:0, show:0, alpha:0, name:0}) if (z in load) x[z] = load[z];
//* clean otherwise
	d[y.layer = d.length] = x;
	if (!x.z) moveLayer(++c), updateLayers(0,1);
}

function moveLayer(pos) {
var	y = draw.history, c = y.layer, d = y.layers, u, x, z = d.length-1;
	if (!c) return 0;
//* input:
	if (isNaN(pos)) u = pos, pos = z;
	else if (pos < 0) pos = c-1;
	else if (pos == 0) pos = c+1;
//* clip:
	if (pos < 1) pos = 1; else
	if (pos > z) pos = z;
//* go:
var	i = 0, j = (c > pos ? -1:1);
	while (c != pos) x = d[c], d[c] = d[c+j], d[c += j] = x, i += j;
//* delete:
	if (u) y.layers.pop(), c = y.layer-1;

	return selectLayer(c,1), i;
}

function selectLayer(i, ui_rewrite, scroll) {
var	y = draw.history, x = y.layer, z = y.layers.length-1;
//* input:
	if (isNaN(i)	) x = z;
	else if (i >= 0	) x = i;
	else if (i == -1) --x;
	else if (i < 0	) ++x;
//* clip:
	if (x > z) x = z; else
	if (x < 0) x = 0;
//* show/hide:
	(z = id('sliderA')).style.display = (x?'':'none');
	(z = z.lastElementChild).value = (x?y.layers[x].alpha:RANGE.A.max);
//* go:
	if (y.layer != x || ui_rewrite) y.layer = x, updateSliders(z), updateLayers(!ui_rewrite, scroll);
}

function changeLayer(e,i,t) {
	if (draw.active) drawEnd();
var	d = draw.history.layers;
	if (t === 2) return d[i].show = (e.checked?1:0), draw.view(2);

var	v = d[i][t?'alpha':'name'] = e.value || e;
	if (t && i && (e = id('layer'+i)) && (e = e.lastElementChild.lastElementChild.previousSibling) && (e.textContent != v)) {
		e.textContent = v, draw.view();	//* <- additionally, redraws on slider mousemove, even without call here
	}
}

function updateLayers(ui_tweak, scroll) {
var	a, b = 'button', j, k, l = 'layer', e = id('layers'), rId = /^.*\D(\d+)$/
,	y = draw.history, c = y.layer, d = y.layers, i = d.length
,	h = y.layers[0].color = hex2fix(y.layers[0].color), hi = isRgbDark(hex2rgb(h))?'#fff':'#000';
	if (ui_tweak && id(l+0) && d[1]) {
//* DOM fix:
		j = e.getElementsByTagName('p'), k = j.length;
		while (k--) {
			a = d[parseInt(j[k].id.replace(rId, '$1'))];
			j[k].className = j[k].className.replace(b+'-active', b);
			i = j[k].getElementsByTagName('input');
			if (ui_tweak === 2 && !i[0].checked != !a.show) i[0].checked = !!a.show;
			if (i.length > 1) {
				if (i[1].value != a.name) i[1].value = a.name;
				i = j[k].firstElementChild.getElementsByTagName('i');
				if (i[2].textContent != a.alpha) i[2].textContent = a.alpha;
				if (i[3].textContent != (a = a.pos+'/'+a.last)) i[3].textContent = a;
			} else {
				i = j[k].getElementsByTagName('button')[0].style;
				i.backgroundColor = h;
				i.color = hi;
			}
		}
		if (i = id(l+c)) {
			i.className = i.className.replace(b, b+'-active');
		}
	} else {
//* HTML reset, slower, resets scroll:
		j = '<hr><div class="slide">', k = '<i title="';
		clearContent(e);
		while (i--) {
			a = d[i];
			j += (i?'':'</div><hr>')
			+'<p class="'+b+(i == c?'-active':'')
			+'" onClick="selectLayer('+i+')" id="'+l+i+'"><i>'+k+lang.layer.hint.check
			+'"><input type="checkbox" onChange="changeLayer(this,'+i+',2)"'+(a.show?' checked':'')+'></i><i>'
			+(i
			?	'<input type="text" onChange="changeLayer(this,'+i+')" value="'
				+a.name+'" title="'+lang.layer.hint.name+'"></i>'
				+k+lang.layer.hint.alpha+'">'+a.alpha+'</i>'
				+k+lang.layer.hint.undo+'">'+a.pos+'/'+a.last
			:	'<button class="rf" title="'+lang.layer.hint.bg+'" style="background-color:'
				+h+'; color: '+hi+';" onClick="bgColor(0);return false" onContextMenu="bgColor(1);return false">'
				+h+'</button>'+lang.layer.bg
			)+'</i></i></p>';
		}
		setContent(e, j), i = id(l+c);
	}
	if (i && scroll) i.scrollIntoView();	//* <- param: true=alignWithTop (default), false=bottom
	i = d.length-1, j = {U:i,T:i, D:1,B:1,M:1, C:0,E:0,H:0,V:0}, d = b+'-disabled';
	for (i in j) setClass(id(l+i), (!c || c == j[i]) ?d:b);
	updateHistoryButtons(), draw.view(2);
}

function bgColor(i) {
	draw.history.layers[0].color = rgb2hex(tools[i].color), updateLayers(1);
}

//* Generic funcs *------------------------------------------------------------

function repeat(t,n) {return new Array(n+1).join(t);}
function replaceAll(t,s,j) {return t.split(s).join(j);}
function replaceAdd(t,s,a) {return replaceAll(t,s,s+a);}

//* http://www.webtoolkit.info/javascript-trim.html
function ltrim(str, chars) {return str.replace(new RegExp('^['+(chars || '\\s')+']+', 'g'), '');}
function rtrim(str, chars) {return str.replace(new RegExp('['+(chars || '\\s')+']+$', 'g'), '');}
function trim(str, chars) {return ltrim(rtrim(str, chars), chars);}

function id(i) {return document.getElementById(NS+(i?'-'+i:''));}
function reId(e) {return e.id.slice(NS.length+1);}
function setId(e,id) {return e.id = NS+'-'+id;}
function setClass(e,c) {return e.className = c?replaceAdd(' '+c,' ',NS+'-').trim():'';}
function setEvent(e,onWhat,func) {return e.setAttribute(onWhat, NS+'.'+func);}
function setContent(e,c) {
var	a = ['class','id','onChange','onClick','onContextMenu'];
	for (i in a) c = replaceAdd(c, ' '+a[i]+'="', NS+(a[i][0]=='o'?'.':'-'));
	return e.innerHTML = c;
}
function clearContent(e) {while (e.childNodes.length) e.removeChild(e.lastChild);}	//* <- works without a blink, unlike e.innerHTML = '';
function toggleView(e) {if (!e.tagName) e = id(e); return e.style.display = (e.style.display?'':'none');}
function propSwap(a, b) {
var	r = {};
	for (i in b) r[i] = a[i], a[i] = b[i];
	return r;
}

//* Positioning *--------------------------------------------------------------

function getOffsetXY(e) {
var	x = 0, y = 0;
	while (e) {
		x += e.offsetLeft;
		y += e.offsetTop;
		e = e.offsetParent;
	}
	return {x:x, y:y};
}

function putInView(e,x,y) {
	if (isNaN(x)) {y = getOffsetXY(e); x = y.x; y = y.y;}
var	x0 = document.body.scrollLeft || document.documentElement.scrollLeft || 0
,	y0 = document.body.scrollTop || document.documentElement.scrollTop || 0;
	if (x < x0) x = x0; else if (x > (x0 += window.innerWidth - e.offsetWidth)) x = x0;
	if (y < y0) y = y0; else if (y > (y0 += window.innerHeight - e.offsetHeight)) y = y0;
	e.style.left = x+'px';
	e.style.top  = y+'px';
	return e;
}

function putOnTop(e) {
var	a = document.getElementsByTagName(e.tagName), i = a.length, zTop = 0, z;
	while (i--) if (zTop < (z = parseInt(a[i].style.zIndex))) zTop = z;
	e.style.zIndex = zTop+1;
	return e;
}

//* Drag and drop *------------------------------------------------------------

function dragStart(event) {
	event.stopPropagation();

var	e = event.target;
	while (!e.id) e = e.parentNode;
var	c = getOffsetXY(putOnTop(e));
	event.dataTransfer.setData('text/plain', e.id
	+','+	(event.pageX - parseInt(c.x))
	+','+	(event.pageY - parseInt(c.y))
	);
}

function dragMove(event) {
var	d = event.dataTransfer.getData('text/plain'), e;
	return (d
	&& (d.indexOf(NS) === 0)
	&& (d = d.split(',')).length === 3
	&& (e = document.getElementById(d[0]))
	)
	? putInView(e, event.pageX - parseInt(d[1]), event.pageY - parseInt(d[2]))
	: false;
}

function dragOver(event) {
	event.stopPropagation();
	event.preventDefault();

var	d = event.dataTransfer.files, e = (d && d.length);
	event.dataTransfer.dropEffect = (e ? 'copy' : 'move');
	if (!e) dragMove(event);
	return false;
}

function drop(event) {
	event.stopPropagation();
	event.preventDefault();

//* Move windows: you can actually drop simple text strings like "NS-info,0,0"
	if (dragMove(event)); else

//* Load images: from http://www.html5rocks.com/en/tutorials/file/dndfiles/
	if (window.FileReader) {
	var	d = event.dataTransfer.files, f, i = (d?d.length:0), j = i, k = 0, r;
		while (i--)
		if ((f = d[i]).type.match('image.*')) {
			++k;
			(r = new FileReader()).onload = (function(f) {
				return function(e) {
					sendPic(5, {
						name: f.name
					,	data: e.target.result
					});
				};
			})(f);
			r.readAsDataURL(f);
		}
		if (j && !k) alert(lang.no_files);
	}
	return false;
}

//* Specific funcs *-----------------------------------------------------------

function updatePalette() {
var	pt = id('colors'), c = select.palette.value, p = palette[c];
	if (LS) LS.lastPalette = c;
	clearContent(pt);

	if (p[0] == '\r') {
		c = p[1];
		if (c == 'g') {
			c = document.createElement('canvas'), c.ctx = c.getContext('2d'), c.width = 300, c.height = 133;
		var	hues = [[255,  0,  0]
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

			(c.updateSat = function (sat) {
			var	x = c.width, y = c.height, y2 = Math.floor(y/2), h, i, j, k = Math.ceil(c.width/l)
			,	d = c.ctx.createImageData(x, y);
				while (x--) {
					h = linearBlend(hues[y = Math.floor(x/k)], hues[(y+1)%l], x%k, k);
					if (!isNaN(sat)) h = linearBlend(bw[1], h, sat, RANGE.S.max);
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
				c.ctx.putImageData(d, 0, 0);
			})();

			c.setAttribute('onscroll', f);
			c.setAttribute('oncontextmenu', f);
			c.addEventListener('mousedown', function (event) {pickColor(0, c, event || window.event);}, false);
			setId(c, 'gradient');
			setContent(pt, getSlider('S'));
			setSlider('S');
		} else c = 'TODO';
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
					c = hex2fix(c) || '#000';
					setClass(fill = document.createElement('div'), isRgbDark(hex2rgb(c)) ? 'paletdark' : 'palettine');
					setEvent(fill, 'onclick', 'updateColor("'+c+'",0);');
					setEvent(fill, 'oncontextmenu', 'updateColor("'+c+'",1); return false;');
					fill.title = c+(t?(' ('+t+')'):'');
					td.style.backgroundColor = c;
					td.appendChild(fill);		//* <- color field
				} else if (c) {
					td.textContent = t = c;		//* <- title + text field
					setClass(td, 'text');
				}
				tr.appendChild(td);			//* <- otherwise - empty spacer
				if (autoRows) --colCount;
			}
		}
		tbl.appendChild(tr);
		pt.appendChild(tbl);
	}
}

function fpsCount() {fps = ticks; ticks = 0;}
function updateDebugScreen() {
	if (!mode.debug) return;
	ticks ++;
var	t = '</td><td>', r = '</td></tr>	<tr><td>', a, b = 'turn: ', c = draw.step, i;
	if (a = draw.turn) for (i in a) b += i+'='+a[i]+'; ';
	text.debug.innerHTML = '<table><tr><td>'
+draw.refresh+t+'1st='+draw.time[0]+t+'last='+draw.time[1]+t+'fps='+fps
+r+'Relative'+t+'x='+draw.o.x+t+'y='+draw.o.y+(isMouseIn()?t+'rgb='+pickColor(1):'')
+r+'DrawOfst'+t+'x='+draw.cur.x+t+'y='+draw.cur.y+t+'btn='+draw.btn
+r+'Previous'+t+'x='+draw.prev.x+t+'y='+draw.prev.y+t+'chain='+mode.click+(c?''
+r+'StpStart'+t+'x='+c.prev.x+t+'y='+c.prev.y
+r+'Step_End'+t+'x='+c.cur.x+t+'y='+c.cur.y:'')+'</td></tr></table>'+b;
}

function updateViewport(delta) {
var	i, t = '', p = ['-moz-','-webkit-','-o-',''];
	if (isNaN(delta)) draw.angle = 0, draw.pan = 0, draw.zoom = 1, t = 'none';
	else
	if (draw.turn.pan) {
		draw.pan = {};
		for (i in draw.o) draw.pan[i] = draw.o[i] - draw.turn.origin[i] + draw.turn.prev[i];
	} else
	if (draw.turn.zoom) {
		i = draw.turn.prev * (draw.turn.origin + delta) / draw.turn.origin;
		if (i > 4) i = 4; else
		if (i < .25) i = .25;
		draw.zoom = i;
	} else {
		draw.angle = draw.turn.prev + delta;
		draw.a360 = Math.floor(draw.angle*180/Math.PI)%360;
		draw.arad = draw.a360/180*Math.PI;
	}
	if (draw.pan) t += 'translate('+draw.pan.x+'px,'+draw.pan.y+'px)';
	if (draw.angle) t += 'rotate('+draw.a360+'deg)';
	if (draw.zoom != 1) t += 'scale('+(draw.zoom)+')';
	for (i in p) cv.view.style[p[i]+'transform'] = t;	//* <- not working in opera11.10, though should be possible
	updateDebugScreen();
}

function updatePosition(event) {
var	i, o = ((select.shapeFlags[select.shape.value] & 4) || ((draw.active?ctx.draw.lineWidth:tool.width) % 2) ? DRAW_PIXEL_OFFSET : 0);	//* <- not a 100% fix yet
	draw.o.x = event.pageX - draw.container.offsetLeft;
	draw.o.y = event.pageY - draw.container.offsetTop;
	if (draw.pan && !(draw.turn && draw.turn.pan)) for (i in draw.o) draw.o[i] -= draw.pan[i];
	if (!draw.turn && (draw.angle || draw.zoom != 1)) {
	var	r = getCursorRad(2, draw.o.x, draw.o.y);
		if (draw.angle) r.a -= draw.arad;
		if (draw.zoom != 1) r.d /= draw.zoom;
		draw.o.x = Math.cos(r.a)*r.d + cv.view.width/2;
		draw.o.y = Math.sin(r.a)*r.d + cv.view.height/2;
		o = 0;
	}
	for (i in draw.o) draw.cur[i] = o + draw.o[i];
}

function getCursorRad(r, x, y) {
	if (draw.turn.pan) return {x: draw.o.x, y: draw.o.y};
	x = (isNaN(x) ? draw.cur.x : x) - cv.view.width/2;
	y = (isNaN(y) ? draw.cur.y : y) - cv.view.height/2;
	return (r
	? {	a:Math.atan2(y, x)
	,	d:Math.sqrt(x*x+y*y)	//* <- looks stupid, will do for now
	}
	: (draw.turn.zoom
		? Math.sqrt(x*x+y*y)
		: Math.atan2(y, x)
	));
}

function drawCursor() {
	if (mode.brushView) {
		ctx.draw.fillStyle = 'rgba('+tool.color+', '+tool.opacity+')';
		ctx.draw.shadowColor = ((ctx.draw.shadowBlur = tool.blur) ? 'rgb('+tool.color+')' : A0);
	} else {
		ctx.draw.strokeStyle = 'rgb(123,123,123)';
		ctx.draw.shadowColor = A0;
		ctx.draw.shadowBlur = 0;
		ctx.draw.lineWidth = 1;
	}
	ctx.draw.beginPath();
	ctx.draw.arc(draw.cur.x, draw.cur.y, tool.width/2, 0, 7/*Math.PI*2*/, false);
	mode.brushView ? ctx.draw.fill() : ctx.draw.stroke();
	if (!neverFlushCursor) flushCursor = true;
}

function drawStart(event) {
	if (!isMouseIn()) return false;
	cv.view.focus();
	event.preventDefault();
	event.stopPropagation();
	event.cancelBubble = true;

//* Special actions:
	if (draw.btn && (draw.btn != event.which)) return drawEnd();
	if (mode.click) return ++mode.click, drawEnd(event);
	if (event.altKey) draw.turn = {prev: draw.zoom, zoom: 1}; else
	if (event.ctrlKey) draw.turn = {prev: draw.angle, angle: 1}; else
	if (event.shiftKey) draw.turn = {prev: draw.pan ? {x: draw.pan.x, y: draw.pan.y} : {x:0,y:0}, pan: 1};
	if (mode.debug && draw.turn && !draw.turn.pan) {
		for (i in DRAW_HELPER) ctx.view[i] = DRAW_HELPER[i];
		ctx.view.beginPath();
		ctx.view.moveTo(draw.o.x, draw.o.y);
		ctx.view.lineTo(draw.cur.x, draw.cur.y);
		ctx.view.lineTo(cv.view.width/2, cv.view.height/2);
		ctx.view.stroke();
	}
	updatePosition(event);
	if (draw.turn) return draw.turn.origin = getCursorRad();

//* Drawing on cv.view:
var	y = draw.history, i = y.layer;
	if (!i || !y.layers[i].show) return false;

var	sf = select.shapeFlags[select.shape.value];
	if (draw.step) {
		if (mode.step && ((mode.shape && (sf & 1)) || (sf & 4))) {
			for (i in draw.o) draw.prev[i] = draw.cur[i];
			return draw.step.done = 1;
		} else draw.step = 0;
	}
//	if (event.shiftKey) mode.click = 1;	//* <- draw line/form chains, badly, forget for now

	if ((draw.btn = event.which) != 1 && draw.btn != 3) pickColor();
	else {
		draw.active = 1, y = {draw:0, temp:0};
		if (!draw.time[0]) draw.time[0] = draw.time[1] = +new Date();
		if (!interval.timer) {
			interval.timer = setInterval(timeElapsed, 1000);
			interval.save = setInterval(autoSave, 60000);
		}
		for (i in draw.o) draw.prev[i] = draw.cur[i];
		for (i in draw.line) draw.line[i] = false;
		for (i in select.lineCaps) {
			t = select.options[i][select[i].value];
			for (j in y) ctx[j][i] = t;
		}
	var	i = (event.which == 1 ? 1 : 0), j, t = tools[1-i]
	,	pf = ((sf & 8) && (mode.shape || !mode.step))
	,	fig = ((sf & 2) && (mode.shape || pf));
		for (i in (t = {
			lineWidth: (((sf & 4) || (pf && !mode.step))?1:t.width)
		,	fillStyle: (fig ? 'rgba('+(mode.step?tools[i]:t).color+', '+t.opacity+')' : A0)
		,	strokeStyle: (fig && !(mode.step || pf) ? A0 : 'rgba('+t.color+', '+((sf & 4)?(draw.step?0.33:0.66):t.opacity)+')')
		,	shadowColor: (t.blur ? 'rgb('+t.color+')' : A0)
		,	shadowBlur: t.blur
		})) for (j in y) ctx[j][i] = t[i];
		ctx.draw.beginPath();
		ctx.draw.moveTo(draw.cur.x, draw.cur.y);
	}
}

function drawMove(event) {
	if (mode.click == 1 && !event.shiftKey) return mode.click = 0, drawEnd(event);

	updatePosition(event);
	if (draw.turn) return updateViewport(draw.turn.pan?1:draw.turn.delta = getCursorRad() - draw.turn.origin);

var	redraw = true, s = select.shape.value, sf = select.shapeFlags[s]
,	newLine = (draw.active && !((mode.click == 1 || mode.shape || !(sf & 1)) && !(sf & 8)));

	if (mode.click) mode.click = 1;
	if (newLine) {
		if (draw.line.preview) {
			drawShape(ctx.draw, s);
		} else
		if (draw.line.back = mode.step) {
			if (o12) ctx.draw.shadowColor = A0, ctx.draw.shadowBlur = 0;	//* <- shadow, once used with CurveTo + stroke(), totally breaks for given cv.view in Opera 12
			if (draw.line.started) ctx.draw.quadraticCurveTo(draw.prev.x, draw.prev.y, (draw.cur.x + draw.prev.x)/2, (draw.cur.y + draw.prev.y)/2);
		} else ctx.draw.lineTo(draw.cur.x, draw.cur.y);
		draw.line.preview =	!(draw.line.started = true);
	} else if (draw.line.back) {
		ctx.draw.lineTo(draw.prev.x, draw.prev.y);
		draw.line.back =	!(draw.line.started = true);
	}
	if (mode.limitFPS) {
	var	t = +new Date();
		if (t-draw.refresh > 30) draw.refresh = t; else redraw = false;		//* <- put "> 1000/N" to redraw maximum N FPS
	}
	if (redraw) {
		redraw = 0;
		if ((flushCursor || neverFlushCursor) && !(mode.lowQ && draw.active)) draw.preload(), ++redraw;
		if (draw.active) {
			if ((mode.click == 1 || mode.shape || !(sf & 1)) && !(sf & 8)) {
				draw.line.preview = true;
				if (mode.erase && (sf & 2)) {
					ctx.draw.beginPath();
					drawShape(ctx.draw, s, 1);				//* <- erase shape area
				} else {
					ctx.temp.clearRect(0, 0, cv.view.width, cv.view.height);
					ctx.temp.beginPath();
					drawShape(ctx.temp, (mode.step && (sf & 4) && (!draw.step || !draw.step.done))?2:s);
					ctx.temp.stroke();
					ctx.draw.drawImage(cv.temp, 0, 0), ++redraw;
				}
			} else
			if (draw.line.started) ctx.draw.stroke(), ++redraw;
		} else if (neverFlushCursor && !mode.lowQ && isMouseIn()) drawCursor(), ++redraw;
		updateDebugScreen();
		if (redraw) draw.view();
	}
	if (newLine) for (i in draw.o) draw.prev[i] = draw.cur[i];
}

function drawEnd(event) {
	if (!event || draw.turn) return draw.active = draw.step = draw.btn = draw.turn = 0;
	if (mode.click == 1 && event.shiftKey) return drawMove(event);
	if (draw.active) {
	var	s = select.shape.value, sf = select.shapeFlags[s], m = ((mode.click == 1 || mode.shape || !(sf & 1)) && !(sf & 8));
		if (!draw.step && mode.step && ((mode.shape && (sf & 1)) || (sf & 4))) {
			draw.step = {
				prev:{x:draw.prev.x, y:draw.prev.y}
			,	cur:{x:draw.cur.x, y:draw.cur.y}
			};	//* <- normal straight line as base
			return;
		}
		for (i in DRAW_HELPER) ctx.temp[i] = DRAW_HELPER[i];
		draw.time[1] = +new Date();
		draw.preload();
		if (mode.erase) {
			if (sf & 8) {
				ctx.draw.closePath();
				ctx.draw.save();
				ctx.draw.clip();
				ctx.draw.clearRect(0, 0, cv.view.width, cv.view.height);
				ctx.draw.restore();
			} else
			drawShape(ctx.draw, s, 1);
		} else {
			ctx.draw.fillStyle = ctx.temp.fillStyle;
			if (sf & 8) {
				ctx.draw.closePath();
				if (mode.shape || !mode.step) ctx.draw.fill();
				used.poly = 'Poly';
			} else
			if (m && draw.line.preview) {
				drawShape(ctx.draw, s);
				if (!(sf & 4)) used.shape = 'Shape';
			} else
			if (m || draw.line.back || !draw.line.started) {//* <- draw 1 pixel on short click, regardless of mode or browser
				ctx.draw.lineTo(draw.cur.x, draw.cur.y + (draw.cur.y == draw.prev.y ? 0.01 : 0));
			}
			if (sf & 4) used.move = 'Move';
			else if (!(sf & 8) || mode.step) {
				ctx.draw.stroke();
				++count.strokes;
			}
		}
		historyAct();
		cue.autoSave = true;
		draw.active = draw.step = draw.btn = 0;
		if (mode.click && event.shiftKey) return mode.click = 0, drawStart(event);
	}
	updateDebugScreen();
}

function drawShape(c, i, clear) {
var	s = draw.step, r = draw.cur, v = draw.prev;
	switch (parseInt(i)) {
	//* rect
		case 2:	if (s) {
			//* show pan source area
				c.strokeRect(s.prev.x, s.prev.y, s.cur.x-s.prev.x, s.cur.y-s.prev.y);
			} else if (clear) ctx.draw.clearRect(v.x, v.y, r.x-v.x, r.y-v.y);
			else {
				if (c.fillStyle != A0)
				c.fillRect(v.x, v.y, r.x-v.x, r.y-v.y);
				c.strokeRect(v.x, v.y, r.x-v.x, r.y-v.y);
			}
			break;
	//* circle
		case 3:
		var	xCenter = (v.x+r.x)/2
		,	yCenter = (v.y+r.y)/2
		,	radius = Math.sqrt(Math.pow(r.x-xCenter, 2) + Math.pow(r.y-yCenter, 2));
			c.moveTo(xCenter+radius, yCenter);
			c.arc(xCenter, yCenter, radius, 0, 7, false);
			if (clear) {
				ctx.draw.save();
				ctx.draw.clip();
				ctx.draw.clearRect(0, 0, cv.view.width, cv.view.height);
				ctx.draw.restore();
			} else if (c.fillStyle != A0) c.fill();
			c.moveTo(r.x, r.y);
			break;
	//* ellipse
		case 4:
		var	xCenter = (v.x+r.x)/2
		,	yCenter = (v.y+r.y)/2
		,	xRadius = Math.abs(r.x-xCenter)
		,	yRadius = Math.abs(r.y-yCenter), qx = 1, qy = 1;
			if (xRadius > 0 && yRadius > 0) {
				c.save();
				if (xRadius > yRadius) c.scale(1, qy = yRadius/xRadius); else
				if (xRadius < yRadius) c.scale(qx = xRadius/yRadius, 1);
				c.moveTo((xCenter+xRadius)/qx, yCenter/qy);
				c.arc(xCenter/qx, yCenter/qy, Math.max(xRadius, yRadius), 0, 7, false);
				c.restore();
				if (clear) {
					ctx.draw.save();
					ctx.draw.clip();
					ctx.draw.clearRect(0, 0, cv.view.width, cv.view.height);
					ctx.draw.restore();
				} else if (c.fillStyle != A0) c.fill();
			}
			c.moveTo(r.x, r.y);
			break;
	//* pan
		case 5:	if (v.x != r.x
			|| (v.y != r.y)) moveScreen(r.x-v.x, r.y-v.y);
			break;
	//* line
		default:if (s) {
			var	d = r, old = propSwap(ctx.temp, DRAW_HELPER);
				ctx.temp.beginPath();
				if (s.prev.x != v.x || s.prev.y != v.y) {
					ctx.temp.moveTo(d.x, d.y);
					d = v;
					ctx.temp.lineTo(d.x, d.y);
				}
				ctx.temp.moveTo(s.cur.x, s.cur.y);
				ctx.temp.lineTo(s.prev.x, s.prev.y);
				ctx.temp.stroke();
				propSwap(ctx.temp, old);
				ctx.temp.beginPath();
		//* curve
				c.moveTo(s.prev.x, s.prev.y);
				c.bezierCurveTo(s.cur.x, s.cur.y, d.x, d.y, r.x, r.y);
			} else {
		//* straight
				c.moveTo(v.x, v.y);
				c.lineTo(r.x, r.y);
			}
	}
}

function moveScreen(x, y) {
var	d = draw.history.cur(), p = draw.step, n = !mode.shape;
	ctx.temp.clearRect(0, 0, cv.view.width, cv.view.height);
	if (p) {
		for (i in {min:0,max:0}) p[i] = {
			x:Math[i](p.cur.x, p.prev.x)
		,	y:Math[i](p.cur.y, p.prev.y)
		};
		p.max.x -= p.min.x;
		p.max.y -= p.min.y;
		if (n) ctx.draw.clearRect(p.min.x, p.min.y, p.max.x, p.max.y);
		ctx.temp.putImageData(d, x, y, p.min.x, p.min.y, p.max.x, p.max.y);
	} else {
		if (n) ctx.draw.clearRect(0, 0, cv.view.width, cv.view.height);
		ctx.temp.putImageData(d, x, y);
	}
	ctx.draw.drawImage(cv.temp, 0, 0);
}

function fillCheck() {
var	d = ctx.view.getImageData(0, 0, cv.view.width, cv.view.height), i = d.data.length;
	while (--i) if (d.data[i] != d.data[i%4]) return 0; return 1;		//* <- 1 for fill flood confirmed
}

function fillScreen(i) {
	if (!draw.history.layer) {
		if (!isNaN(i) && i >= -1) x = draw.history.layers[0], x.color = (i < 0 ? hex2inv(x.color) : rgb2hex(tools[i].color));
		return updateLayers();
	}
	if (isNaN(i) || i > 0) {
		used.wipe = 'Wipe';
		ctx.draw.clearRect(0, 0, cv.view.width, cv.view.height);
	} else
	if (i < 0) {
		historyAct(false);
	var	d = draw.history.cur();
		if (i == -1) {
			used.inv = 'Invert';
			i = d.data.length;
			while (i--) if (i%4 != 3) d.data[i] = 255 - d.data[i];	//* <- modify current history point, no push
		} else {
		var	hw = d.width, hh = d.height, w = cv.view.width, h = cv.view.height
		,	hr = (i == -2), j, k, l = (hr?w:h)/2, m, n, x, y;
			if (hr) used.flip_h = 'Hor.Flip';
			else	used.flip_v = 'Ver.Flip';
			x = cv.view.width; while (x--) if ((!hr || x >= l) && x < hw) {
			y = cv.view.height; while (y--) if ((hr || y >= l) && y < hh) {
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
		ctx.draw.putImageData(d, 0, 0);
		return;
	} else {
		used.fill = 'Fill';
		ctx.draw.fillStyle = 'rgb(' + tools[i].color + ')';
		ctx.draw.fillRect(0, 0, cv.view.width, cv.view.height);
	}
	cue.autoSave = false;
	historyAct();
}

function pickColor(keep, c, event) {
	if (c) {
	var	d = c.ctx.getImageData(0, 0, c.width, c.height), o = getOffsetXY(c);
		c = (event.pageX - o.x
		+   (event.pageY - o.y)*c.width)*4;
	} else {
		d = draw.history.cur() || ctx.view.getImageData(0, 0, cv.view.width, cv.view.height);
		c = (Math.floor(draw.o.x) + Math.floor(draw.o.y)*cv.view.width)*4;
	}
	c = (d.data[c]*65536 + d.data[c+1]*256 + d.data[c+2]).toString(16);
	while (c.length < 6) c = '0'+c; c = '#'+c;
	return keep ? c : updateColor(c, event);
}

function hex2fix(v) {
	v = '#'+trim(v, '#');
	if (v.length == 2) v += repeat(v[1], 5); else
	if (regHex3.test(v)) v = v.replace(regHex3, '#$1$1$2$2$3$3');
	return regHex.test(v) ? v.toLowerCase() : false;
}

function hex2inv(v) {
	if (v = hex2fix(v)) {
	var	a = '0123456789abcdef', i = '', j = v.length, k, l = a.length;
		while (--j) {k = l; while (k--) if (v[j] == a[k]) {i = a[l-k-1]+i; break;}}
		return '#'+i;
	}
	return false;
}

function hex2rgb(v) {
	if (!regHex.test(v)) return '0,0,0';
	v = trim(v, '#');
	return parseInt(v.substr(0,2), 16)
	+', '+ parseInt(v.substr(2,2), 16)
	+', '+ parseInt(v.substr(4,2), 16);
}

function rgb2hex(v) {
	if (!reg255.test(v)) return false;
	v = v.split(reg255split);
var	x = '#', i;
	for (i in v) x += ((v[i] = parseInt(v[i]).toString(16)).length == 1) ? '0'+v[i] : v[i];
	return x;
}

function isRgbDark(v) {
var	a = v.split(reg255split), v = 0, i;
	for (i in a) v += parseInt(a[i]);
	return v < 380;
}

function updateColor(value, i) {
var	t = tools[(!i || (isNaN(i) && i.which != 3))?0:1]
,	c = id('color-text')
,	v = value || c.value;

//* check format:
	if (i = rgb2hex(v)) {
		t.color = v, v = i;
	} else
	if (v = hex2fix(v)) {
		if (value != '') t.color = hex2rgb(v);
	} else return c.style.backgroundColor = 'red';

	if (t == tool) c.value = v, c.style.backgroundColor = '';

//* put on top of history palette:
var	p = palette[0], found = p.length;
	for (i = 0; i < found; i++) if (p[i] == v) found = i;
	if (found) {
		i = Math.min(found+1, PALETTE_COL_COUNT*9);		//* <- history length limit
		while (i--) p[i] = p[i-1];
		p[0] = v;
		if (0 == select.palette.value) updatePalette();
		if (LS) LS.historyPalette = JSON.stringify(p);
	}

//* update buttons:
	i = id((t == tool) ? 'colorF' : 'colorB');
	i.style.color = (isRgbDark(t.color) ? '#fff' : '#000');		//* <- inverted font color
	i.style.background = 'rgb(' + t.color + ')';
	return v;
}

function getSlider(b) {
var	i, g = RANGE[b], c = '<i id="slider'+b+'"><input type="range" id="range'+b+'" onChange="updateSliders(this)';
	for (i in g) c += '" '+i+'="'+g[i];
	return c+'" value="'+g.max+'"><span> '+lang.tool[b]+'</span></i><br>';
}

function setSlider(b) {
var	r = 'range', s = 'slider', t = 'text', c = id(r+b), d,e;
	if (c.type != r) c.type = t;
	else {
		setClass(d = document.createElement('i'), s);
		d.textContent = (e = (r = id(s+b)).lastElementChild).textContent;
		r.removeChild(e);
		r.insertBefore(d, r.firstElementChild);

		d = document.createElement('input');
		setId(d, (d.type = t)+b);
		setEvent(d, 'onchange', 'updateSliders(this)');
		d.value = c.value;
		r.appendChild(d);
	}
}

function updateSlider(i,e) {
var	j = (e?i:BOWL[i])
,	s = id('range'+j)
,	t = id('text'+j) || s
,	r = (e?s:RANGE[j]), v = (e?parseFloat(e.value):tool[i = BOW[i]]);
	if (v < r.min) v = r.min; else
	if (v > r.max) v = r.max;
	if (r.step < 1) v = parseFloat(v).toFixed(2);
	if (e) {
		if (i == 'A') changeLayer(v, draw.history.layer, 1); else
		if (i == 'S') (e = id('gradient')) ? e.updateSat(v) : alert('sat: '+v);
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
			ctx.draw.putImageData(draw.history.cur(), 0, 0, draw.o.x - s/2, draw.o.y - s/2, s, s);
			drawCursor();
		}
	}
}

function updateShape(s) {
	if (!isNaN(s)) select.shape.value = s, s = 0;
	s = select.shapeFlags[(s?s:s=select.shape).value];
var	a = id('warn'), b = a.firstElementChild, c = [], i;
	for (i in abc) if (!(s & (1<<i))) c.push(abc[i]);
	setClass(a, (mode.erase = !(mode.shape || mode.step || !(s & 2)))?'red':'');
	setClass(container, s = c.join(' '));
	do {
		c = b.firstElementChild;
		do {
			if (s.indexOf(c.className.slice(NS.length+1)) < 0) {b.title = c.title; break;}
		} while (c = c.nextSibling);
	} while (b = b.nextSibling);	//* <- because <button><div title></button> won't show tooltip
}

function updateSaveFileSize(e) {
var	i = e.id.slice(-1);
	if (cue.upd[i]) cue.upd[i] = 0,
	e.title = e.title.replace(regTipBrackets, '')+' ('+(cv.view.toDataURL({J:IJ,P:''}[i]).length / 1300).toFixed(0)+' KB)';
}

function updateDim(i) {
	if (i) {
	var	a = id('img-'+i), b, c = cv.view[i], j, v = parseInt(a.value) || 0;
		a.value = v = (
			v < (b = select.imgLimits[i][0]) ? b : (
			v > (b = select.imgLimits[i][1]) ? b : v)
		);
		for (j in cv) cv[j][i] = v;
		if (v > c) {
		//	draw.view();
			historyAct(0);
		}
	}
	container.style.minWidth = (v = cv.view.width)+'px';
	if (a = outside.restyle) {
		v += 24;
		if (!(c = id(i = 'restyle'))) setId(container.parentNode.insertBefore(c = document.createElement('style'), container), i);
		if ((b = outside.restmin) && ((b = eval(b).offsetWidth) > v)) v = b;
		c.innerHTML = a+'{max-width:'+v+'px;}';
	}
}

function toolTweak(prop, value) {
	for (i in BOW) if (prop == BOWL[i]) {
	var	b = BOW[i];
		if (value > 0) tool[b] = value;
		else {
		var	v = new Number(tool[b]), s = RANGE[prop].step;
			tool[b] = (value ? v-s : v+s);
		}
		return updateSliders(i);
	}
}

function toolSwap(t) {
//* exchange working sets
	if (isNaN(t)) {
		t = tools[0];
		tool = tools[0] = tools[1];
		tools[1] = t;
	} else
//* restore front set to one of defaults, line shape
	if (t > 0) {
		t = TOOLS_REF[t-1];
		for (i in t) tool[i] = t[i];
		updateShape(0);
	} else
//* drop switches, set shape
	if (t) {
		if (mode.shape) toggleMode(1);
		if (mode.step) toggleMode(2);
		if (t == -2) tool.width = tool.opacity = 1, tool.blur = 0, updateColor(tool.color = '#888');
		return updateShape(-t-1);
//* restore all defaults
	} else {
		for (t in TOOLS_REF)
		for (i in TOOLS_REF[t]) tools[t][i] = TOOLS_REF[t][i];
		for (i in select.lineCaps) select[i].value = 0;
		toolSwap(-1);
		tool.width = 3; //* <- arbitrary default
	}
	updateColor(tool.color);
	updateColor(0,1);
	updateSliders();
}

function toggleMode(i, keep) {
	if (i >= 0 && i < modes.length) {
	var	n = modes[i], v = mode[n];
		if (!keep) v = mode[n] = !v;
		if (e = id('check'+modeL[i])) {
			setClass(e, v ? 'button-active' : 'button');
			if (e.parentNode.id == NS+'-warn') updateShape();
		}
		if (n == 'debug') {
			text.debug.textContent = '';
			interval.fps ? clearInterval(interval.fps) : (interval.fps = setInterval(fpsCount, 1000));
		}
	} else alert(lang.bad_id);
}

//* Save, load, send picture *-------------------------------------------------

function unixDateToHMS(t,u,y) {
var	d = (t ? new Date(t+(t > 0 ? 0 : new Date())) : new Date());
	t = ['Hours','Minutes','Seconds'];
	u = 'get'+(u?'UTC':'');
	if (y) t = ['FullYear','Month','Date'].concat(t);
	for (i in t) if ((t[i] = d[u+t[i]]()+(y && i == 1?1:0)) < 10) t[i] = '0'+t[i];
	return y ? t[0]+'-'+t[1]+'-'+t[2]+' '+t[3]+':'+t[4]+':'+t[5] : t.join(':');
}

function timeElapsed() {text.timer.textContent = unixDateToHMS(timer += 1000, 1);}
function autoSave() {if (mode.autoSave && cue.autoSave) {sendPic(2,true); cue.autoSave = false;}}

function getSendMeta() {
var	i, j = [], d = [], t = outside.t0;
	for (i in draw.time) d[i] = parseInt(draw.time[i]) || (i > 0?+new Date():t);
	for (i in count) if (count[i] > 1) j.push(count[i]+' '+i);
	for (i in used) j.push(used[i]);
	return Math.floor(t/1000)+','+d.join('-')+','+NS+' '+INFO_VERSION + (j.length?' (used '+j.join(', ')+')':'');
}

function sendPic(dest, auto) {
var	a = auto || false, b, c, d, e, f, i, t;
	draw.view(1);
	switch (dest) {
	case 0:
	case 1: window.open(c = cv.view.toDataURL(dest?IJ:''), '_blank');
		break;
//* save project
	case 2:
		if (fillCheck()) return a?c:alert(lang.flood);
		c = cv.view.toDataURL();
		if (!LS) return a?c:alert(lang.no_LS);
		d = LS[C1R];
		if (d == c) return a?c:alert(lang.no_change);
		t = LS[C1T], e = LS[C2R] || 0;
		if (!a && e == c) {
			LS[C1R] = e;
			LS[C1T] = LS[C2T];
			LS[C2R] = d;
			LS[C2T] = t;
			e = LS[C1L];
			LS[C1L] = LS[C2L];
			LS[C2L] = e;
			alert(lang.found_swap);
		} else
		if (a || confirm(lang.confirm_save)) {
			if (LS[C1T]) {
				LS[C2R] = d;
				LS[C2T] = t;
				LS[C2L] = LS[C1L];
			}
			LS[C1R] = c;
			LS[C1T] = t = draw.time.join('-')+(used.read?'-'+used.read:'');
			a = draw.history.layers, b = {time: t, layers: []};
			for (i in a) {
				d = {};
				for (t in a[i]) if (t != 'pos' && t != 'last') {
					if (t == 'data' && (f = a[i][t][a[i].pos])) {
						ctx.temp.putImageData(f, 0, 0);
						d[t] = cv.temp.toDataURL();
					} else d[t] = a[i][t] || 0;
				}
				b.layers.push(d);
			}
			LS[C1L] = JSON.stringify(b);
			id('saveTime').textContent = unixDateToHMS();
			cue.autoSave = false, a = 'AL', d = 'button';
			for (i in a) if (e = id(d+a[i])) setClass(e, d);
		}
		break;
//* loading
	case 3:
	case 4:
		if (!LS) return alert(lang.no_LS);
		t = LS[C1T];
		if (!t) return;
		d = LS[C1R], i = C1L;
		if (d == (c = cv.view.toDataURL())) {
			if ((!(t = LS[C2T]) || ((d = LS[C2R]) == c))) return alert(lang.no_change);
			i = C2L;
		}
//* load flat image to new layer
		if (dest == 4) {
			t = t.split('-'), c = unixDateToHMS(i = +t[1],0,1);
			if (t.length > 2) used.read = t.slice(2).join('-');
			if (draw.time[0] < parseInt(t[0])) draw.time[0] = t[0];
			if (draw.time[1] > parseInt(t[1])) {
				draw.time[1] = t[1];
				a = id('saveTime');
				a.title = new Date(i);
				a.textContent = c.split(' ',2)[1];
			}
			readPic({name:c, data:d});
			used.LS = 'Local Storage';
		} else
//* load project
		if (!LS[i] || (b = JSON.parse(LS[i])).time != t) alert(lang.no_layers); else
		if (confirm(lang.confirm_load)) {
			t = t.split('-'), draw.time = t.slice(0,2);
			if (t.length > 2) used.read = t.slice(2).join('-');
			a = id('saveTime');
			a.title = new Date(t = +t[1]);
			a.textContent = (t = unixDateToHMS(t,0,1)).split(' ',2)[1];
			a = b.layers, i = a[0].max = a.length, count = {layers:i-1, strokes:0}, d = draw.history, d.layers = [a[d.layer = 0]];
			while (--i) readPic({z:i, show:a[i].show, alpha:a[i].alpha, name:a[i].name, data:a[i].data});
			used.LS = 'Local Storage';
		}
		break;
	case 5:
		if (a || ((outside.read || (outside.read = id('read'))) && (a = outside.read.value))) {
			draw.time = [0, 0];
			used.read = 'File Read: '+readPic(a);
		}
		break;
//* send
	default:
		if (dest) alert(lang.bad_id); else
		if (!outside.send) alert(lang.no_form); else
		if (fillCheck()) alert(lang.flood); else
		if (confirm(lang.confirm_send)) {
			if (!outside.send.tagName) {
				setId(e = document.createElement('form'), 'send');
				e.setAttribute('method', (outside.send.length && outside.send.toLowerCase() == 'get')?'get':'post');
				container.appendChild(outside.send = e);
			}
		var	pngData = sendPic(2, 1), jpgData, a = {txt:0,pic:0};
			for (i in a) if (!(a[i] = id(i))) {
				setId(e = a[i] = document.createElement('input'), e.name = i);
				e.type = 'hidden';
				outside.send.appendChild(e);
			}
			e = pngData.length;
			a.txt.value = getSendMeta();
			a.pic.value = (((i = outside.jp || outside.jpg_pref)
				&& (e > i)
				&& (((c = cv.view.width * cv.view.height
				) <= (d = select.imgRes.width * select.imgRes.height
				))
				|| (e > (i *= c/d)))
				&& (e > (jpgData = cv.view.toDataURL(IJ)).length)
			) ? jpgData : pngData);
			if (mode.debug) alert('jpg = '+(jpgData?jpgData.length:0)+'\npng = '+e+'\npng limit = '+i);
			outside.send.submit();
		}
	}
	return c;
}

function readPic(s) {
	if (!s.data) s = {
		name: (0 === s.indexOf('data:') ? s.split(',', 1) : s)
	,	data: s
	};
var	d = 'read-img-'+(+new Date)+'-'+s.name, i = id(d), j, k;
	if (!i) setId(i = new Image(), d);
	i.setAttribute('onclick', 'return this.parentNode.removeChild(this) && false;');
	i.onload = function () {
		for (d in select.imgRes) if (cv.view[d] < i[d]) {
			id('img-'+d).value = i[d];
			for (j in cv) cv[j][d] = i[d];
			if (outside[d[0]+'l']) updateDim(d); else k = 1;
		}
		if (k) updateDim();
		s.data = 0;
		newLayer(s);
		ctx.draw.clearRect(0, 0, cv.view.width, cv.view.height);
		ctx.draw.drawImage(i, 0, 0);
		historyAct();
		cue.autoSave = false;
		if (d = i.parentNode) d.removeChild(i);
	}
	draw.container.appendChild(i);
	return i.src = s.data, s.name;
}

//* Hot keys *-----------------------------------------------------------------

function isMouseIn() {return (draw.o.x >= 0 && draw.o.y >= 0 && draw.o.x < cv.view.width && draw.o.y < cv.view.height);}
function mouseClickBarrier(event) {
	event.stopPropagation();
	event.cancelBubble = true;
	return false;
}
function browserHotKeyPrevent(event) {
	return ((!draw.active && isMouseIn()) || (event.keyCode == 27))
	? ((event.returnValue = false) || event.preventDefault() || true)
	: false;
}
function hotKeys(event) {
	if (browserHotKeyPrevent(event)) {
		function c(s) {return s.charCodeAt(0);}
	var	n = event.keyCode - c('0');
		if ((n?n:n=10) > 0 && n < 11) {
		var	k = [event.altKey, event.ctrlKey, 1];
			for (i in k) if (k[i]) return toolTweak(k = BOWL[i], RANGE[k].step < 1 ? n/10 : (n>5 ? (n-5)*10 : n));
		} else
		if (event.altKey)
		switch (event.keyCode) {
			case c('L'):	newLayer();	break;
			case c('C'):	newLayer(1);	break;
			case c('M'):	newLayer(-1);	break;
			case c('E'):	moveLayer('del');break;
		case 38:case c('U'):	moveLayer(0);	break;
		case 40:case c('D'):	moveLayer(-1);	break;
		case 37:case c('T'):	moveLayer();	break;
		case 39:case c('B'):	moveLayer(1);	break;
			case c('G'):	toggleMode(8);	break;

			case c('B'):
			case c('O'):
			case c('W'):	toolTweak(String.fromCharCode(event.keyCode), -1);
		} else
		if (event.shiftKey)
		switch (event.keyCode) {
			case 38:	selectLayer(-2,0,1);break;
			case 40:	selectLayer(-1,0,1);break;
			case 37:	selectLayer('',0,1);break;
			case 39:	selectLayer(1,0,1);
		} else
		switch (event.keyCode) {
			case 27:	drawEnd();	break;	//* Esc
			case 36: updateViewport();	break;	//* Home
			case c('Z'):	historyAct(-1);	break;
			case c('X'):	historyAct(1);	break;
			case c('C'):	pickColor();	break;
			case c('F'):	fillScreen(0);	break;
			case c('D'):	fillScreen(1);	break;
			case c('I'):	fillScreen(-1);	break;
			case c('H'):	fillScreen(-2);	break;
			case c('V'):	fillScreen(-3);	break;
			case c('S'):	toolSwap();	break;
			case c('A'):	toolSwap(1);	break;
			case c('K'):	toolSwap(2);	break;
			case c('E'):	toolSwap(-2);	break;
			case c('G'):	toolSwap(0);	break;

			case 8:
if (text.debug.innerHTML.length)	toggleMode(0);	break;	//* 45=Ins, 42=106=Num *, 8=bksp
			case c('L'):	toggleMode(1);	break;
			case c('U'):	toggleMode(2);	break;
			case 114:	toggleMode(4);	break;

			case 112:	resetAside();	break;	//* F1
			case 120:	sendPic(0);	break;	//* F9
			case 118:	sendPic(1);	break;
			case 113:	sendPic(2);	break;
			case 114:	sendPic(3);	break;
			case 115:	sendPic(4);	break;
			case 117:	sendPic(5);	break;
			case 119:	sendPic();	break;

			case c('Q'):	updateShape(0);	break;
			case c('P'):	updateShape(1);	break;
			case c('R'):	updateShape(2);	break;
			case c('T'):	updateShape(3);	break;
			case c('Y'):	updateShape(4);	break;
			case c('M'):	updateShape(5);	break;

			case c('B'):
			case c('O'):
			case c('W'):	toolTweak(String.fromCharCode(event.keyCode), 0); break;

			case 106: case 42:
text.debug.innerHTML = getSendMeta()+replaceAll(
"\n<a href=\"javascript:var s=' ',t='';for(i in |)t+='\\n'+i+' = '+(|[i]+s).split(s,1);alert(t);\">self.props</a>"+
"\n<a href=\"javascript:var t='',o=|.o;for(i in o)t+='\\n'+i+' = '+o[i];alert(t);\">self.outside</a>"+
(outside.read?'':'\nF6=read: <textarea id="|-read" value="/9.png"></textarea>'), '|', NS)
+'<br>Save1.time: '+LS[C1T]+(LS[C1R]?', size: '+LS[C1R].length:'')+(LS[C1L]?', layers: '+LS[C1L].length:'')
+'<br>Save2.time: '+LS[C2T]+(LS[C2R]?', size: '+LS[C2R].length:'')+(LS[C2L]?', layers: '+LS[C2L].length:''); break;

			default: if (mode.debug) text.debug.innerHTML += '\n'+String.fromCharCode(event.keyCode)+'='+event.keyCode;
		}
	}
	return false;
}

function hotWheel(event) {
	if (browserHotKeyPrevent(event)) {
	var	d = event.deltaY || event.detail || event.wheelDelta
	,	b = event.altKey?'B':(event.ctrlKey?'O':'W');
		toolTweak(b, d < 0?0:-1);
		if (mode.debug) text.debug.innerHTML += ' d='+d;
	}
	return false;
}

//* Autoplace windows around cv.view *------------------------------------------

function resetAside() {
var	margin = 2, off = getOffsetXY(draw.container), x = (off.x + cv.view.offsetWidth + margin), y = 0, z
,	a = container.getElementsByTagName('aside'), i = a.length, e;
	while (i--) if ((e = a[i]).id) {
		e.style.display = '';
		if (z) x = (off.x - e.offsetWidth - margin);
		putInView(e, x, y+off.y);
		y += e.offsetHeight + margin;
		if (!z && y > select.imgRes.height) y = 0, z = 1;
	}
}

//* Initialization *-----------------------------------------------------------

function init() {
	if (isTest()) document.title += ': '+NS+' '+INFO_VERSION;
	RANGE.A = RANGE.W, RANGE.S = RANGE.B;
var	b,c = 'canvas',d,e,f,g,h,i,j,k,l,m,n, o = outside, style = '', s = '&nbsp;';

	a = '\n\
<div id="load"><'+c+' id="'+c+'" tabindex="0">'+lang.no_canvas+'</'+c+'></div>\n\
<div id="debug"></div>';
	for (i in lang.windows) a += '\n<aside id="'+i+'"></aside>';

	setContent(container = id(), a), e = id(c);
	if (!e.getContext) return;

	for (i in cv) ctx[i] = (cv[i] = (i == 'view'?e:document.createElement(c))).getContext('2d');
	for (i in select.imgRes) {
		b = (o[a = i[0]]?o[a]:o[a] = (o[i]?o[i]:select.imgRes[i]));
		for (j in cv) cv[j][i] = b;
		if ((o[b = c = a+'l']
		|| (o[c] = o[b = i+'Limit']))
		&& (f = o[b].match(regLimit))) select.imgLimits[i] = [parseInt(f[1]), parseInt(f[2])];
	}

var	wnd = container.getElementsByTagName('aside'), wit = wnd.length;
	while (wit--) if ((e = wnd[wit]).id) {
		style += '\n#'+e.id+' header::before {content:"'+lang.windows[k = reId(e)]+'";}';
		a = '<a href="javascript:;" onClick="', c = '<header draggable="true">:'+a+'toggleView(this.parentNode.parentNode)">[ x ]</a></header>\n';

//* Add content as text *------------------------------------------------------

		if (k == 'color') {
			c += '<div class="selects">'+lang.hex+': <input type="text" id="color-text" onChange="updateColor()" title="'+lang.hex_hint+'"> '
			+lang.palette+': <select id="palette" onChange="updatePalette()"></select>'
			+'</div><div id="colors"></div>';
		} else
		if (k == 'info') {
			d = '';
			for (i in select.imgRes) d += (d?' x ':'')
+'<input type="text" value="'+o[i[0]]+'" id="img-'+i+'" onChange="updateDim(\''+i+'\')" title="'+lang.size_hint+select.imgLimits[i]+'">';

			b = '<abbr title="', f = '<i class="rf">', g = f+s+b
+NS.toUpperCase()+', '+INFO_ABBR+', '+lang.info_pad+', '+INFO_DATE
//+', '+lang.lang[0]+': '+lang.lang[1]
+'">'+INFO_VERSION+'</abbr>.</i>';

			c += lang.size
+':	'+d+'<hr><p>'+lang.info.join('<br>')
				.replace(/-<br>/gi, '</p><hr><p>')
				.replace(/\{([^=};]+)(?:=([^=};]+))?;([^}]+)}/g, a+'$1($2)">$3</a>')
				.replace(/\[([^\];]+);([^\]]+)]/g, '<span id="$1">$2</span>')
+':	'+f+b+(new Date())+'" id="saveTime">'+lang.info_no_save+'</abbr>.</i>'
+'<br>	'+a+'toggleView(\'timer\')" title="'+lang.show_hint+'">'+lang.info_time+'</a>'
+':	'+f+'<span id="timer">'+lang.info_no_time+'</span>.</i><br>'+lang.info_drop+g+'</p>';
		} else
		if (k == 'layer') {
			c += '<div id="layers">'+getSlider('A')+'</div>';
		} else
		if (k == 'tool') {
			d = '<br><select id="', b = '"></select>';
			c += '<div class="selects"><div class="rf">'+lang.shape+':'+d+'shape" onChange="updateShape(this)'+b;
			for (i in select.lineCaps) c += d+i+'" title="'+(select.lineCaps[i] || i)+b;
			c += '</div>';
			i = BOW.length;
			while (i--) c += getSlider(BOWL[i]);
			c += '</div>';
		} else c += 'TODO: '+k;

		setContent(e, c);

//* Add DOM + events *---------------------------------------------------------

		function btnArray(a,bf) {
		var	b = 'button', c = document.createElement('div'), d,i,j,k;

			function btnContent(e, a) {
			var	t = lang.b[a[0]], d = '<div class="'+b+'-', c = '</div>';
				e.title = (t.t?t.t:t);
				setContent(e, d+'key">'+a[1]+c+a[2]+d+'subtitle"><br>'+(t.t?t.sub:a[0])+c);
				return e;
			}

			for (i in a) if (isNaN(k = a[i])) {
				d = document.createElement(b);

				if (k[0].indexOf('|') > 0) {
				var	subt = k[0].split('|')
				,	pict = k[2].split('|');
					for (j in subt) setClass(d.appendChild(btnContent(
						document.createElement('div'), [subt[j], k[1], pict[j]]
					)), 'abc'[j]);
				} else btnContent(d, k);

				setClass(d, b);
				setEvent(d, 'onclick', k[3]);
				if (k.length > 4) setId(d, k[4]);
				c.appendChild(d);
			} else if (k != -1) c.innerHTML += (k < 0?'<hr>':(k?repeat(s,k):'<br>'));
			setClass(c, b+'s');
			return bf ? e.insertBefore(c, bf) : e.appendChild(c);
		}

		b = 'button', c = 'color', d = 'sendPic(', f = 'fillScreen(', g = 'toggleMode(', h = 'check', j = 'toolSwap(';
		if (k == 'info') {
			btnArray([
//* subtitle, hotkey, pictogram, function, id
-9,	['png'	,'F9'	,'P'		,d+'0)'	,b+'P'
],	['jpeg'	,'F7'	,'J'		,d+'1)'	,b+'J'
],1,	['save'	,'F2'	,'!'		,d+'2)'
],	['load'	,'F3'	,'?'		,d+'3)'	,b+'L'
],
1,	['loadd','F4'	,'+'		,d+'4)'	,b+'A'
],!o.read || 0 == o.read?-1:
	['read'	,'F6'	,'&#x21E7;'	,d+'5)'
],!o.send || 0 == o.send?-1:
	['done'	,'F8'	,'&#x21B5;'	,d+')'
]]);
		} else
		if (k == 'layer') {
			a = 'Alt+', d = 'moveLayer(', h = 'historyAct(', l = 'layer', n = 'newLayer(';
			btnArray([
//* subtitle, hotkey, pictogram, function, id
	['new'	,a+'L','&#x25A1;'	,n+')'
],	['delete',a+'E','&times;'	,d+'"del")',l+'E'
],
1,	['up'	,a+'U','&#x25B2;'	,d+'0)'	,l+'U'
],	['down'	,a+'D','&#x25BC;'	,d+'-1)',l+'D'
],
1,	['fill'	,'F'	,s		,f+'0)'	,c+'F'
],	['swap'	,'S'	,'&#X21C4;'	,j+')'
],	['erase','D'	,s		,f+'1)'	,c+'B'
],
0,	['copy'	,a+'C'	,s		,n+'1)'	,l+'C'
],	['merge',a+'M'	,s		,n+'-1)',l+'M'
],
1,	['top'	,a+'T','&#x2191;'	,d+')'	,l+'T'
],	['bottom',a+'B','&#x2193;'	,d+'1)'	,l+'B'
],
1,	['invert','I'	,'&#x25D0;'	,f+'-1)'
],	['flip_h','H'	,'&#x2194;'	,f+'-2)',l+'H'
],	['flip_v','V'	,'&#x2195;'	,f+'-3)',l+'V'
],
0,	['undo'	,'Z'	,'&#x2190;'	,h+'-1)',b+'U'
],	['redo'	,'X'	,'&#x2192;'	,h+'1)'	,b+'R'
//],1,	['global',a+'G','&#x25A4;'	,g+'7)',k+'G'
]], e.firstElementChild.nextSibling).appendChild(a = id('sliderA'));
			setClass(a, 'rf');
			setSlider('A');
		} else
		if (k == 'tool') {
			btnArray([
//* subtitle, hotkey, pictogram, function, id
-9,	['pencil','A'	,'i'		,j+'1)'
],	['chalk' ,'K'	,'&#x25CB;'	,j+'2)'
],	['eraser','E'	,'&#x25CC;'	,j+'-2)'
],	['reset' ,'G'	,'&#x25CE;'	,j+'0)'
],
1,	['cursor'		,'F3'	,'&#x25CF;'			,g+'4)'	,h+'V'
],
1,	['line|area|copy'	,'L'	,'&ndash;|&#x25A0;|&#x25EB;'	,g+'1)'	,h+'L'
],	['curve|outline|rect'	,'U'	,'~|&#x25A1;|&#x25AF;'	,g+'2)'	,h+'U'
]]);
			i = id(h+'L');
			setId(i.parentNode.insertBefore(d = document.createElement('div'), i), 'warn');
			for (i in (a = 'LU')) d.appendChild(id(h+a[i]));
			for (i in BOW) setSlider(BOWL[i]);
		}

		e.addEventListener('mousedown', mouseClickBarrier, false);
		e.firstElementChild.addEventListener('dragstart', dragStart, false);
	}
	newLayer();

//* Global events, etc *-------------------------------------------------------

	document.addEventListener('dragover'	, dragOver	, f = false);
	document.addEventListener('drop'	, drop		, f);
	document.addEventListener('mousedown'	, drawStart	, f);
	document.addEventListener('mousemove'	, drawMove	, f);	//* <- using 'document' to prevent negative clipping
	document.addEventListener('mouseup'	, drawEnd	, f);
	container.addEventListener('keypress'	, browserHotKeyPrevent, f);
	container.addEventListener('keydown'	, hotKeys	, f);
	container.addEventListener('mousewheel'	, e = hotWheel	, f);
	container.addEventListener('wheel'	, e, f);
	container.addEventListener('scroll'	, e, f);
	cv.view.setAttribute('onscroll'		, f = 'return false;');
	cv.view.setAttribute('oncontextmenu'	, f);

	for (name in mode) if (mode[modes[i = modes.length] = name]) toggleMode(i,1);
	for (i in text) text[i] = id(i);

	draw.history.data = new Array(o.undo), draw.container = id('load'), b = 'button', i = (a = 'JP').length, h = /^header$/i;
	while (i--) if (e = id(b+a[i])) setEvent(e, 'onmouseover', 'updateSaveFileSize(this)');

	for (i in (a = {L:C1L, A:C1T})) if (!LS || !LS[a[i]]) setClass(id(b+i), b+'-disabled');

	for (i in (a = ['a', 'input', 'select', 'p', b]))
	for (c in (b = container.getElementsByTagName(a[i])))
	for (e in (d = ['onchange', 'onclick', 'onmouseover']))
	if ((f = b[c][d[e]])
	&& (m = (''+f).match(regFunc))) {
		if (!self[f = m[1]]) self[f] = eval(f);
		if (f == 'toggleView' && !(m = b[c]).title) m.title = lang[h.test(m.parentNode.tagName)?'hide_hint':'show_hint'];
	}

//* safe palette constructor, step recomended to be: 1, 3, 5, 15, 17, 51, 85, 255
  function generatePalette(p, step, slice) {
	if (!(p = palette[p])) return;
var	letters = [0, 0, 0], l = p.length;
	if (l) p[l] = '\t', p[l+1] = '\n';
	while (letters[0] <= 255) {
		p[l = p.length] = '#';
		for (var i = 0; i < 3; i++) {
		var	s = letters[i].toString(16);
			if (s.length == 1) s = '0'+s;
			p[l] += s;
		}
		letters[2] += step;
		if (letters[2] > 255) letters[2] = 0, letters[1] += step;
		if (letters[1] > 255) letters[1] = 0, letters[0] += step;
		if ((letters[1] == 0 || (letters[1] == step * slice)) && letters[2] == 0)
			p[l+1] = '\n';
	}
  }
	generatePalette(1, 85, 0);
	a = select.options, c = select.translated || a, f = (LS && LS.lastPalette && palette[LS.lastPalette]) ? LS.lastPalette : 1;
	for (b in a) {
		e = select[b] = id(b);
		for (i in a[b]) (
			e.options[e.options.length] = new Option(c[b][i], i)
		).selected = (b == 'palette'?(i == f):!i);
	}

//* Get ready to work *--------------------------------------------------------

	toggleView('hotkeys');
	id('style').innerHTML += style;

	toolSwap(0);
	updatePalette();
	updateViewport();
	resetAside();
}

//* External config *----------------------------------------------------------

function isTest() {
	if (C1T) return !o.send;
var	o = outside, v = id('vars'), e, i, j, k
,	f = o.send = id('send')
,	r = o.read = id('read'), a = [v,f,r];
	for (i in a) if ((e = a[i]) && (e = (e.getAttribute('data-vars') || e.name))) {
		for (i in (a = e
			.replace(/\s*=\s*/g, '=')
			.replace(/[\s;]+=*/g, ';')
			.split(';')
		)) if ((e = a[i]).length) {
			if ((e = e.split('=')).length > 1) {
				k = e.pop();
				for (j in e) o[e[j]] = k;
			} else o[e[0]] = 1;
//*	a) varname; var2=;		//noequal=1, empty=0
//*	b) warname=two=3=last_val;	//samevalue, rightmost
		}
		break;	//* <- no care about the rest
	}
	CR = (o.saveprfx?o.saveprfx:NS)+CR;
	C1T = (C1R = CR+'y')+CT, C1L = C1R+CL;
	C2T = (C2R = CR+'2')+CT, C2L = C2R+CL;
	o.t0 = (o.t0 ? o.t0+'000' : +new Date());
	if (!o.undo || isNaN(o.undo) || o.undo < 3) o.undo = 123; else o.undo = parseInt(o.undo);
	if (!o.lang) o.lang = document.documentElement.lang || 'en';

//* translation: Russian *-----------------------------------------------------

	if (o.lang == 'ru')
select.lineCaps = {lineCap: 'край', lineJoin: 'сгиб'}
, select.translated = {
	shape	: ['линия', 'многоугольник', 'прямоугольник', 'круг', 'овал', 'сдвиг']
,	lineCap	: ['круг <->', 'бочка', 'квадрат']
,	lineJoin: ['круг -x-', 'срез', 'угол']
,	palette	: ['история', 'авто', 'разное', 'Тохо', 'градиент']
}, lang = {
	lang: ['язык', 'Русский']
,	bad_id:		'Ошибка выбора.'
,	flood:		'Полотно пусто.'
,	confirm_send:	'Отправить рисунок в сеть?'
,	confirm_save:	'Сохранить слои в память браузера?'
,	confirm_load:	'Вернуть слои из память браузера?'
,	found_swap:	'Рисунок был в запасе, поменялись местами.'
,	no_LS:		'Локальное Хранилище (память браузера) недоступно.'
,	no_files:	'Среди файлов не найдено изображений.'
,	no_layers:	'Позиция в памяти не содержит слоёв.'
,	no_form:	'Назначение недоступно.'
,	no_change:	'Нет изменений.'
,	no_canvas:	'Ваша программа не поддерживает HTML5-полотно.'
,	windows: {
		layer:	'Слои'
	,	info:	'Данные'
	,	color:	'Цвет'
	,	tool:	'Инструмент'
},	layer: {prefix:	'Слой'
	,	bg:	'Цвет фона'
	,	hint: {
			bg:	'Сменить цвет фона: левым кликом на цвет основного инструмента, правым — запасного.'
		,	check:	'Видимость слоя.'
		,	name:	'Название слоя, меняйте на что-то осмысленное, чтобы не перепутать.'
		,	alpha:	'Непрозрачность слоя при наложении.'
		,	undo:	'История отмен слоя.'
}},	tool: {	B:	'Тень'
	,	O:	'Непрозрачность'
	,	W:	'Толщина'
	,	S:	'Насыщенность'
},	shape:		'Форма'
,	palette:	'Палитра'
,	hex:		'Код'
,	hex_hint:	'Формат ввода — #a, #f90, #ff9900, или 0,123,255'
,	hide_hint:	'Кликните, чтобы спрятать.'
,	show_hint:	'Кликните, чтобы спрятать или показать.'
,	info: [	'{toggleView=\'hotkeys\';Управление}: [hotkeys;(указатель над полотном)'
	,,	'C / средний клик = подобрать цвет с рисунка.'
	,	'Q / P / R / T / Y / M = выбор формы.'
	,	'E = полигон-стёрка.'
	,,	'1-10 / колесо мыши / (Alt +) W = толщина кисти.'
	,	'Ctrl + 1-10 / колесо / (Alt +) O = прозрачность.'
	,	'Alt + 1-10 / колесо / (Alt +) B = размытие тени.'
	,,	'Shift + стрелки = выбирать слой.'
	,	'Alt + стрелки = двигать слой по списку.'
	,,	'Ctrl + тяга = поворот полотна, Home = {updateViewport;сброс}.'
	,	'Alt + тяга = масштаб, Shift + т. = сдвиг рамки.'
	,	']F1 = {resetAside;вернуть} панельки по местам.-'
	,	'Автосохранение раз в минуту'
],	info_no_save:	'ещё не было'
,	info_no_time:	'ещё нет'
,	info_time:	'Времени прошло'
,	info_pad:	'стопка для набросков'
,	info_drop:	'Можно перетащить сюда файлы с диска.'
,	size:		'Размер полотна'
,	size_hint:	'Число между '
,	b: {	undo:	{sub:'назад',	t:'Отменить последнее действие.'
	},	redo:	{sub:'вперёд',	t:'Отменить последнюю отмену.'
	},	fill:	{sub:'залить',	t:'Залить слой основным цветом.'
	},	erase:	{sub:'стереть',	t:'Залить слой прозрачностью, или фон — запасным цветом.'
	},	invert:	{sub:'инверт.',	t:'Обратить цвета полотна.'
	},	flip_h:	{sub:'отразить',t:'Отразить полотно слева направо.'
	},	flip_v:	{sub:'перевер.',t:'Перевернуть полотно вверх дном.'
	},	pencil:	{sub:'каранд.',	t:'Инструмент — тонкий простой карандаш.'
	},	chalk:	{sub:'мел',	t:'Инструмент — толстый белый карандаш.'
	},	eraser:	{sub:'стёрка',	t:'Инструмент — лассо удаления.'
	},	swap:	{sub:'смена',	t:'Поменять инструменты местами.'
	},	reset:	{sub:'сброс',	t:'Сбросить инструменты к начальным.'
	},	line:	{sub:'прямая',	t:'Прямая линия 1 зажатием.'
	},	curve:	{sub:'кривая',	t:'Сглаживать углы пути / кривая линия 2 зажатиями.'
	},	area:	{sub:'закрас.',	t:'Закрашивать площадь геометрических фигур. \r\nНе обводить + не закрашивать = удалить площадь.'
	},	outline:{sub:'контур',	t:'Рисовать контур геометрических фигур. \r\nНе обводить + не закрашивать = удалить площадь.'
	},	copy:	{sub:'копия',	t:'Оставить старую копию.'
	},	rect:	{sub:'прямоуг.',t:'Сдвиг прямоугольником.'
	},	cursor:	{sub:'указат.',	t:'Показывать кисть на указателе.'
	},	rough:	{sub:'п.штрих',	t:'Уменьшить нагрузку, пропуская перерисовку штриха.'
	},	fps:	{sub:'п.кадры',	t:'Уменьшить нагрузку, пропуская кадры.'
	},	png:	{sub:'сохр.png',t:'Сохранить рисунок в PNG файл.'
	},	jpeg:	{sub:'сохр.jpg',t:'Сохранить рисунок в JPEG файл.'
	},	save:	{sub:'сохран.',	t:'Сохранить слои в память браузера, 2 позиции по очереди.'
	},	load:	{sub:'загруз.',	t:'Вернуть слои из памяти браузера, 2 позиции по очереди. \r\n\
Может не сработать в некоторых браузерах, если не настроить автоматическую загрузку и показ изображений.'
	},	loadd:	{sub:'загр.доб',t:'Добавить рисунок из памяти браузера на новый слой, 2 позиции по очереди. \r\n\
Может не сработать в некоторых браузерах, если не настроить автоматическую загрузку и показ изображений.'
	},	read:	{sub:'заг.файл',t:'Прочитать локальный файл на новый слой. \r\n\
Может не сработать вообще, особенно при запуске самой рисовалки не с диска. \r\n\
Вместо этого рекомендуется перетаскивать файлы из других программ.'
	},	done:	{sub:'готово',	t:'Завершить и отправить рисунок в сеть.'

	},	new:	{sub:'новый',	t:'Создать новый слой.'
	},	copy:	{sub:'копия',	t:'Создать копию слоя.'
	},	merge:	{sub:'слить',	t:'Скопировать содержимое слоя вниз.'
	},	delete:	{sub:'удалить',	t:'Удалить слой вместе с его историей отмен.'
	},	up:	{sub:'выше',	t:'Поднять слой выше.'
	},	down:	{sub:'ниже',	t:'Опустить слой ниже.'
	},	top:	{sub:'верх',	t:'Поднять слой на самый верх.'
	},	bottom:	{sub:'низ',	t:'Опустить слой в самый низ.'
	},	global:	{sub:'глобал.',	t:'Общая история отмен, вместо отдельной для выбранного слоя. Тот же эффект на "глобальном" слое.'
}}};

//* translation: English *-----------------------------------------------------

else o.lang = 'en', lang = {
	lang: ['language', 'English']
,	bad_id:		'Invalid case.'
,	flood:		'Canvas is empty.'
,	confirm_send:	'Send image to server?'
,	confirm_save:	'Save layers to your browser memory?'
,	confirm_load:	'Restore layers from your browser memory?'
,	found_swap:	'Found image at slot 2, swapped slots.'
,	no_LS:		'Local Storage (browser memory) not supported.'
,	no_layers:	'Save position has no layer data.'
,	no_files:	'No image files found.'
,	no_form:	'Destination unavailable.'
,	no_change:	'Nothing changed.'
,	no_canvas:	'Your browser does not support HTML5 canvas.'
,	windows: {
		layer:	'Layers'
	,	info:	'Info'
	,	color:	'Color'
	,	tool:	'Tool'
},	layer: {prefix:	'Layer'
	,	bg:	'Background fill color'
	,	hint: {
			bg:	'Change bg color: left click to front tool color, right — to back.'
		,	check:	'Layer visibility.'
		,	name:	'Layer entry name, change to something meaningful.'
		,	alpha:	'Layer opacity ratio.'
		,	undo:	'Layer undo history.'
}},	tool: {	B:	'Shadow'
	,	O:	'Opacity'
	,	W:	'Width'
	,	S:	'Saturation'
},	shape:		'Shape'
,	palette:	'Palette'
,	hex:		'Code'
,	hex_hint:	'Valid formats — #a, #f90, #ff9900, or 0,123,255'
,	hide_hint:	'Click to hide.'
,	show_hint:	'Click to show/hide.'
,	info: [	'{toggleView=\'hotkeys\';Hot keys}: [hotkeys;(mouse over image only)'
	,,	'C / mouse mid = pick color from image.'
	,	'Q / P / R / T / Y / M = select shape.'
	,	'E = polygon-eraser.'
	,,	'1-10 / mouse wheel / (Alt +) W = brush width.'
	,	'Ctrl + 1-10 / wheel / (Alt +) O = brush opacity.'
	,	'Alt + 1-10 / wheel / (Alt +) B = brush shadow blur.'
	,,	'Shift + arrows = select layer.'
	,	'Alt + arrows = move layer on the list.'
	,,	'Ctrl + drag = rotate cv.view, Home = {updateViewport;reset}.'
	,	'Alt + drag = zoom, Shift + d. = move cv.view frame.'
	,	']F1 = {resetAside;reset} floating panels.-'
	,	'Autosave every minute, last saved'
],	info_no_save:	'not yet'
,	info_no_time:	'no yet'
,	info_time:	'Time elapsed'
,	info_pad:	'sketch stack'
,	info_drop:	'You can drag files from disk and drop here.'
,	size:		'Image size'
,	size_hint:	'Number between '
,	b: {	undo:	'Revert last change.'
	,	redo:	'Redo next reverted change.'
	,	fill:	'Fill layer with main color.'
	,	erase:	'Fill layer with transparency, or background with back color.'
	,	invert:	'Invert image colors.'
	,	flip_h:	{sub:'flip hor.',t:'Flip image horizontally.'
	},	flip_v:	{sub:'flip ver.',t:'Flip image vertically.'
	},	pencil:	'Set tool to sharp black.'
	,	chalk:	'Set tool to large white.'
	,	eraser:	'Set tool to lasso eraser.'
	,	swap:	'Swap your tools.'
	,	reset:	'Reset both tools.'
	,	line:	'Draw straight line with 1 drag.'
	,	curve:	'Smooth path corners / draw single curve with 2 drags.'
	,	area:	'Fill geometric shapes. \r\nNo outline + no fill = erase area.'
	,	outline:'Draw outline of geometric shapes. \r\nNo outline + no fill = erase area.'
	,	copy:	'Keep old copy.'
	,	rect:	'Move rectangle.'
	,	cursor:	'Brush preview on cursor.'
	,	rough:	'Skip draw cleanup while drawing to use less CPU.'
	,	fps:	'Limit FPS when drawing to use less CPU.'
	,	png:	'Save image as PNG file.'
	,	jpeg:	'Save image as JPEG file.'
	,	save:	'Save layers copy to your browser memory, 2 slots in a queue.'
	,	load:	'Load layers copy from your browser memory, 2 slots in a queue. \r\n\
May not work in some browsers until set to load and show new images automatically.'
	,	loadd:	'Load image copy from your browser memory to a new layer, 2 slots in a queue. \r\n\
May not work in some browsers until set to load and show new images automatically.'
	,	read:	'Load image local file to a new layer. \r\n\
May not work at all, especially if sketcher itself is not started from disk. \r\n\
Instead, it is recommended to drag and drop files from another program.'
	,	done:	'Finish and send image to server.'

	,	new:	'Add a new layer.'
	,	copy:	'Add a copy of the current layer.'
	,	merge:	'Copy layer contents to the lower layer.'
	,	delete:	'Delete layer. Its undo history will be lost.'
	,	up:	'Move layer one step up.'
	,	down:	'Move layer one step down.'
	,	top:	'Move layer to the top.'
	,	bottom:	'Move layer to the bottom.'
	,	global:	'Global history, instead of layer\'s own only. Same effect on the "global" layer.'
}};
	lang.tool.A = lang.tool.O;
	return !o.send;
} //* <- END external config

//* Embed CSS and container *--------------------------------------------------

document.write(replaceAll(replaceAdd('\n<style id="|-style">\
#| #|-color-text {width: 78px;}\
#| .|-button {background-color: #ddd;}\
#| .|-button-active {background-color: #ace;}\
#| .|-button-active:hover {background-color: #bef;}\
#| .|-button-disabled {color: gray; cursor: default;}\
#| .|-button-key, #| .|-button-subtitle {vertical-align: top; height: 10px; font-size: 9px; margin: 0; padding: 0;}\
#| .|-button-key, #|-debug {text-align: left;}\
#| .|-button-subtitle {line-height: 6px; margin: 0 -3px;}\
#| .|-button:hover {background-color: #eee;}\
#| .|-buttons button {font-size: 15px;}\
#| .|-buttons {line-height: 0;}'+/* <- fix for Chrome */'\
#| .|-paletdark, #| .|-palettine {border: 2px solid transparent; height: 15px; width: 15px; cursor: pointer;}\
#| .|-paletdark:hover {border-color: #fff;}\
#| .|-palettine:hover {border-color: #000;}\
#| .|-rf {display: block; float: right;}\
#| .|-ri {display: inline-block; text-align: right;}\
#| .|-selects .|-rf, #| aside select {width: 86px; margin: 0;}\
#| .|-selects, #|-layers {white-space: nowrap;}\
#| .|-slider {display: block; width: 156px; height: 1px; font-size: small; line-height: normal;}\
#| a {color: #888;}\
#| a:hover {color: #000;}\
#| abbr {border-bottom: 1px dotted #111;}\
#| aside button {border: 1px solid #000; width: 38px; height: 38px; margin: 2px; padding: 2px; line-height: 7px; text-align: center; cursor: pointer;}\
#| aside header > a {display: block; float: right; text-decoration: none; color: #eee; margin: 0;}\
#| aside header {display: block; cursor: move; padding: 2px 2px 4px 2px; margin-bottom: 2px; background-color: #ace; overflow: hidden;}\
#| aside header:hover {background-color: #5ea6ed;}\
#| aside i {font-style: normal;}\
#| aside input[type="range"] {width: 156px; height: 16px; margin: 0; padding: 0;}\
#| aside input[type="text"] {margin: 2px; width: 48px;}\
#| aside p {line-height: 22px; margin: 0.5em;}\
#| aside p, #|-info hr, #|-layers hr, #|-colors table {font-size: small;}\
#| aside {position: absolute; left: 0; top: 0; text-align: left; padding: 2px; border: 2px solid gray; background-color: rgba(234,234,234,0.90);}\
#| canvas {border: 1px solid #aaa; margin: 0; vertical-align: bottom; cursor:\
	url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAGElEQVR42mNgYGCYUFdXN4EBRPz//38CADX3CDIkWWD7AAAAAElFTkSuQmCC\'),\
	auto;}\
#| hr {border: 1px solid #aaa; border-top: none;}\
#| {text-align: center; padding: 12px; background-color: #f8f8f8;}\
#|, #| button, #| input, #| select {color: #111; font-family: "Arial"; font-size: 19px; line-height: normal;}\
#|-colors .|-text {padding: 0 4px;}\
#|-colors table {margin: 2px 0 0 0; border-collapse: collapse;}\
#|-colors td {margin: 0; padding: 0; height: 16px;}\
#|-debug td {width: 234px;}\
#|-layers .|-slide p:first-child {margin-top: 0;}\
#|-layers .|-slide p:last-child {margin-bottom: 0;}\
#|-layers .|-slide {max-height: 314px; overflow-y: auto;}\
#|-layers > p .|-rf {width: 64px; height: 18px; margin-right: -2px; font-size: small; font-family: monospace;}'+/* <- bg color box */'\
#|-layers p > i > i {display: table-cell; padding: 0 4px; white-space: nowrap; overflow: hidden;}\
#|-layers p > i > i:nth-child(1) {width: 14px;}\
#|-layers p > i > i:nth-child(3) {width: 33px; text-align: right;}\
#|-layers p > i > i:nth-child(3):after {content: "%";}\
#|-layers p > i > i:nth-child(4) {width: 1px;}\
#|-layers p > i {display: table; width: 100%;}\
#|-layers p i input[type="checkbox"] {width: 13px; height: 13px; margin: 0; padding: 0; vertical-align: middle;}\
#|-layers p i input[type="text"] {width: 100%; font-size: small; height: 16px; padding: 1px; border: 1px solid #aaa; margin: 0 -3px;}\
#|-layers p {border: 2px solid #ddd;}\
#|-layers p.|-button input[type="text"] {background-color: #f5f5f5; border-color: #ddd;}\
#|-layers {max-width: 304px;}\
#|-load img {position: absolute; top: 1px; left: 1px; margin: 0;}\
#|-load, #|-load canvas {position: relative; display: inline-block;}\
#|-warn {background-color: #bbb; display: inline-block;}\
#|-warn.|-red {background-color: #f77;}'
+abc.map(function(i) {return '.|-'+i+' .|-'+i;}).join(', ')+' {display: none;}\
</style>', '}', '\n'), '|', NS)+'\n<div id="'+NS+'">Loading '+NS+'...</div>\n');

//* To get started *-----------------------------------------------------------

document.addEventListener('DOMContentLoaded', init, false);

}; //* <- END global wrapper
