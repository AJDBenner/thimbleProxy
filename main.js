define(function (require, exports, module) {
	"use strict";

 	var AppInit = brackets.getModule("utils/AppInit");
	var EditorManager = brackets.getModule("editor/EditorManager");

	var fs = brackets.getModule("filesystem/FileSystem")._impl;
	var parentWindow = window.frameElement.ownerDocument;
	var sourceCode;
	var codeMirror;

	AppInit.appReady(function() {
		// Once the app has loaded our file,
		// and we can be confident the editor is open,
		// get a reference to it and attach our "onchange"
		// listener to codemirror
		codeMirror = EditorManager.getActiveEditor()._codeMirror;

		codeMirror.on("change", function(e){
			parentWindow.postMessage({
				type: "bramble:change",
				sourceCode: codeMirror.getValue()
			}, "*");
		});
	});

	// Eventually, we'll listen for a message from
	// thimble containing the make's initial code.
	// For now, we are defaulting to thimble's starter
	// make.
	expors.initExtension = function() {
		var deferred = new $.Deferred();
		var initialSource = "htmlgoeshere";

		// Filesystem write goes here
		fs.writeFile('/index.html', initialSource, function(err) {
			if (err) {
				deferred.reject();
				return;
			}

			deferred.resolve();
		});

		return deferred.promise();
	}
});