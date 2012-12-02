// ==UserScript==
// @name		InputBox Controller
// @author		izml
// @description	Add Control Buttons to the InputBox Which Likes IE 10: Clear data & Show password!
// @version		0.1.4.2
// @created		2012-12-1
// @lastUpdated	2012-12-2
// @namespace	https://github.com/izml/
// @homepage	https://github.com/izml/ujs
// @downloadURL	https://raw.github.com/izml/ujs/master/InputCtrl.js
// @include		http*
// ==/UserScript==

window.onload=InputCtrl;
window.addEventListener('DOMContentLoaded',InputCtrl,false);
function InputCtrl(){
	var opacity=0.15;		// 图标不透明度
	var CtrlInput=false;
	try{if(document.doctype.name=='wml')return;}catch(evt){};
	var ins=document.getElementsByTagName('input');
	for(var i=ins.length-1;i>=0;i--){
		var input=ins[i];
		if(input.disabled) continue;
		try{
			var c=input.previousElementSibling;
			if(c.tagName=='INPUTCTRL'){
				ChangePos(c,input);
				continue;
			}
		}catch(evt){};
		var elem=document.createElement('InputCtrl');
		elem.className='InputCtrl';
		switch(input.type){
			case 'text': case 'email':
				elem.title='点击清除输出的内容！';
				elem.style.background='url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAABPUlEQVR42tXTzStEURjH8dHkXUkxSMqe+A8MQvhTZE+yoWSjlJX8Fyy9ZDeYlfwNSl7m2ikXje9Tv1un69y35Zz61Myce3+dOc/zlEqtuvoy9tvRmTdsGtsYSwlbxjq68oRdoIFDDHqemUUNATbTQidwhh808YkjVLRfxhzutW8+sJEUOoxdvDsvvGJfewu4wZezf4sVXcO/1YZR3V+gF37xghPUnbBQ3+3EHVn32IsdPDsn+XY+hzrpfJG2GVBo4ARF6gorFwm0h5fwGAuzk55ipGhj+woQecNB3lCrVlV/K3Tu7CFWKKv+MYbSwqxaa7iLFeAai55CRX06nhQ4hSvnZE2FV3WnvkI19Jt39rs1n08KrWnM4i21pea3Al1qXBNXv0bJHlxNaForxh7OMZOnMD2YzJiAima/BdcfNBhmqx0AwNkAAAAASUVORK5CYII=)';
				elem.onclick=function(e){
					e.target.nextElementSibling.value='';
				};
				insertBefore(elem,input);
				break;
			case 'password':
				elem.title='点击显示/隐藏密码！';
				elem.style.background='url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAACpF6WWAAAA8ElEQVR42mNgGAX0BBxArALETkDsB8UuQKwFxDykGsYCxHZAvByIzwLxWyD+CcUg9mUg3gjEHkDMRsgwJiA2AOKdQPwbiP8D8WcgXgzEGUCcAsSzgfg9VO4vEB8GYiOoQ7ACF6gr/kPxRyAugwYDDIBclodkMAhfhboaAyhBvfYfCS+EGhgExOeB+C4QR0HFFqKpfQ8NfxTQjqYIhBOgcjeRxK5DxbKwqG8l19DbULEMLOrbSfX+RXK8D4uo62RE1E1cEQVLUmbQZIKepNKAOAlLkjoNxBb4khS+xP8bit+jJX4OSrJpABSTnU1HwSAEABh0afnLZ5nIAAAAAElFTkSuQmCC)';
				elem.onclick=function(e){
					var pwd=e.target.nextElementSibling;
					pwd.type = (pwd.type=='text') ? 'password' : 'text';
				};
				insertBefore(elem,input);
				break;
			default:break;
		}
	}
	if(CtrlInput){
		var style=document.createElement('style');
		style.innerHTML='.InputCtrl{position:absolute;display:inline; width:20px; height:20px; background-repeat:no-repeat !important; background-position:center !important; opacity:'+opacity+'; z-index:999;} .InputCtrl:hover{cursor:pointer; opacity:1;}';
		document.head.appendChild(style);
	}
	function insertBefore(e,i){
		CtrlInput=true;
		i.parentNode.insertBefore(e,i);
		ChangePos(e,i);
	}
	function ChangePos(e,i){
		if(arguments.length>1){
			var c=e;
			if(i.offsetParent==null){
				c.style.marginLeft='280px';
				i.addEventListener('mouseover',ChangePos,false);
				return;
			}
		} else {
			var i=e.target;
			i.removeEventListener('mouseover',ChangePos,false);
			var c=i.previousElementSibling;
		}
		c.style.marginLeft=(i.offsetWidth-24)+'px';
		c.style.height=i.offsetHeight+'px';
	};
}
