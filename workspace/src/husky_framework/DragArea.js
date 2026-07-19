import "./Component";

/*
Copyright (C) NAVER corp.

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public
License as published by the Free Software Foundation; either
version 2.1 of the License, or (at your option) any later version.
*/
if(typeof window.nhn === "undefined") { window.nhn = {}; }
if(!nhn.husky) { nhn.husky = {}; }

/**
 * Small jQuery based drag controller used by the quick editor.
 *
 * The old Jindo component exposed a much larger API.  SmartEditor2 only
 * needs the event contract implemented here, so this class deliberately
 * keeps the surface small and uses document-level mouse listeners while a
 * drag is in progress.
 */
nhn.husky.DragArea = nhn.husky.createClass({
	$init : function(elArea, htOption){
		this._elArea = elArea;
		this._htOption = {
			sClassName : "draggable",
			bFlowOut : true,
			nThreshold : 0
		};
		this.option(htOption || {});
		this._htDragInfo = {
			bPrepared : false,
			bIsDragging : false,
			elHandle : null,
			elDrag : null,
			nPageX : 0,
			nPageY : 0,
			nX : 0,
			nY : 0
		};
		this._onMouseDown = this._onMouseDown.bind(this);
		this._onMouseMove = this._onMouseMove.bind(this);
		this._onMouseUp = this._onMouseUp.bind(this);
		this._onDragStart = this._onDragStart.bind(this);
		this._onSelectStart = this._onSelectStart.bind(this);
		this.activate();
	},

	_findDraggableElement : function(elTarget){
		var jq = window.jQuery,
			el = elTarget && elTarget.nodeType === 1 ? elTarget : elTarget && elTarget.parentNode,
			selector = "." + this.option("sClassName");

		if(!el || !jq || jq(el).is("input[type=text], textarea, select")){
			return null;
		}
		var elDrag = jq(el).closest(selector, this._elArea)[0];
		if(!elDrag || (this._elArea !== document && !this._elArea.contains(elDrag))){
			return null;
		}
		return elDrag;
	},

	_onMouseDown : function(oEvent){
		if(oEvent.which !== 1){
			return;
		}
		var elDrag = this._findDraggableElement(oEvent.target);
		if(!elDrag){
			return;
		}
		var oInfo = this._htDragInfo;
		oInfo.bPrepared = true;
		oInfo.bIsDragging = false;
		oInfo.elHandle = elDrag;
		oInfo.elDrag = elDrag;
		oInfo.nPageX = oEvent.pageX;
		oInfo.nPageY = oEvent.pageY;
		if(!this.fireEvent("handleDown", {
			elArea : this._elArea,
			elHandle : elDrag,
			elDrag : elDrag,
			weEvent : oEvent
		})){
			this._clearDragInfo();
			return;
		}
		this._bindDocumentEvents();
		oEvent.preventDefault();
	},

	_onMouseMove : function(oEvent){
		var oInfo = this._htDragInfo;
		if(!oInfo.bPrepared){
			return;
		}
		var nPageX = oEvent.pageX,
			nPageY = oEvent.pageY,
			nGapX = nPageX - oInfo.nPageX,
			nGapY = nPageY - oInfo.nPageY;

		if(!oInfo.bIsDragging){
			var nThreshold = Number(this.option("nThreshold")) || 0;
			if(nThreshold && Math.sqrt(nGapX * nGapX + nGapY * nGapY) < nThreshold){
				return;
			}
			var oStartEvent = {
				elArea : this._elArea,
				elHandle : oInfo.elHandle,
				elDrag : oInfo.elDrag,
				htDiff : {nPageX : nGapX, nPageY : nGapY},
				weEvent : oEvent
			};
			oInfo.bIsDragging = true;
			oInfo.bPrepared = false;
			if(!this.fireEvent("dragStart", oStartEvent)){
				oInfo.bPrepared = true;
				oInfo.bIsDragging = false;
				return;
			}
			oInfo.elHandle = oStartEvent.elHandle || oInfo.elHandle;
			oInfo.elDrag = oStartEvent.elDrag || oInfo.elDrag;
			oInfo.nX = parseInt(window.jQuery(oInfo.elDrag).css("left"), 10) || 0;
			oInfo.nY = parseInt(window.jQuery(oInfo.elDrag).css("top"), 10) || 0;
		}

		var oBeforeEvent = {
			elArea : this._elArea,
			elFlowOut : oInfo.elDrag.parentNode,
			elHandle : oInfo.elHandle,
			elDrag : oInfo.elDrag,
			weEvent : oEvent,
			nX : oInfo.nX + nGapX,
			nY : oInfo.nY + nGapY,
			nGapX : nGapX,
			nGapY : nGapY
		};
		if(this.fireEvent("beforeDrag", oBeforeEvent)){
			this._constrain(oBeforeEvent);
			if(oBeforeEvent.nX !== null){
				oInfo.elDrag.style.left = oBeforeEvent.nX + "px";
			}
			if(oBeforeEvent.nY !== null){
				oInfo.elDrag.style.top = oBeforeEvent.nY + "px";
			}
		}
		oEvent.preventDefault();
	},

	_constrain : function(oEvent){
		if(this.option("bFlowOut") !== false){
			return;
		}
		var elFlowOut = oEvent.elFlowOut,
			elDrag = oEvent.elDrag,
			nWidth,
			nHeight,
			nScrollLeft = 0,
			nScrollTop = 0;
		if(elFlowOut && elFlowOut !== document.body && elFlowOut.clientWidth && elFlowOut.clientHeight){
			nWidth = elFlowOut.clientWidth;
			nHeight = elFlowOut.clientHeight;
			nScrollLeft = elFlowOut.scrollLeft;
			nScrollTop = elFlowOut.scrollTop;
		}else{
			nWidth = window.innerWidth || document.documentElement.clientWidth;
			nHeight = window.innerHeight || document.documentElement.clientHeight;
		}
		oEvent.nX = Math.max(oEvent.nX, nScrollLeft);
		oEvent.nY = Math.max(oEvent.nY, nScrollTop);
		oEvent.nX = Math.min(oEvent.nX, nWidth - elDrag.offsetWidth + nScrollLeft);
		oEvent.nY = Math.min(oEvent.nY, nHeight - elDrag.offsetHeight + nScrollTop);
	},

	_onMouseUp : function(oEvent){
		if(this._htDragInfo.bIsDragging){
			var oInfo = this._htDragInfo,
				oDrag = window.jQuery(oInfo.elDrag);
			this.fireEvent("dragEnd", {
				elArea : this._elArea,
				elHandle : oInfo.elHandle,
				elDrag : oInfo.elDrag,
				nX : parseInt(oDrag.css("left"), 10) || 0,
				nY : parseInt(oDrag.css("top"), 10) || 0,
				bInterupted : false,
				weEvent : oEvent
			});
		}
		this._unbindDocumentEvents();
		this._clearDragInfo();
	},

	_onDragStart : function(oEvent){
		oEvent.preventDefault();
	},

	_onSelectStart : function(oEvent){
		if(this._htDragInfo.bPrepared || this._htDragInfo.bIsDragging){
			oEvent.preventDefault();
		}
	},

	_bindDocumentEvents : function(){
		window.jQuery(document).on("mousemove.se2mDragArea", this._onMouseMove);
		window.jQuery(document).on("mouseup.se2mDragArea", this._onMouseUp);
	},

	_unbindDocumentEvents : function(){
		window.jQuery(document).off("mousemove.se2mDragArea", this._onMouseMove);
		window.jQuery(document).off("mouseup.se2mDragArea", this._onMouseUp);
	},

	_clearDragInfo : function(){
		this._htDragInfo.bPrepared = false;
		this._htDragInfo.bIsDragging = false;
		this._htDragInfo.elHandle = null;
		this._htDragInfo.elDrag = null;
	},

	_activate : function(){
		window.jQuery(this._elArea).on("mousedown.se2mDragArea", this._onMouseDown);
		window.jQuery(this._elArea).on("dragstart.se2mDragArea", this._onDragStart);
		window.jQuery(this._elArea).on("selectstart.se2mDragArea", this._onSelectStart);
	},

	_deactivate : function(){
		this._unbindDocumentEvents();
		window.jQuery(this._elArea).off("mousedown.se2mDragArea", this._onMouseDown);
		window.jQuery(this._elArea).off("dragstart.se2mDragArea", this._onDragStart);
		window.jQuery(this._elArea).off("selectstart.se2mDragArea", this._onSelectStart);
		this._clearDragInfo();
	},

	activate : function(){
		if(this._bActive){
			return this;
		}
		this._bActive = true;
		this._activate();
		return this;
	},

	deactivate : function(){
		if(!this._bActive){
			return this;
		}
		this._bActive = false;
		this._deactivate();
		return this;
	},

	isDragging : function(){
		return this._htDragInfo.bIsDragging;
	},

	stopDragging : function(){
		if(this._htDragInfo.bIsDragging){
			this._onMouseUp({});
		}else{
			this._unbindDocumentEvents();
			this._clearDragInfo();
		}
		return this;
	}
}).extend(nhn.husky.Component);
