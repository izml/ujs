// ==UserScript==
// @name				Ultimate Search Highlighter
// @author				Luchio & Stoen, izml
// @namespace		https://github.com/izml
// @homepage		https://github.com/izml/ujs
// @version			1.6.5.2
// @lastmodified		2012-11-28
// @description			高亮页面中的搜索项，统计结果，可与搜索引擎整合
// @download			https://raw.github.com/izml/ujs/master/ush.js
// @include			*
// ==/UserScript==

'use strict';

((window.opera?window.opera:window).USH = new function() {
	var preferences = {
		highlightOnLoad: /*@页面载入时自动高亮@bool@*/true/*@*/,
			hideColour: /*@初始时隐藏搜索项高亮颜色@bool@*/false/*@*/,
			checkDocChanges: /*@检测到文档内容改变时重新执行高亮@bool@*/true/*@*/,
			hideHighlightHTML: /*@移除对 Element.innerHTML 及 Element.outerHTML getters 的高亮@bool@*/true/*@*/,
		runOnSE: /*@根据搜索引擎运行脚本@bool@*/true/*@*/,
			useStopwords: /*@高亮时忽略已被搜索引擎高亮的词语@bool@*/false/*@*/,
			useWindowName: /*@使用 window.name 储存引用信息@bool@*/true/*@*/,
		useDOMStorage: /*@使用 localStorage 替代 Cookie 来保存搜索@bool@*/true/*@*/,
			useCookies: /*@使用 Cookie 保存搜索@bool@*/true/*@*/,
		enableSearchHistory: /*@搜索记录保存数目，0 表示禁用@int@*/10/*@*/,
		runOnLoad: /*@在页面载入时显示工具栏@bool@*/false/*@*/,
			autoHideDelay: /*@工具栏自动隐藏延迟(毫秒)，0 表示禁用@int@*/2000/*@*/,
			inputDelay: /*@在工具栏中停止输入后延迟多少毫秒才进行高亮。0 表示禁用@int@*/800/*@*/,
			toolbarHiddenOnLoad: /*@初始时隐藏工具栏@bool@*/true/*@*/,
			toolbarAtBottom: /*@在底部显示工具栏@bool@*/false/*@*/,
			toolbarOverText: /*@工具栏覆盖在文本上，false 则插入文档@bool@*/true/*@*/,
			runOnKeyPress:  /*@按任意键显示工具栏(不建议开启)@bool@*/false/*@*/,
		embedStyle: /*@使用脚本内嵌的 CSS 样式，false 则使用外部 CSS 文件@bool@*/true/*@*/,
		keyShortcuts: [		// 默认运行快捷键Ctrl+/
			['run',				/*@runKey: Keyboard shortcut to run script@string@*/'/?'/*@*/,
										/*@_runKey+Optional modifier@bool@*/false/*@*/,
										/*@_runKey+Ctrl@bool@*/true/*@*/,
										/*@_runKey+Shift@bool@*/false/*@*/],
			['enable',		/*@enableKey: Keyboard shortcut toggle. Enables or disables the following shortcuts@string@*/'`~'/*@*/,
										/*@_enableKey+Optional modifier@bool@*/true/*@*/,
										/*@_enableKey+Ctrl@bool@*/false/*@*/,
										/*@_enableKey+Shift@bool@*/false/*@*/],
			['mOver',			/*@mOverKey: Keyboard shortcut to toggle toolbar visibility@string@*/'9('/*@*/,
										/*@_mOverKey+Optional modifier@bool@*/true/*@*/,
										/*@_mOverKey+Ctrl@bool@*/false/*@*/,
										/*@_mOverKey+Shift@bool@*/false/*@*/],
			['optsBttn',	/*@optsBttnKey: Keyboard shortcut for the 'Options' button@string@*/'0)'/*@*/,
										/*@_optsBttnKey+Optional modifier@bool@*/true/*@*/,
										/*@_optsBttnKey+Ctrl@bool@*/false/*@*/,
										/*@_optsBttnKey+Shift@bool@*/false/*@*/],
			['newBttn',		/*@newBttnKey: Keyboard shortcut for the 'New' button@string@*/'-_'/*@*/,
										/*@_newBttnKey+Optional modifier@bool@*/true/*@*/,
										/*@_newBttnKey+Ctrl@bool@*/false/*@*/,
										/*@_newBttnKey+Shift@bool@*/false/*@*/],
			['hideBttn',	/*@toggleBttnKey: Keyboard shortcut for the 'Toggle' button@string@*/'=+'/*@*/,
										/*@_toggleBttnKey+Optional modifier@bool@*/true/*@*/,
										/*@_toggleBttnKey+Ctrl@bool@*/false/*@*/,
										/*@_toggleBttnKey+Shift@bool@*/false/*@*/],
			['closeBttn',	/*@closeBttnKey: Keyboard shortcut for the 'Close' button@string@*/'\\|'/*@*/,
										/*@_closeBttnKey+Optional modifier@bool@*/true/*@*/,
										/*@_closeBttnKey+Ctrl@bool@*/false/*@*/,
										/*@_closeBttnKey+Shift@bool@*/false/*@*/],
			[0,	/*@term1Key: Keyboard shortcut for search term 1@string@*/'1!'/*@*/,true],
			[1,	/*@term2Key: Keyboard shortcut for search term 2@string@*/'2@'/*@*/,true],
			[2,	/*@term3Key: Keyboard shortcut for search term 3@string@*/'3#'/*@*/,true],
			[3,	/*@term4Key: Keyboard shortcut for search term 4@string@*/'4$'/*@*/,true],
			[4,	/*@term5Key: Keyboard shortcut for search term 5@string@*/'5%'/*@*/,true],
			[5,	/*@term6Key: Keyboard shortcut for search term 6@string@*/'6^'/*@*/,true],
			[6,	/*@term7Key: Keyboard shortcut for search term 7@string@*/'7&'/*@*/,true],
			[7,	/*@term8Key: Keyboard shortcut for search term 8@string@*/'8*'/*@*/,true]
		],
		usePunctuation: /*@允许匹配带有标点的搜索项@bool@*/false/*@*/,
		wholeWordsOnly: /*@仅高亮单词@bool@*/false/*@*/,
		matchCase: /*@大小写敏感@bool@*/false/*@*/,
		useRegExp: /*@使用正则表达式搜索@bool@*/false/*@*/
	},
	colours = ["#ffff66","#A0FFFF","#99ff99","#ff9999","#ff66ff","#FF7F50","#00FF00","#7FFF00","#00BFFF","#FF00FF","#FFD700","#CD5C5C","#C0C0C0","#B0C4DE","#808000","#FFA500","#ADD8E6"],
	searchEngines = [null
		,[1,null,null,'#USH:(.+)$']
		,[2,'\\w+\\.+google\\.[^.]{2,3}(?:\\.[^.]{2})?/(?:(?:search)|(?:url))\\?.*',null,'[&?#]q=([^&]+)']
		,[2,'www\.baidu\.com\/(?:s|baidu)',null,'[&?#]wd=([^&]+)']
		,[2,'www\.youdao\.com\/search',null,'[&?#]q=([^&]+)']
		,[2,'www\.sogou\.com\/(?:web|sogou)',null,'[&?#]query=([^&]+)']
		,[2,'www\.soso\.com\/q',null,'[&?#]w=([^&]+)']
		,[2,'\\w+\\.bing\\.com',null,'[&?]q=([^&]+)']
		,[2,'search\\.yahoo\\.com',null,'[&?]p=([^&]+)']
		,[2,'\\w+\\.wikipedia\\.org/wiki/Special:Search',null,'[&?]search=([^&]+)']
		,[2,'(?:www\\.)??ask\\.com',null,'[&?]q=([^&]+)']
		,[2,'my\\.opera\\.com/community/forums/search\\.dml.*',null,'[&?]term=([^&]+)']
		,[4,null,null,'UserJS-USH=(.*?)(?:;|$)']
	],
	strings = {
		_remove: '双击移除',
		_editfound: '\n“Ctrl+单击”可以编辑该项！',
		_editNfound: '\n“单击”可以编辑该项！',
		_editThis:'请编辑这个字符串：(分隔符:␣+|,)\n为空则删除！',
		_opts: '选项',
		_new: '修正高亮',
		_hide: '高亮开关',
		_close: '关闭(清除数据)',
		_goto: '转到下一个',
		_gotoPrev: '转到上一个',
		_nfound: '未找到',
		_regExpError: 'Ultimate Search Highlighter:\n无法创建正则表达式，请检查语法。\n',
		_preProcessError: 'Ultimate Search Highlighter:\n无法创建预处理程序，请检查语法。\n',
		_usePunctuation: '匹配标点符号',
		_wholeWordsOnly: '仅匹配整词',
		_matchCase: '匹配大小写',
		_useRegExp: '作为一个正则表达式匹配',
		_clearHistory: '清除搜索历史记录'
	},
	frameIndex = 0,
	frames = [null],
	iID = window.setTimeout(function(){},0),
	merlin = window.opera && window.opera.version() < 9.5,
	query = null,
	StrArr = new Array(),
	running = 0,
	USH = this,
	highlight = {
		add: function(e) {
			if( !results.terms ) { return; }
			var excElems = ['userjs-ush-toolbar','userjs-ush-highlight','head','applet','object','embed','param','script','noscript','style','frameset','frame','iframe','textarea','input','option','select','img','map'],
					textNodes = document.evaluate('.//text()[normalize-space() and not(ancestor::text() or ancestor::*[contains(" '+excElems.join(' ')+' ",concat(" ",local-name()," "))])]',e&&e.srcElement||document,null,7,null),
					hFind, hElem, i, k, textNode, term;

			if( !(i = textNodes.snapshotLength) ) { return; }
			toolbar.bar.setAttribute('busy','');

			(hElem = document.createElementNS(resolver.xhtmlNS,'userjs-ush-highlight')).tabIndex = 0;
			hElem.setAttribute('iID',iID);
			hElem.setAttribute(preferences.hideColour?'off':'on','');

			while( i-- ) {
				if( (textNode = textNodes.snapshotItem(i)).nodeType != 3 ) { continue; }
				while(hFind = results.regExp.exec(textNode.data)) {
					if( !hFind[0] ) { break; }
					for( k = 1; !hFind[k++]; );
					term = results.terms[k-=2];

					(hElem = hElem.cloneNode(false)).style.background = term.colour;
					hElem.setAttribute('term',k);

					textNode = textNode.splitText(hFind.index+hFind[0].length-hFind[k+1].length);
					textNode.deleteData(0,(hElem.textContent=hFind[k+1]).length);
					textNode.parentNode.insertBefore(hElem,textNode);
				}
			}
			toolbar.bar.removeAttribute('busy');
		},
		get: function(expr,el) {
			if( (el = el||document).querySelectorAll ) {
				el = el.querySelectorAll('userjs-ush-highlight'+expr.replace(/@/g,''));
				el.snapshotLength = el.length;
				el.snapshotItem = function(i) { return this[i]; }
				return el;
			}
			return document.evaluate('.//*[local-name()="userjs-ush-highlight"]'+expr,el,null,7,null);
		},
		remove: function(toggle,idx,el) {
			var i, j, node, nodes = this.get('[@iID="'+iID+'"][@term'+(idx!==undefined?'="'+idx+'"]':']'),el);
			i = nodes.snapshotLength; while( i-- ) {
				node = nodes.snapshotItem(i);
				if( toggle ) { node.setAttribute((j = node.hasAttribute('on'))?'off':'on',''); node.removeAttribute(j?'on':'off'); }
				else { j = node.parentNode; j.replaceChild(node.firstChild,node); j.normalize(); }
			}
			return el;
		}
	},
	mutation = {
		timer: null,
		types: [
			['DOMNodeInsertedIntoDocument',true],
			['DOMNodeRemovedFromDocument',true],
			['DOMCharacterDataModified',false]
		],
		handlers: {
			DOMNodeInsertedIntoDocument: [highlight.add],
			DOMNodeRemovedFromDocument: [],
			DOMCharacterDataModified: [highlight.add]
		},
		handleEvent: function(e) {
			var i, handler;
			window.clearTimeout(this.timer);
			USH.running(1);
			for( i = 0; handler = this.handlers[e.type][i++]; ) {
				if( handler instanceof Function || (handler = handler.handleEvent) instanceof Function ) { handler(e); }
			}
			this.timer = window.setTimeout(function(el) { USH.running(1); toolbar.update(); USH.running(0); },500);
			USH.running(0);
		}
	},
	resolver = {
		xhtmlNS: 'http://www.w3.org/1999/xhtml',
		lookupNamespaceURI: function() { return this.xhtmlNS; }
	},
	results = {
		regExp: null,
		terms: null,
		timer: null,
		clear: function() { window.clearTimeout(this.timer); this.terms = this.regExp = null; },
		handleEvent: function(e) {
			var	el = e.target, idx = el.getAttribute('idx'), term = this.terms[idx], d, t = toolbar, o, x, xT, y, yT;
			if( !term || !term.total ) { return }
			window.clearTimeout(this.timer);

			if( e.ctrlKey ) { if( --term.current < 0 ) { term.current = term.total-1; } }
			else if( ++term.current >= term.total ) { term.current = 0; }
			USH.running(1); el.childNodes[1].data = term.text+' ['+(Math.pow(10,(term.total+'').length)+term.current+1+'').substring(1)+'/'+term.total+'] '; USH.running(0);
			if( !(el = highlight.get('[@iID="'+iID+'"][@term="'+idx+'"]').snapshotItem(term.current)) ) { return; }
			t.mOver.className = t.bar.className = 'userjs-ush-hide';
			d = getDim(el);
			t.mOver.className = t.bar.className = '';
			if( !d.visible ) { return (e.run = term.current||!e.run)?this.handleEvent(e):0; }

			this.timer = window.setTimeout(function(el) { var r = document.createRange(); r.selectNodeContents(el); window.getSelection().addRange(r); results.timer = null; },500,el);
			el.focus();

			el.scrollIntoView(!preferences.toolbarAtBottom);
			d = getDim(el); o = getDim(t.input).height; t = getDim(t.bar);
			x = d.left-o; xT = t.left; y = d.bottom+o; yT = t.visible?t.top:0;
			window.scrollBy((x<xT || (x=d.right+o)>(xT=t.right))?x-xT:0,preferences.toolbarAtBottom?(y>yT?y-yT:0):((y=d.top-o)<(yT=t.visible?t.bottom:0)?y-yT:0));
		},
		init: function() {
			var i, j, k, qArr, q = query, isRE = preferences.useRegExp, term, terms = [], tmp = [],
			punc = /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g,
			wb = (preferences.wholeWordsOnly && /[^\x20-\x7e]/.test(q))?/[\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\xa9\xab-\xb4\xb6-\xb9\xbb-\xbf\xd7\xf7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02ED\u02EF-\u02FF\u0374\u0375\u037E-\u0385\u0387\u03F6\u0482\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3-\u060F\u061B-\u061F\u066A-\u066D\u06D4\u06DD\u06E9\u06FD\u06FE\u0700-\u070F\u07F6-\u07F9\u0964\u0965\u0970\u09F2-\u09FA\u0AF1\u0B70\u0BF0-\u0BFA\u0CF1\u0CF2\u0DF4\u0E3F\u0E4F\u0E5A\u0E5B\u0F01-\u0F17\u0F1A-\u0F1F\u0F2A-\u0F34\u0F36\u0F38\u0F3A-\u0F3D\u0F85\u0FBE-\u0FC5\u0FC7-\u0FD1\u104A-\u104F\u10FB\u1360-\u137C\u1390-\u1399\u166D\u166E\u1680\u169B\u169C\u16EB-\u16F0\u1735\u1736\u17B4\u17B5\u17D4-\u17D6\u17D8-\u17DB\u17F0-\u180A\u180E\u1940-\u1945\u19DE-\u19FF\u1A1E\u1A1F\u1B5A-\u1B6A\u1B74-\u1B7C\u1FBD\u1FBF-\u1FC1\u1FCD-\u1FCF\u1FDD-\u1FDF\u1FED-\u1FEF\u1FFD-\u2070\u2074-\u207E\u2080-\u208E\u20A0-\u20B5\u2100\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u2153-\u2182\u2190-\u2B23\u2CE5-\u2CFF\u2E00-\u3004\u3007-\u3029\u3030\u3036-\u303A\u303D-\u303F\u309B\u309C\u30A0\u30FB\u3190-\u319F\u31C0-\u31CF\u3200-\u33FF\u4DC0-\u4DFF\uA490-\uA716\uA720\uA721\uA828-\uA82B\uA874-\uA877\uD800-\uF8FF\uFB29\uFD3E\uFD3F\uFDFC\uFDFD\uFE10-\uFE19\uFE30-\uFE6B\uFEFF-\uFF0F\uFF1A-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFE0-\uFFFD]/.source:'\\b',
			sw = searchEngines[0]&2 && !preferences.useStopwords && /(?:^|\s)(?:intext:|(?:filetype|site|related|info|daterange|link|inurl|inanchor|intitle):\S*|(?:I|a|about|an|are|as|at|be|by|com|for|from|how|in|is|it|of|on|or|that|the|this|to|was|what|when|where|who|will|with|and|the|www)(?=$|\s))/gi;

/*	注意!
 	上面的单词不会被自动搜索,
 	需要手动点击搜索按钮.
*/

			if( !q.indexOf('USHRegExp ') ) { isRE = true; q = q.substring(10); }
			if( isRE ) { qArr = [,,q]; }
			else {
				qArr = (searchEngines[0]&2?query=q.replace(/\++?(\+)?/g,' $1'):q).split(/([\s+|\-]*)"([^"]*)"/);
				for( i = 0; (term = qArr[i]) != null; i+=3 ) {
					if( !term ) { qArr[i] = 1; continue; }
					term = (' '+(sw?term.replace(sw,' '):term)).split(/([\s+|][\s+|\-]*)/);
					for( j = 0, k = (term.length-1)/2; j < k; j++ ) { qArr.splice(i+3*j,0,0,term[2*j+1],term[2*j+2]); }
					qArr[i+=3*j] = 1;
				}
			}
			for( i = 2, j = 0; (term = qArr[i]) != null; i += 3 ) {
				if( !term || terms['_'+term] || (/-$/).test(qArr[i-1]) ) { continue; }
				terms[j] = isRE?term:term.replace(punc,(qArr[i-2]||preferences.usePunctuation||!term.replace(punc,''))?'\\$&':punc.source+'?');
				terms['_'+term] = true;
				tmp[j] = { text: qArr[i-2]?'"'+term+'"':term, colour: colours[j++%colours.length], total: 0, current: -1 };
			}

			term = (!isRE && preferences.wholeWordsOnly?'(?:^|'+wb+')(?:('+terms.join(')|(')+'))(?='+wb+'|$)':'('+terms.join(')|(')+')');
			try { this.regExp = new RegExp(term,preferences.matchCase?'':'i'); }
			catch(e) { return log(strings._regExpError+term); }
			this.terms = tmp.length?tmp:null;
			if( searchEngines[0]&(window==window.top?13:15) ) { return; }
			saveVal('query',query);
			if( !toolbar.onInput.timer ) { window.setTimeout(function() { searchData.historyAdd(query); },0); }
		}
	},
	searchData = {
		keys: ['hash','referrer','storage'],
		assign: function(data) {
			var i, key, sE, rE = new RegExp();
			if( data && (data = data.split('|')) ) {
				for( i = 0; key = this.keys[i]; this[key] = decodeURIComponent(data[i++])||this[key] );
			}
			for( i = 1; sE = searchEngines[i++]; ) {
				data = '';
				switch( searchEngines[0] = sE[0] ) {
					case 1:
						data = this.hash;
						break;
					case 2:  case 3:
						if( !preferences.runOnSE ) { }
						else if( (rE.compile('^https?://'+sE[1])||rE).test(window.location) ) {
							if( sE[0] == 3 ) { data = window.location; }
							else if( preferences.useWindowName ) { window.name = window.location; }
						} else if( rE.test(this.referrer) ) { data = (sE[0]==2)&&this.referrer; }
						break;
					case (preferences.useDOMStorage||preferences.useCookies)&&4:
						data = this.storage;
				}

				if( data && (rE.compile(sE[3])||rE).test(data) ) {
					for( i = 1, query = '', data = data.split(rE); key = data[i]; i+=2 ) { 
						query += ' '+decodeURIComponent(key); 
					}
					query = query.substring(1);
					if( sE[4] ) {
						try { query = new Function('q',sE[4])(query); }
						catch(e) { log(strings._preProcessError+sE[4]); }
					}
					break;
				}
			}
		},
		historyAdd: function(val) {
			if( this.history && val ) {
				this.historyDel(val);
				USH.running(1); this.history.setItem(toolbar.list.insertBefore(new window.Option(),toolbar.list.firstChild).value = val,0); USH.running(0);
				if( this.history.length > preferences.enableSearchHistory ) { this.historyDel(toolbar.list.lastChild.value); }
			}
		},
		historyDel: function(val) {
			if( this.history && (val = document.evaluate('./option[@value=../@val]',toolbar.list.setAttribute('val',val)||toolbar.list,null,9,null).singleNodeValue) ) {
				this.history.removeItem(val.value);
				USH.running(1); toolbar.list.removeChild(val); USH.running(0);
			}
		},
		historyClear: function() {
			if( this.history ) {
				USH.running(1); toolbar.list.textContent = ''; USH.running(0);
				this.history.clear();
			}
		},
		init: function(store) {
			this.hash = window.location.hash;
			this.referrer = (preferences.useWindowName && !!window.opener && window.opener.name)||document.referrer;
			this.storage = preferences.useDOMStorage?window.localStorage.getItem('UserJS-USH'):preferences.useCookies?document.cookie:'';
			this.history = store;
			delete this.init;
		},
		toString: function() { for( var data = '', key, i = 0; key = this.keys[i++]; data += encodeURIComponent(this[key])+'|' ); return data; }
	},
	toolbar = {
		enabled: false,
		timer: null,
		visible: false,
		bar: null,
		buttons: [],
		closeBttn: null,
		list: null,
		hideBttn: null,
		input: null,
		mOver: null,
		newBttn: null,
		optsBttn: null,
		optsMenu: null,
		styles: null,
		create: function() {
			var xhtmlNS = resolver.xhtmlNS, divEl, elem, i, term, terms;

			function createButton(id,fn) {
				var el = document.createElementNS(xhtmlNS,'userjs-ush-bttn');
				el.className = 'userjs-ush-bttn-icon-'+id; el.title = strings['_'+id];
				el.addEventListener('click',fn||function(e){ USH.run(e,this.className); },false);
				return toolbar.bar.appendChild(toolbar[id+'Bttn'] = el);
			}

			function createPref(id,fn) {
				var el = document.createElementNS(xhtmlNS,'label');
				el.appendChild(document.createElementNS(xhtmlNS,'input')).type = 'checkbox';
				el.firstChild.setAttribute('prefIdx',id);
				el.firstChild.checked = preferences[id];
				el.firstChild.addEventListener('change',fn||function(e) { saveVal(this.getAttribute('prefIdx'),this.checked); USH.run(e,'userjs-ush-bttn-icon-new'); },false);
				el.appendChild(document.createTextNode(strings['_'+id]));
				return toolbar.optsMenu.appendChild(el);
			}

			if( !this.bar ) {
				(divEl = this.bar = document.createElementNS(xhtmlNS,'userjs-ush-toolbar')).tabIndex = 0;
				divEl.focus = function(oF) { return function() {
					this.className = 'userjs-ush-prefocus';
					oF.call(this);
					this.className = '';
				}}(divEl.focus);

				(this.bar.appendChild(this.optsMenu = document.createElementNS(xhtmlNS,'optgroup'))).className = 'userjs-ush-fade';
				createPref('usePunctuation');
				createPref('wholeWordsOnly');
				createPref('matchCase');
				createPref('useRegExp');

				createButton('close');
				createButton('hide');
				createButton('opts',function(e) {
					var active = this.hasAttribute('active');
					this[active?'removeAttribute':'setAttribute']('active','');
					toolbar.optsMenu.className = (active||e.ctrlKey)?'userjs-ush-fade':'';
				});

				(this.input = i = this.bar.appendChild(document.createElementNS(xhtmlNS,'input'))).className = 'userjs-ush-input';
				i.value = query||'';
				i.setAttribute('form','');
				i.addEventListener('input',this.onInput,false);

				createButton('new');

				if( searchData.history ) {
					i.setAttribute('list',(this.list = this.bar.appendChild(document.createElementNS(xhtmlNS,'datalist'))).id = 'userjs-ush-list');
					createPref('clearHistory',function() { searchData.historyClear(); this.checked = false; });
					window.setTimeout(function(h) { USH.running(1); for( var i = h.length; i; toolbar.list.appendChild(new window.Option()).value = h.key(--i) ); USH.running(0); },0,searchData.history);
				}

				(this.mOver = document.createElementNS(xhtmlNS,'userjs-ush-mouseover')).addEventListener('click',this,false);
				if( !preferences.autoHideDelay ) { preferences.toolbarOverText = false; }
				else {
					divEl.addEventListener('DOMFocusOut',this,false);
					divEl.addEventListener('mouseout',this,false);
					divEl.addEventListener('mouseover',this,false);
					this.mOver.addEventListener('mouseover',this,false);
				}

				if( preferences.embedStyle || !preferences.toolbarOverText ) {
					(this.styles = document.createElementNS(xhtmlNS,"style")).textContent = 'html { position: relative !important; }'+(preferences.embedStyle?'\
					userjs-ush-mouseover { height: 1em !important; z-index: 99999980 !important; }\
					userjs-ush-toolbar { background: -o-skin("Viewbar Skin") #f2f2ee !important; -moz-appearance: statusbar; z-index: 99999990 !important; }\
					userjs-ush-toolbar[mini=on], userjs-ush-mouseover[mini=on] { right: auto !important; min-width: 26.5em !important; }\
					userjs-ush-toolbar[top], userjs-ush-mouseover[top] { bottom: auto !important; top: 0 !important; }\
					.userjs-ush-prefocus { margin: 1em !important; }\
					#userjs-ush-list, .userjs-ush-hide { display: none !important; }\
					userjs-ush-toolbar, userjs-ush-toolbar *, userjs-ush-highlight[on] { text-align: left !important; text-indent: 0 !important; margin: 0 !important; padding: 0 !important; min-height: 0 !important; height: auto !important; max-height: none !important; min-width: 0 !important; width: auto !important; max-width: none !important; float: none !important; clear: none !important; color: #000 !important; -o-transition: opacity .5s, visibility .5s !important; }\
					userjs-ush-toolbar, userjs-ush-mouseover { display: block !important; position: fixed !important; width: 100% !important; min-width: 100% !important; font: 12px/18px Arial, sans-serif !important; padding: 1px 0 !important; }\
					userjs-ush-toolbar * { display: inline-block !important; font: inherit !important; vertical-align: middle !important; border: none !important; box-sizing: border-box !important; margin: 2px !important; text-shadow: #FFF 0 0 5px !important; }\
					userjs-ush-highlight[off] { background: transparent !important; color: inherit !important; }\
					userjs-ush-highlight:focus { outline: -o-highlight-border !important; }\
					userjs-ush-bttn { background: -o-skin("Infobar Button Skin") !important; -moz-appearance: toolbarbutton; padding: 2px 4px !important; }\
					userjs-ush-bttn:hover { background: -o-skin("Infobar Button Skin.hover") !important; }\
					userjs-ush-bttn:active, userjs-ush-bttn[active] { background: -o-skin("Infobar Button Skin.pressed") !important; }\
					userjs-ush-bttn>userjs-ush-icon { width: 1em !important; height: 1em !important; border: 1px #BBB solid !important; }\
					userjs-ush-bttn>.userjs-ush-icon-prev { background: url("chrome://global/skin/icons/collapse.png") 50% 50% no-repeat !important; background: -o-skin("Find Previous") !important; width: 1.3em !important; height: 1.3em !important; margin: 0 .3em 0 0 !important; border-width: 0 1px 0 0 !important; opacity: 0.7 !important; }\
					userjs-ush-bttn>userjs-ush-icon:hover { border-color: #666 !important; opacity: 1 !important; }\
					[class^=userjs-ush-bttn-icon], [class^=userjs-ush-bttn-icon]::before { content: "" !important; float: right !important; min-height: 1.5em !important; min-width: 1.5em !important; }\
					.userjs-ush-bttn-icon-opts::before { background: url("chrome://global/skin/icons/question-16.png") 50% 50% no-repeat !important; background: -o-skin("View") !important; }\
					.userjs-ush-bttn-icon-new::before { background: url("chrome://global/skin/icons/Search-glass.png") 50% 50% no-repeat !important; background: -o-skin("Find") !important; }\
					userjs-ush-toolbar[busy]>.userjs-ush-bttn-icon-new { background: -o-skin("Infobar Button Skin.pressed") !important; }\
					.userjs-ush-bttn-icon-hide::before { background: url("chrome://global/skin/icons/Restore.gif") 50% 50% no-repeat !important; background: -o-skin("Mail Compose Text Color") !important; }\
					.userjs-ush-bttn-icon-close::before { background: url("chrome://global/skin/icons/Close.gif") 50% 50% no-repeat !important; background: -o-skin("Close Widget") !important; }\
					.userjs-ush-bttn-icon-opts, .userjs-ush-bttn-icon-new { float: none !important; }\
					.userjs-ush-input { min-width: 16em !important; background: -o-skin("Edit Skin") !important; padding: 4px 3px 3px !important; }\
					userjs-ush-toolbar>optgroup { position: absolute !important; bottom: 100% !important; background: -o-skin("Rich Popup Menu Skin") !important; padding: 1em !important; }\
					.userjs-ush-fade { visibility: hidden !important; opacity: 0 !important; }\
					userjs-ush-toolbar>optgroup>* { display: block !important; }\
					userjs-ush-toolbar[top]>optgroup { bottom: auto !important; top: 100% !important; }\
					userjs-ush-remove-word {position:absolute !important;background: -o-skin("Expand Disabled") !important; margin: -8px 0 0 -7px !important; width: 17px !important; height: 17px !important;opacity: 0.35 !important;}\
					userjs-ush-remove-word:hover{cursor: pointer !important;opacity: 1 !important;}\
					':'');
				}
			}
/* 修改的地方：样式表
	userjs-ush-remove-word 样式
*/
			this.visible = false;
			if( this.enabled ) { return; }
			if( this.styles ) { document.documentElement.appendChild(this.styles); }
			if( !preferences.toolbarAtBottom ) {
				this.bar.setAttribute('top','');
				this.mOver.setAttribute('top','');
			}
			if( preferences.toolbarOverText ) {
				this.bar.setAttribute('mini','on');
				this.mOver.setAttribute('mini','on');
			}
			if(preferences.runOnLoad){
				document.documentElement.appendChild(this.mOver);
				document.documentElement.appendChild(this.bar);
				if( !preferences.toolbarOverText ) { document.addEventListener('resize',this,false); }
				this.enabled = true;
			} else {
				this.enabled = false;
			}
		},
		handleEvent: function(e,state) {
			window.clearTimeout(this.timer);
			if( e ) { switch( e.type||e ) {
				case 'click':	this.bar.focus(); break;
				case 'DOMFocusOut':
					if( e.target == this.input && !this.onInput.timer && e.target.hasAttribute('pattern') ) {
						searchData.historyAdd(e.target.value);
						e.target.removeAttribute('pattern');
					}
					if( results.timer || contains(this.bar,document.activeElement||document.body) ) { return; }
					if( !this.optsMenu.className ) { this.optsBttn.click(); }
				case 'mouseout':
					return this.timer = (document.activeElement==this.input?null:window.setTimeout(function(t) { t.handleEvent(null,false); },preferences.autoHideDelay,this));
				case 'resize':
					if( !this.styles.parentNode ) { USH.running(1); document.documentElement.appendChild(this.styles); USH.running(0); }
					this.styles.sheet.cssRules[0].style[e = 'margin'+(preferences.toolbarAtBottom?'Bottom':'Top')] = '';
					return this.visible && (this.styles.sheet.cssRules[0].style[e] = parseInt(window.getComputedStyle(document.documentElement,'')[e])+getDim(this.bar).height+'px !important');
				default: state = true;
			}}
			this.bar.className = ((state=(state===undefined?!this.visible:state))||this.optsBttn.hasAttribute('active'))?'':'userjs-ush-fade';
			if( this.visible != (this.visible = state) && !preferences.toolbarOverText ) { this.handleEvent('resize'); }
		},
		onInput: {
			oVal: '',
			timer: null,
			triggered: false,
			handleEvent: function(e,fill) {
				this.timer = window.clearTimeout(this.timer);
				if( this.triggered ) { return this.triggered = false; }
				var i = toolbar.input, val = i.value, uVal = val.toUpperCase(), lVal = val.toLowerCase(), opt = '';

				this.timer = (fill === undefined)&&preferences.inputDelay&&window.setTimeout(function(i,val) {
					USH.run(val,document.activeElement==i?'newEdit':'new');
					toolbar.onInput.handleEvent(null,opt);
				},preferences.inputDelay,i,val);

				if( !toolbar.list ) { return; }
				i.setAttribute('pattern',lVal.replace(/[a-z]/g,function(l,i){ return '['+l+uVal[i]+']'; })+'.*');
				toolbar.list.setAttribute('uVal',uVal); toolbar.list.setAttribute('lVal',lVal);
				if( fill || val.length > this.oVal.length && (opt = document.evaluate('./option[starts-with(translate(@value,../@uVal,../@lVal),../@lVal)]',toolbar.list,null,9,null).singleNodeValue) ) {
					opt = fill||opt.value;
					i.value += opt.substring(val.length);
					i.setSelectionRange(val.length,opt.length);
				}
				this.oVal = val;
			}
		},
		remove: function() {
			window.clearTimeout(this.timer);
			window.clearTimeout(this.onInput.timer);
			document.removeEventListener('resize',this,false);
			if( this.styles ) { this.styles.parentNode.removeChild(this.styles); }
			this.bar.parentNode.removeChild(this.bar);
			this.mOver.parentNode.removeChild(this.mOver);
			this.update();
			this.visible = this.enabled = false;
		},
		update: function() {
			if( !this.enabled ) { return; }
			var bttn, icon, pIcon, cIcon, i, term, terms, total, text;

			this.input.value = query||this.input.value;
			while( (terms = this.list||this.newBttn).nextSibling ) { this.bar.removeChild(terms.nextSibling); }
			i = (terms=this.optsMenu.children).length; while( i ) { (term = terms[--i].firstChild).checked = preferences[term.getAttribute('prefIdx')]; }

			if( preferences.toolbarOverText ) {
				this.bar.setAttribute('mini',results.terms?'':'on');
				this.mOver.setAttribute('mini',results.terms?'':'on');
			}

			if( !results.terms ) { return; }
			bttn = document.createElementNS(resolver.xhtmlNS,'userjs-ush-bttn');
			icon = document.createElementNS(resolver.xhtmlNS,'userjs-ush-icon');
			cIcon = document.createElementNS(resolver.xhtmlNS,'userjs-ush-remove-word');

			for( i = 0,StrArr=new Array(); term = results.terms[i]; i++ ) {
				(this.buttons[i] = bttn = bttn.cloneNode(false)).setAttribute('idx',i);
				text = bttn.textContent = term.text;
				total = highlight.get('[@iID="'+iID+'"][@term="'+i+'"]').snapshotLength;
				bttn.title = total?strings._goto+' "'+text+'"':'"'+text+'" '+strings._nfound;
				if( total ) {
					if( term.current >= total ) { term.current -= term.total - total; }
//					bttn.addEventListener('click',results,false);
					bttn.textContent += ' ['+(Math.pow(10,(total+'').length)+term.current+1+'').substring(1)+'/'+total+'] ';
					(pIcon = bttn.insertBefore((pIcon||icon).cloneNode(false),bttn.firstChild)).className = 'userjs-ush-icon-prev';
					pIcon.addEventListener('click',function() { results.handleEvent({target: this.parentNode, ctrlKey: true}); },false);
					pIcon.title = strings._gotoPrev+' "'+text+'"';
					(icon = bttn.appendChild(icon.cloneNode(false))).setAttribute('style','background: '+term.colour);
					icon.addEventListener('click',function() { highlight.remove(true,this.parentNode.getAttribute('idx')); },false);
					icon.title = strings._hide;
					bttn.title+=strings._editfound;
				} else
					bttn.title+=strings._editNfound;
/* 修改的地方：编辑+移除按钮
	使词语可编辑
	为词语增加移除按钮，
*/
				bttn.addEventListener('click',function(e) {
					if(this.title!=e.target.title) return;
					var i=this.getAttribute('idx');
					var t=StrArr[i];
					if(!e.ctrlKey) {
						if(this.textContent!=t){
							results.handleEvent({target: this, ctrlKey: false}) ;
							return;
						}
					}
					var text=prompt(strings._editThis, t);
					if(text==t || text==null) return;
					if(text!=t){
						var ts=text.split(/[\s\n+|]+/);
						StrArr.splice(i,1);
						query=" "+StrArr.join(" ")+" ";
						for (var tn, j=ts.length-1; tn=ts[j]; j--) {
							if(tn && query.indexOf(" "+tn+" ")==-1){
								StrArr.splice(i,0,tn);
								query+=tn+" ";
							}
						};
						if(StrArr.length>0){
							query=StrArr.join(" ");
							run();
						} else {
							toolbar.input.value='';
							USH.run('','new');
						}
					}
				},false);
				StrArr.push(text);
				(cIcon = bttn.appendChild(cIcon.cloneNode(false))).value=i;
				cIcon.addEventListener('dblclick',function() {
					StrArr.splice(this.value,1);
					if(StrArr.length>0){
						query=StrArr.join(" ");
						run();
					} else {
						toolbar.input.value='';
						USH.run('','new');
					}
				},false);
				cIcon.title = strings._remove+' "'+text+'"';
				term.total = total;
				this.bar.appendChild(bttn);
			}
		},
		enable:function(){
			preferences.toolbarHiddenOnLoad=false;
			preferences.highlightOnLoad=true;
			if(!preferences.runOnLoad){
				preferences.runOnLoad=true;
				this.create();
			}
			return this.input.value;
		}
	},
	contains = function(el1,el2) { return el1 == el2 || !!(el1.contains?el1.contains(el2):el1.compareDocumentPosition(el2)&16); },
	exit = function() {
		USH.running(1);
		highlight.remove();
		saveVal('query',query='');
		results.clear();
		toolbar.remove();
		USH.running(0);
	},
	getDim = function(el) {
		var t1 = -window.pageYOffset, t = t1, l1 = -window.pageXOffset, l = l1, d, oEl = el, h = el.offsetHeight, w = el.offsetWidth;
		if( el.getBoundingClientRect ) { d = el.getBoundingClientRect(); }
		else { while( el ) { t += el.offsetTop; l += el.offsetLeft; el = el.offsetParent; } }
		d = {left:d?d.left:l, top:d?d.top:t, right:d?d.right:w+l, bottom:d?d.bottom:h+t, height:h, width:w};
		d.visible = h && w && d.bottom>t1 && d.right>l1 && (contains(oEl,el=document.elementFromPoint((merlin?-l1:0)+(d.left+d.right)/2,(merlin?-t1:0)+(d.top+d.bottom)/2)||oEl) || contains(el,oEl));
		return d;
	},
	log = function() { return (window.opera?window.opera.postError:console.log)(arguments); },
	run = function() {
		USH.running(1);
		toolbar.create();
		if( query !== null && (!searchEngines[0] || preferences.highlightOnLoad) ) {
			results.init();
			highlight.remove();
			highlight.add();
			toolbar.update();
		}
		toolbar.handleEvent(searchEngines[0] && window!=window.top?null:'click',!preferences.autoHideDelay||!searchEngines[0]||!preferences.toolbarHiddenOnLoad);
		searchEngines[0] = 0;
		USH.running(0);
	},
	saveVal = function(key,val) {
		preferences[key] = val;
		if( key != 'query' ) { return; }
		if( preferences.useDOMStorage ) {
			val?window.localStorage.setItem('UserJS-USH','UserJS-USH='+val):window.localStorage.removeItem('UserJS-USH');
		}
		else if( preferences.useCookies ) {
			document.cookie = 'UserJS-USH='+encodeURIComponent(val)+';path=/;'+(val?'':'expires='+new window.Date(0).toGMTString());
		}
	};

	this.init = function(prefs,store) {
		var doc = document.documentElement, loadFn = {handleEvent: function(oE) {
			if( oE ) { window.opera.removeEventListener(oE.type,this,false); }
			(merlin?window.top.document:window.top).postMessage(window==window.top?'USH|load|':'USH|loadFrame','*');
		}};
		if( !(doc instanceof window.HTMLHtmlElement) && window.opera ) { return; }
		delete this.init;

		if( prefs instanceof Function ) {
			preferences = prefs('preferences');
			colours = prefs('colours');
			searchEngines = prefs('searchEngines');
			strings = prefs('strings');
			delete window.opera.USHprefs;
		}
		else if( prefs instanceof Storage ) {
			for( var i = 0, key; key = prefs.key(i++); ) {
				preferences[key] = JSON.parse(window.atob(prefs[key]));
			}
		}

		preferences.useDOMStorage = preferences.useDOMStorage && (typeof window.localStorage == 'object');

		if( preferences.checkDocChanges ) {
			this.addEventListener = function(type,handler) {
				USH.running(1); USH.running(0);
				if( mutation.handlers[type] && handler ) { mutation.handlers[type].push(handler); }
			}
		}

		searchData.init(preferences.enableSearchHistory && store);

		if( preferences.hideHighlightHTML && window.opera && window.Element.prototype.__lookupGetter__ ) {
			var iHG = doc.__lookupGetter__('innerHTML'), iHS = doc.__lookupSetter__('innerHTML'),
					oHG = doc.__lookupGetter__('outerHTML'), oHS = doc.__lookupSetter__('outerHTML');
			window.Element.prototype.__defineGetter__('innerHTML',function() { return iHG.call(highlight.remove(false,undefined,this.cloneNode(true))); });
			window.Element.prototype.__defineSetter__('innerHTML',iHS);
			window.Element.prototype.__defineGetter__('outerHTML',function() { return oHG.call(highlight.remove(false,undefined,this.cloneNode(true))); });
			window.Element.prototype.__defineSetter__('outerHTML',oHS);
		}

		(window.opera?window.opera:window).addEventListener(window.opera?'BeforeEvent.message':'message',function(oE) {
			var e = oE.event||oE, msg = e.data.toString(), data;
			if( !!msg.indexOf('USH|') ) { return; }
			oE.preventDefault();
			switch( msg = msg.substring(4) )	{
				case 'loadFrame':
					e.source.postMessage('USH|frameIndex|'+frames.length,'*');
					e.source.postMessage('USH|load|'+searchData,'*');
					frames[frames.length] = e.source;
					break;
				case 'frameIndex|'+(data=msg.substring(11)):
					frameIndex = data;
					break;
				case 'load|'+(data=msg.substring(5)):
					searchData.assign(data);
					if( !query && USH.query ) {
						query = USH.query;
						searchEngines[0] = 8;
						delete USH.query;
					}
					if( query && searchEngines[0] ) { run(); }
					break;
				case 'run|'+(data=msg.substring(4)):
					data = data.split('|');
					USH.run(data[0],data[1],data[2]^0);
			}
		},false);

		(window.opera?window.opera:window).addEventListener(window.opera?'BeforeEvent.keypress':'keypress',({
			enabled: false,
			keys: {},
			event: document.createEvent('MouseEvents'),
			init: function() {
				var i, j, key, code;
				for( i = j = 0; key = preferences.keyShortcuts[i++]; j = 0 ) {
					if( key[1] ) {
						while( code = key[1].charCodeAt(j++) ) { this.keys['_'+code] = key[0]; }
						this.keys[key[0]] = (key[2]<<0) + (key[3]<<1) + (key[4]<<2);
					}
				}
				this.enabled = (this.keys.enable === undefined);
				return this;
			},
			handleEvent: function(oE) {
				var e = oE.event||oE, el = e.target, key = e.keyCode||e.charCode, bttn = this.keys['_'+key],
						keyChk = (this.keys[bttn]&1 || this.keys[bttn] == (e.ctrlKey<<1) + (e.shiftKey<<2))&&bttn;
				if( keyChk == 'run' ) {
					var text=window.getSelection().toString();
					if(preferences.runOnLoad){
						if(text==''){
							toolbar.update();
						} 
					} else {
						query=toolbar.enable();
					}
					if(text==''){
							return USH.run(query,'newSelect');
					} else {
						query+=' '+text
						return USH.run(query,'newSearch');
					}
				}
				if( el == toolbar.input ) {
					toolbar.onInput.triggered = !e.which;
					switch( key ) {
						case 13: USH.run(e,'userjs-ush-bttn-icon-new'); break;
						case 27: el.blur(); break;
						case 8:
							if( !e.ctrlKey ) { break; }
							searchData.historyDel(el.value);
							USH.run(el.value = '','newEdit');
					}
				}
				if( el.forms instanceof window.NodeList ) { return; }
				if( preferences.runOnKeyPress && e.which ) { return USH.run(null,'newEdit'); }
				if( !toolbar.enabled ) { return; }

				if( keyChk == 'enable' ) { this.enabled = !this.enabled; }
				if( this.enabled && keyChk !== false && (bttn = ((typeof bttn == 'number')?toolbar.buttons:toolbar)[bttn]) ) {
					oE.preventDefault(); e.preventDefault();
					this.event.initMouseEvent('click',true,true,window,1,0,0,0,0,e.ctrlKey,e.altKey,e.shiftKey,e.metaKey,0,null);
					bttn.dispatchEvent(this.event);
				}
			}
		}).init(),false);

		if( !window.opera || window.document.readyState != 'loading' ) { return loadFn.handleEvent(); }
		window.opera.addEventListener('AfterEvent.DOMContentLoaded',loadFn,false);
		if( window == window.top ) {
			searchData.assign();
			if( query ) { saveVal('query',query); }
		}
	}

	this.run = function(e,action,frame) {
		toolbar.enable();
		var i = toolbar.enabled && toolbar.input, f;
		frame = frame || e&&e.shiftKey;
		switch( action ) {
			case 'userjs-ush-bttn-icon-close':
				i && exit();
				break;
			case 'userjs-ush-bttn-icon-hide':
				i && highlight.remove(true);
				break;
			case 'userjs-ush-bttn-icon-new':
				return i && USH.run(i.value.replace(/^\s*(USHRegExp\s)?\s*/,e&&e.ctrlKey?'USHRegExp ':'$1'),'new',frame);
/*	修改的地方：划词高亮
	新增搜索时可以保留原来的高亮
*/
			case 'newS'+action.substring(4):
			//	if( !e || e == window.location ) { 
				if(e==''){
					run();
					i && i.focus();
					return;
				}
				searchEngines[0] = 2;
				var es=e.split(/[\s\n+|]+/);
				var j=0;
				if(query){
					e=query;
					query=' '+query+' ';
				} else {
					e=es[0];
					query=' ';
					j=1;
				}
				for(var en; en=es[j]; j++){
					if(en && query.indexOf(" "+en+" ")==-1){
						e+=" "+en;
						query+=en+" ";
					}
				}
				query = e;
				run();
				i = toolbar.input;
				break;
			//	if( action == 'newSearch' ) { window.setTimeout(function() { i.select(); i.focus(); },0); }
			//	if( action != 'newEdit' ) { break; }
			case 'newEdit':
				run();
				i && i.focus();
				break;
		}
		if( !frame ) { return; }
		if( window != window.top ) { return (merlin?window.top.document:window.top).postMessage('USH|run|'+query+'|'+action+'|'+frameIndex,'*'); }
		for( i = 0; f = frames[++i]; ) {
			if( i !== frame ) { (merlin?f.document:f).postMessage('USH|run|'+query+'|'+action,'*'); }
		}
	}

	this.running = function(val) {
		var i, type;
		if( val === undefined ) { return running; }
		val = val?1:running?2:0;
		if( preferences.checkDocChanges && val ) {
			for( i = 0; type = mutation.types[i++]; ) { document[val&1?'removeEventListener':'addEventListener'](type[0],mutation,type[1]); }
		}
		return running = !!(val&1);
	}
}).init((typeof widget == 'object' && widget.preferences.length)?widget.preferences:window.opera&&window.opera.USHprefs,window.opera&&window.opera.scriptStorage);