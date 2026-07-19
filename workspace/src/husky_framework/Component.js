import "./HuskyClass";

/*
Copyright (C) NAVER corp.

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public
License as published by the Free Software Foundation; either
version 2.1 of the License, or (at your option) any later version.
*/
if(typeof window.nhn === "undefined") { window.nhn = {}; }
if(!nhn.husky) { nhn.husky = {}; }

nhn.husky.Component = nhn.husky.createClass({
	$init : function(){
		this._htEventHandler = {};
		this._htOption = {};
	},

	option : function(vName, vValue){
		if(typeof vName === "undefined"){
			return this._htOption;
		}
		if(typeof vName === "string"){
			if(typeof vValue === "undefined"){
				return this._htOption[vName];
			}
			this._htOption[vName] = vValue;
			return this;
		}
		if(vName && typeof vName === "object"){
			Object.keys(vName).forEach(function(sKey){
				this._htOption[sKey] = vName[sKey];
			}, this);
		}
		return this;
	},

	fireEvent : function(sType, htEvent){
		var oEvent = htEvent || {},
			aHandlers = (this._htEventHandler[sType] || []).slice(),
			fMethod = this["on" + sType];

		oEvent.sType = sType;
		oEvent._aExtend = oEvent._aExtend || [];
		oEvent._aExtend.push({bCanceled:false});
		if(typeof oEvent.stop !== "function"){
			oEvent.stop = function(){
				oEvent._aExtend[oEvent._aExtend.length - 1].bCanceled = true;
			};
		}

		if(typeof fMethod === "function"){
			fMethod.call(this, oEvent);
		}
		aHandlers.forEach(function(fHandler){
			fHandler.call(this, oEvent);
		}, this);

		return !oEvent._aExtend.pop().bCanceled;
	},

	attach : function(vType, fHandler){
		if(vType && typeof vType === "object"){
			Object.keys(vType).forEach(function(sType){
				this.attach(sType, vType[sType]);
			}, this);
			return this;
		}
		if(typeof fHandler !== "function"){
			return this;
		}
		if(!this._htEventHandler[vType]){
			this._htEventHandler[vType] = [];
		}
		this._htEventHandler[vType].push(fHandler);
		return this;
	},

	detach : function(vType, fHandler){
		if(vType && typeof vType === "object"){
			Object.keys(vType).forEach(function(sType){
				this.detach(sType, vType[sType]);
			}, this);
			return this;
		}
		var aHandlers = this._htEventHandler[vType] || [];
		this._htEventHandler[vType] = fHandler ? aHandlers.filter(function(fRegistered){
			return fRegistered !== fHandler;
		}) : [];
		return this;
	},

	detachAll : function(sType){
		if(typeof sType === "string"){
			delete this._htEventHandler[sType];
		}else{
			this._htEventHandler = {};
		}
		return this;
	}
});
