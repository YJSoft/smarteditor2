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
	function getDocument(oDocument){
		return oDocument || document;
	}

	nhn.husky.DOM = {
		getElement : function(oElement, oDocument){
			if(typeof oElement !== "string"){
				return oElement || null;
			}

			var oDoc = getDocument(oDocument),
				sValue = oElement.trim();
			if(!sValue){
				return null;
			}

			if(sValue.charAt(0) === "<"){
				return window.jQuery(sValue, oDoc).get(0) || null;
			}

			return oDoc.getElementById(sValue);
		},

		queryAll : function(sSelector, oContext){
			var sQuery = sSelector.trim(),
				$Context = window.jQuery(oContext || document);

			if(sQuery.charAt(0) === ">"){
				return sQuery.substring(1).split(">").reduce(function($Current, sPart){
					return $Current.children(sPart.trim());
				}, $Context).get();
			}

			return window.jQuery(sQuery, oContext || document).get();
		},

		querySingle : function(sSelector, oContext){
			return this.queryAll(sSelector, oContext)[0] || null;
		}
	};
})();
