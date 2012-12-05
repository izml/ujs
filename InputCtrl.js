// ==UserScript==
// @name         InputBox Controller
// @author       izml
// @description  为输入框添加控制按钮，使其可以像 IE10 那样清除数据和显示密码！
// @version      0.2.0.0
// @created      2012-12-1
// @lastUpdated  2012-12-5
// @grant        none
// @run-at       document-start
// @namespace    http://userscripts.org/users/izml
// @homepage     http://userscripts.org/scripts/show/153275
// @updateURL    https://userscripts.org/scripts/source/153275.meta.js
// @downloadURL  https://userscripts.org/scripts/source/153275.user.js
// @downloadURL  https://raw.github.com/izml/ujs/master/InputCtrl.js
// @include  http*
// ==/UserScript==

window.onload=InputCtrl;
window.addEventListener('DOMContentLoaded',InputCtrl,false);
//window.addEventListener('DOMNodeInserted',InputCtrl,false);
function InputCtrl(){
	var opacity=0.15;		// 图标不透明度
	var AutoHidePwd=true;	// 自动隐藏密码
	var CtrlInput=false;
	try{if(document.doctype.name=='wml')return;}catch(evt){};
	var ins=document.getElementsByTagName('input');
	for(var i=ins.length-1;i>=0;i--){
		var input=ins[i];
		if(input.disabled || input.style.display=='none') continue;
		var c=input.previousElementSibling;
		if(c!=null){
			if(c.tagName=='INPUTCTRL'){
				if(c.getAttribute('Pos')=='1') continue;
				ChangePos(c,input);
				continue;
			}
		}
		var elem=document.createElement('InputCtrl');
		switch(input.type){
			case 'text': case 'email':
			case 'tel':
				elem.title='点击清除输出的内容！';
				elem.style.background='url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAABPUlEQVR42tXTzStEURjH8dHkXUkxSMqe+A8MQvhTZE+yoWSjlJX8Fyy9ZDeYlfwNSl7m2ikXje9Tv1un69y35Zz61Myce3+dOc/zlEqtuvoy9tvRmTdsGtsYSwlbxjq68oRdoIFDDHqemUUNATbTQidwhh808YkjVLRfxhzutW8+sJEUOoxdvDsvvGJfewu4wZezf4sVXcO/1YZR3V+gF37xghPUnbBQ3+3EHVn32IsdPDsn+XY+hzrpfJG2GVBo4ARF6gorFwm0h5fwGAuzk55ipGhj+woQecNB3lCrVlV/K3Tu7CFWKKv+MYbSwqxaa7iLFeAai55CRX06nhQ4hSvnZE2FV3WnvkI19Jt39rs1n08KrWnM4i21pea3Al1qXBNXv0bJHlxNaForxh7OMZOnMD2YzJiAima/BdcfNBhmqx0AwNkAAAAASUVORK5CYII=)';
				elem.onclick=function(e){
					e.target.style.display='none';
					var t=e.target.nextElementSibling
					t.value='';
					t.focus();
				};
				insertBefore(elem,input);
				break;
			case 'password':
				elem.title='点击显示/隐藏密码！';
				elem.style.background='url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAACpF6WWAAAA8ElEQVR42mNgGAX0BBxArALETkDsB8UuQKwFxDykGsYCxHZAvByIzwLxWyD+CcUg9mUg3gjEHkDMRsgwJiA2AOKdQPwbiP8D8WcgXgzEGUCcAsSzgfg9VO4vEB8GYiOoQ7ACF6gr/kPxRyAugwYDDIBclodkMAhfhboaAyhBvfYfCS+EGhgExOeB+C4QR0HFFqKpfQ8NfxTQjqYIhBOgcjeRxK5DxbKwqG8l19DbULEMLOrbSfX+RXK8D4uo62RE1E1cEQVLUmbQZIKepNKAOAlLkjoNxBb4khS+xP8bit+jJX4OSrJpABSTnU1HwSAEABh0afnLZ5nIAAAAAElFTkSuQmCC)';
				elem.type='pwd';
				if(AutoHidePwd){
					elem.onmouseover=function(e){
						e.target.nextElementSibling.removeEventListener('blur',SetPwd,false);
					};
					elem.onmouseleave=function(e){
						if(e.target.getAttribute('hide')=='1')
							e.target.nextElementSibling.addEventListener('blur',SetPwd,false);
					};
				}
				elem.onclick=function(e){
					var pwd=e.target.nextElementSibling;
					pwd.removeEventListener('blur',SetPwd,false)
					pwd.type = (pwd.type=='text') ? 'password' : 'text';
					pwd.focus();
					if(!AutoHidePwd) return;
					var b = (e.shiftKey) ? '0' : '1';
					e.target.setAttribute('hide',b);
				};
				input.onkeypress=function(e){if(e.keyCode==13)SetPwd(e);};
				insertBefore(elem,input);
				break;
			default:break;
		}
	}
	if(CtrlInput){
		var style=document.createElement('style');
		style.innerHTML='InputCtrl{position:absolute; display:none; width:20px; height:20px; background-repeat:no-repeat !important; background-position:center !important; opacity:'+opacity+'; z-index:9;} InputCtrl:hover{cursor:pointer; opacity:1;}';
		document.head.appendChild(style);
	}
	function insertBefore(e,i){
		CtrlInput=true;
		i.parentNode.insertBefore(e,i);
		i.oninput=InputState;
	//	i.onblur=InputState;
	//	i.onfocus=InputState;
		ChangePos(e,i);
	}
	function ChangePos(e,i){
		if(arguments.length>1){
			var c=e;
			if(i.offsetParent==null){
				c.style.marginLeft='280px';
				i.addEventListener('mouseover',ChangePos,false);
				c.setAttribute('Pos','0');
				return;
			}
		} else {
			var i=e.target;
			i.removeEventListener('mouseover',ChangePos,false);
			var c=i.previousElementSibling;
		}
		c.style.height=i.offsetHeight+'px';
		SetCtrlPos(c,i);
		SetCtrlVis(c,i);
	}
	function SetCtrlPos(c,i) {
		if(c.getAttribute('Pos')=='1') return;
		var p=getNext(c.previousSibling,0);
		var n=getNext(i.nextSibling,1);
		var top=i.offsetTop;
		var left=i.offsetLeft+i.offsetWidth-24;
		if(c.getAttribute('Pos')=='0'){
			top=0;
			left=i.offsetWidth-24;
		}
		if(p==null && n==null){
			top-=c.offsetTop;
			left=i.offsetWidth-24;
		//	left-=c.offsetLeft;
		} else if(p==null){
			if(n.offsetTop<top+i.offsetHeight){
				top-=c.offsetTop;
				if(n.tagName!='INPUT' && n.offsetLeft<=left+20 && n.offsetLeft+n.offsetWidth>=left)
					left=n.offsetLeft-24;
				else left=i.offsetWidth-24;	// left-=c.offsetLeft
			} else left-=c.offsetLeft
		} else if(n==null){
			left-=c.offsetLeft;
			if(p.offsetTop+p.offsetHeight>top){
				left=i.offsetWidth-24;
			}
			top-=c.offsetTop;
		} else {
			var nleft=i.offsetLeft;
			var ntop=top
			if(p.nodeType==3){
				c.style.display='inline';
				top-=c.offsetTop;
				left-=c.offsetLeft;
				return SetCtrlXY(c,top,left);
			}
			if(p.offsetTop+p.offsetHeight<=top){
				nleft=p.offsetLeft+p.offsetWidth;
				ntop=p.offsetTop;
			} else if(p.offsetLeft<=left+20 && p.offsetLeft+p.offsetWidth>=left){
				top-=c.offsetTop;
				left=p.offsetLeft-i.offsetLeft-24;
				return SetCtrlXY(c,top,left);
			}
			if(n.offsetTop<top+i.offsetHeight){
				top-=c.offsetTop;
				if(n.offsetLeft<=left+20 && n.offsetLeft+n.offsetWidth>=left){
					left=n.offsetLeft-nleft-24;
					return SetCtrlXY(c,top,left);
				}
			}
			left-=nleft;
		}
		SetCtrlXY(c,top,left);
	}
	function getNext(e,n){
		if(e==null) return e;
		var p=e.previousSibling;
		if(n>0) p=e.nextSibling;
		if(e.nodeType==3){
			if(/^\s+$/.test(e.textContent) || e.isElementContentWhitespace){
				return getNext(p,n);
			}
			return e;
		}
		if(e.nodeType==8){
			return getNext(p,n);
		}
		if(e.offsetParent==null || e.type=='hidden' || e.style.display=='none' || e.disabled=='true')
			return null;
		return e;
	}
	function SetCtrlXY(c,top,left){
		if(top!=0) c.style.marginTop=top+'px';
		c.style.marginLeft=left+'px';
		c.setAttribute('Pos','1');
	}
	function SetCtrlVis(c,i){
		if(i.value && i.value!='')
			c.style.display='inline';
		else c.style.display='';
	}
	function InputState(e){
		var i=e.target;
		SetCtrlVis(i.previousElementSibling,i);
	}
	function SetPwd(e){e.target.type='password';}
}
