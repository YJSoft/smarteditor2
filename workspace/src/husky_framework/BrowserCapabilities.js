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
	var ua = (window.navigator && window.navigator.userAgent) || "";
	var platform = (window.navigator && window.navigator.platform) || "";

	function getVersion(pattern){
		var match = ua.match(pattern);
		return match ? parseFloat(match[1]) : 0;
	}

	var isEdge = /(?:Edg|Edge|EdgiOS|EdgA)\//.test(ua);
	var isChrome = /(?:Chrome|CriOS)\//.test(ua) && !isEdge;
	var isSafari = /Safari\//.test(ua) && !isChrome && !isEdge;
	var isFirefox = /(?:Firefox|FxiOS)\//.test(ua);
	var isOpera = /(?:Opera|OPR)\//.test(ua);
	var isIE = /(?:MSIE\s|Trident\/)/.test(ua);
	var browserVersion =
		getVersion(/(?:Edg|Edge|EdgiOS|EdgA)\/([\d.]+)/) ||
		getVersion(/(?:Chrome|CriOS)\/([\d.]+)/) ||
		getVersion(/(?:Firefox|FxiOS)\/([\d.]+)/) ||
		getVersion(/(?:Version)\/([\d.]+).*Safari\//) ||
		getVersion(/(?:Opera Mini)\/([\d.]+)/) ||
		getVersion(/(?:Opera|OPR)\/([\d.]+)/) ||
		getVersion(/MSIE\s([\d.]+)/) ||
		getVersion(/rv:([\d.]+).*Trident\//);

	var browser = {
		chrome : isChrome,
		edge : isEdge,
		firefox : isFirefox,
		ie : isIE,
		nativeVersion : browserVersion,
		opera : isOpera,
		safari : isSafari,
		version : browserVersion,
		webkit : /AppleWebKit\//.test(ua),
		mobile : /Mobile|Android|iPhone|iPad|iPod|IEMobile|Windows Phone/.test(ua),
		msafari : /Mobile(?:\/|\s).*Safari\//.test(ua)
	};

	var isIOS = /iPad|iPhone|iPod/.test(ua) || (platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
	var osVersionMatch = ua.match(/(?:OS|Android)[\s/]([\d._]+)/);
	var os = {
		android : /Android/.test(ua),
		ios : isIOS,
		linux : /Linux/.test(platform) && !/Android/.test(ua),
		mac : /Macintosh|Mac OS X/.test(ua) || /^Mac/.test(platform),
		win : /Windows/.test(ua),
		winxp : /Windows NT 5\.1|Windows XP/.test(ua),
		version : osVersionMatch ? String(osVersionMatch[1]).replace(/_/g, ".") : ""
	};

	nhn.husky.Browser = {
		navigator : function(){
			return browser;
		},
		os : function(){
			return os;
		}
	};
})();
