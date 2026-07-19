/*
Copyright (C) NAVER corp.

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public
License as published by the Free Software Foundation; either
version 2.1 of the License, or (at your option) any later version.
*/
if(typeof window.nhn === "undefined") { window.nhn = {}; }
if(!nhn.husky) { nhn.husky = {}; }

(function(){
	function getEventProperty(oEvent, oNativeEvent, sProperty){
		if(typeof oEvent[sProperty] !== "undefined"){
			return oEvent[sProperty];
		}
		return oNativeEvent[sProperty];
	}

	function getOwnerDocument(el){
		if(el && el.nodeType === 9){
			return el;
		}
		return (el && el.ownerDocument) || document;
	}

	function HuskyEvent(oEvent){
		if(oEvent instanceof HuskyEvent){
			return oEvent;
		}
		if(!(this instanceof HuskyEvent)){
			return new HuskyEvent(oEvent);
		}
		if(!oEvent){
			throw new TypeError("A browser event is required.");
		}

		var oNativeEvent = oEvent.originalEvent || oEvent;
		var elTarget = oEvent.target || oNativeEvent.target || oNativeEvent.srcElement;
		if(elTarget && elTarget.nodeType === 3){
			elTarget = elTarget.parentNode;
		}

		this._event = oNativeEvent;
		this.originalEvent = oNativeEvent;
		this._sourceEvent = oEvent;
		this.type = String(oEvent.type || oNativeEvent.type || "").toLowerCase();
		this.canceled = false;
		this.element = elTarget;
		this.currentElement = oEvent.currentTarget || oNativeEvent.currentTarget || null;
		this.relatedElement = oEvent.relatedTarget || oNativeEvent.relatedTarget ||
			(this.type === "mouseout" ? oNativeEvent.toElement : oNativeEvent.fromElement) || null;
	}

	HuskyEvent.prototype.key = function(){
		var oEvent = this._sourceEvent;
		var oNativeEvent = this.originalEvent;
		var nKeyCode = getEventProperty(oEvent, oNativeEvent, "keyCode") ||
			getEventProperty(oEvent, oNativeEvent, "charCode") || 0;

		return {
			keyCode : nKeyCode,
			alt : !!getEventProperty(oEvent, oNativeEvent, "altKey"),
			ctrl : !!getEventProperty(oEvent, oNativeEvent, "ctrlKey"),
			meta : !!getEventProperty(oEvent, oNativeEvent, "metaKey"),
			shift : !!getEventProperty(oEvent, oNativeEvent, "shiftKey"),
			up : nKeyCode === 38,
			down : nKeyCode === 40,
			left : nKeyCode === 37,
			right : nKeyCode === 39,
			enter : nKeyCode === 13,
			esc : nKeyCode === 27
		};
	};

	HuskyEvent.prototype.mouse = function(){
		var oEvent = this._sourceEvent;
		var oNativeEvent = this.originalEvent;
		var nWhich = getEventProperty(oEvent, oNativeEvent, "which");
		var nButtons = getEventProperty(oEvent, oNativeEvent, "buttons");
		var nButton = getEventProperty(oEvent, oNativeEvent, "button");
		var nWheelDelta = getEventProperty(oEvent, oNativeEvent, "wheelDelta");
		var nDetail = getEventProperty(oEvent, oNativeEvent, "detail");
		var nDeltaY = getEventProperty(oEvent, oNativeEvent, "deltaY");
		var bButtonEvent = /^(?:mousedown|mouseup|click|dblclick|contextmenu)$/.test(this.type);
		var htMouse = {
			delta : 0,
			left : false,
			middle : false,
			right : false
		};

		if(nWhich){
			htMouse.left = nWhich === 1;
			htMouse.middle = nWhich === 2;
			htMouse.right = nWhich === 3;
		}else if(typeof nButtons === "number" && nButtons !== 0){
			htMouse.left = !!(nButtons & 1);
			htMouse.middle = !!(nButtons & 4);
			htMouse.right = !!(nButtons & 2);
		}else if(bButtonEvent && typeof nButton === "number"){
			htMouse.left = nButton === 0;
			htMouse.middle = nButton === 1;
			htMouse.right = nButton === 2;
		}

		if(nWheelDelta){
			htMouse.delta = nWheelDelta / 120;
		}else if(nDetail){
			htMouse.delta = -nDetail / 3;
		}else if(nDeltaY){
			htMouse.delta = -nDeltaY / 100;
		}

		return htMouse;
	};

	HuskyEvent.prototype.pos = function(bIncludeOffset){
		var oEvent = this._sourceEvent;
		var oNativeEvent = this.originalEvent;
		var elTarget = this.element;
		var oDocument = getOwnerDocument(elTarget);
		var elBody = oDocument.body || {};
		var elDocument = oDocument.documentElement || {};
		var oWindow = oDocument.defaultView || window;
		var nClientX = getEventProperty(oEvent, oNativeEvent, "clientX");
		var nClientY = getEventProperty(oEvent, oNativeEvent, "clientY");
		var nPageX = getEventProperty(oEvent, oNativeEvent, "pageX");
		var nPageY = getEventProperty(oEvent, oNativeEvent, "pageY");
		var nScrollLeft = oWindow.pageXOffset || elBody.scrollLeft || elDocument.scrollLeft || 0;
		var nScrollTop = oWindow.pageYOffset || elBody.scrollTop || elDocument.scrollTop || 0;
		var nOffsetX = getEventProperty(oEvent, oNativeEvent, "offsetX");
		var nOffsetY = getEventProperty(oEvent, oNativeEvent, "offsetY");
		var nLayerX = getEventProperty(oEvent, oNativeEvent, "layerX");
		var nLayerY = getEventProperty(oEvent, oNativeEvent, "layerY");
		var htPosition;

		if(typeof nPageX !== "number"){
			nPageX = nClientX + nScrollLeft - (elDocument.clientLeft || elBody.clientLeft || 0);
		}
		if(typeof nPageY !== "number"){
			nPageY = nClientY + nScrollTop - (elDocument.clientTop || elBody.clientTop || 0);
		}

		htPosition = {
			clientX : nClientX,
			clientY : nClientY,
			pageX : nPageX,
			pageY : nPageY,
			layerX : typeof nOffsetX === "number" ? nOffsetX : nLayerX,
			layerY : typeof nOffsetY === "number" ? nOffsetY : nLayerY
		};

		if(bIncludeOffset){
			if(elTarget && typeof elTarget.getBoundingClientRect === "function"){
				var htRect = elTarget.getBoundingClientRect();
				htPosition.offsetX = nPageX - (htRect.left + nScrollLeft);
				htPosition.offsetY = nPageY - (htRect.top + nScrollTop);
			}else{
				htPosition.offsetX = nOffsetX;
				htPosition.offsetY = nOffsetY;
			}
		}

		return htPosition;
	};

	HuskyEvent.prototype.stop = function(nCancel){
		nCancel = nCancel || HuskyEvent.CANCEL_ALL;
		var bCancelBubble = !!(nCancel & HuskyEvent.CANCEL_BUBBLE);
		var bCancelDefault = !!(nCancel & HuskyEvent.CANCEL_DEFAULT);
		var oEvent = this._sourceEvent;
		var oNativeEvent = this.originalEvent;

		this.canceled = true;
		if(bCancelDefault){
			if(typeof oEvent.preventDefault === "function"){
				oEvent.preventDefault();
			}else if(typeof oNativeEvent.preventDefault === "function"){
				oNativeEvent.preventDefault();
			}
			oNativeEvent.returnValue = false;
		}
		if(bCancelBubble){
			if(typeof oEvent.stopPropagation === "function"){
				oEvent.stopPropagation();
			}else if(typeof oNativeEvent.stopPropagation === "function"){
				oNativeEvent.stopPropagation();
			}
			oNativeEvent.cancelBubble = true;
		}
		return this;
	};

	HuskyEvent.prototype.stopDefault = function(){
		return this.stop(HuskyEvent.CANCEL_DEFAULT);
	};

	HuskyEvent.prototype.stopBubble = function(){
		return this.stop(HuskyEvent.CANCEL_BUBBLE);
	};

	HuskyEvent.prototype.$value = function(){
		return this.originalEvent;
	};

	HuskyEvent.createHandler = function(fHandler, oContext, aLeadingArguments){
		aLeadingArguments = aLeadingArguments || [];
		return function(oEvent){
			return fHandler.apply(oContext, aLeadingArguments.concat(new HuskyEvent(oEvent)));
		};
	};

	HuskyEvent.CANCEL_BUBBLE = 1;
	HuskyEvent.CANCEL_DEFAULT = 2;
	HuskyEvent.CANCEL_ALL = 3;

	nhn.husky.HuskyEvent = HuskyEvent;
})();
