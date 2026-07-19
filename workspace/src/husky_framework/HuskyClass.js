import "./BrowserCapabilities";

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
	function copyOwnProperties(oTarget, oSource, sExcludedProperty){
		for(var sProperty in oSource){
			if(sProperty !== sExcludedProperty && Object.prototype.hasOwnProperty.call(oSource, sProperty)){
				oTarget[sProperty] = oSource[sProperty];
			}
		}
	}

	nhn.husky.createClass = function(htDefinition){
		htDefinition = htDefinition || {};
		var fInitializer = Object.prototype.hasOwnProperty.call(htDefinition, "$init") ? htDefinition.$init : null;

		var HuskyClass = function(){
			if(!(this instanceof HuskyClass)){
				var oInstance = Object.create(HuskyClass.prototype);
				HuskyClass.apply(oInstance, arguments);
				return oInstance;
			}

			if(HuskyClass.superClass){
				HuskyClass.superClass.apply(this, arguments);
			}
			if(typeof fInitializer === "function"){
				fInitializer.apply(this, arguments);
			}
		};

		copyOwnProperties(HuskyClass.prototype, htDefinition, "$static");
		HuskyClass.prototype.constructor = HuskyClass;
		if(htDefinition.$static){
			copyOwnProperties(HuskyClass, htDefinition.$static);
		}

		HuskyClass.extend = function(SuperClass){
			if(typeof SuperClass !== "function"){
				throw new TypeError("The super class must be a constructor.");
			}

			var htOwnPrototype = HuskyClass.prototype;
			HuskyClass.prototype = Object.create(SuperClass.prototype);
			copyOwnProperties(HuskyClass.prototype, htOwnPrototype, "constructor");
			HuskyClass.prototype.constructor = HuskyClass;
			HuskyClass.superClass = SuperClass;
			for(var sProperty in SuperClass){
				if(
					sProperty !== "prototype" &&
					sProperty !== "extend" &&
					sProperty !== "superClass" &&
					Object.prototype.hasOwnProperty.call(SuperClass, sProperty)
				){
					HuskyClass[sProperty] = SuperClass[sProperty];
				}
			}
			return HuskyClass;
		};

		return HuskyClass;
	};
})();
