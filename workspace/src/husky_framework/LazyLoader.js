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

(function(){
	var htRequests = {};

	function complete(sUrl, bSuccess, oError){
		var htRequest = htRequests[sUrl];
		if(!htRequest){
			return;
		}
		htRequest.status = bSuccess ? "completed" : "failed";
		var aCallbacks = htRequest.callbacks.slice();
		var aErrorCallbacks = htRequest.errorCallbacks.slice();
		if(bSuccess){
			aCallbacks.forEach(function(fCallback){fCallback();});
		}else{
			aErrorCallbacks.forEach(function(fCallback){fCallback(oError);});
		}
		htRequest.callbacks.length = 0;
		htRequest.errorCallbacks.length = 0;
	}

	nhn.husky.LazyScriptLoader = {
		load : function(sUrl, fCallback, sCharset, fErrorCallback){
			fCallback = typeof fCallback === "function" ? fCallback : function(){};
			var htRequest = htRequests[sUrl];
			if(htRequest){
				if(htRequest.status === "completed"){
					setTimeout(fCallback, 0);
				}else if(htRequest.status === "loading"){
					htRequest.callbacks.push(fCallback);
					htRequest.errorCallbacks.push(fErrorCallback || function(){});
				}else if(fErrorCallback){
					fErrorCallback(htRequest.error);
				}
				return;
			}

			htRequest = htRequests[sUrl] = {
				status : "loading",
				callbacks : [fCallback],
				errorCallbacks : [fErrorCallback || function(){}],
				error : null
			};

			window.jQuery.ajax({
				url : sUrl,
				dataType : "script",
				cache : true,
				beforeSend : function(xhr){
					if(sCharset && xhr.overrideMimeType){
						xhr.overrideMimeType("text/javascript; charset=" + sCharset);
					}
				}
			}).done(function(){
				complete(sUrl, true);
			}).fail(function(jqXHR, sTextStatus, sErrorThrown){
				htRequest.error = sErrorThrown || sTextStatus;
				complete(sUrl, false, htRequest.error);
			});
		}
	};
})();
