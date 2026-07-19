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

	function getWindow(oDocument){
		var oDoc = getDocument(oDocument);
		return oDoc.defaultView || oDoc.parentWindow || window;
	}

	nhn.husky.DOMMetrics = {
		scrollPosition : function(oDocument){
			var oDoc = getDocument(oDocument),
				oWindow = getWindow(oDoc),
				oBody = oDoc.body || {},
				oDocumentElement = oDoc.documentElement || {};

			return {
				left : oBody.scrollLeft || oDocumentElement.scrollLeft || oWindow.pageXOffset || oWindow.scrollX || 0,
				top : oBody.scrollTop || oDocumentElement.scrollTop || oWindow.pageYOffset || oWindow.scrollY || 0
			};
		},

		clientSize : function(oDocument){
			var oDoc = getDocument(oDocument),
				oWindow = getWindow(oDoc),
				oBody = oDoc.body || {},
				oDocumentElement = oDoc.documentElement || {};

			return {
				width : oDocumentElement.clientWidth || oBody.clientWidth || oWindow.innerWidth || 0,
				height : oDocumentElement.clientHeight || oBody.clientHeight || oWindow.innerHeight || 0
			};
		}
	};
})();
