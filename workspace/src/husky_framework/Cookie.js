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

	function decode(value){
		try{
			return decodeURIComponent(value);
		}catch(e){
			return value;
		}
	}

	nhn.husky.Cookie = {
		get : function(sName, oDocument){
			var oDoc = getDocument(oDocument),
				aCookies = oDoc.cookie ? oDoc.cookie.split(/\s*;\s*/) : [],
				sExpectedName = encodeURIComponent(sName),
				sCookie,
				nSeparator,
				sNamePart;

			for(var i = 0; i < aCookies.length; i++){
				sCookie = aCookies[i];
				nSeparator = sCookie.indexOf("=");
				if(nSeparator < 0){
					continue;
				}
				sNamePart = sCookie.substring(0, nSeparator);
				if(sNamePart === sExpectedName || decode(sNamePart) === String(sName)){
					return decode(sCookie.substring(nSeparator + 1));
				}
			}

			return null;
		},

		set : function(sName, sValue, nDays, sDomain, sPath, oDocument){
			var oDoc = getDocument(oDocument),
				sCookie = encodeURIComponent(sName) + "=" + encodeURIComponent(sValue),
				sExpires = "";

			if(typeof nDays === "number"){
				sExpires = "; expires=" + new Date(Date.now() + nDays * 24 * 60 * 60 * 1000).toUTCString();
			}

			oDoc.cookie = sCookie + sExpires + "; path=" + (typeof sPath === "undefined" ? "/" : sPath) +
				(sDomain ? "; domain=" + sDomain : "");
		},

		remove : function(sName, sDomain, sPath, oDocument){
			this.set(sName, "", -1, sDomain, sPath, oDocument);
		}
	};
})();
