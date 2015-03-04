/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, brackets, appshell*/
define(function (require, exports, module) {
	"use strict";

	var AppInit = brackets.getModule("utils/AppInit");
	var EditorManager = brackets.getModule("editor/EditorManager");
	var PreferencesManager = brackets.getModule("preferences/PreferencesManager");
	var UrlParams = brackets.getModule("utils/UrlParams").UrlParams;
	var ViewCommand = brackets.getModule("view/ViewCommandHandlers");
    var Commands        = brackets.getModule("command/Commands");
    var CommandManager  = brackets.getModule("command/CommandManager");

	var fs = appshell.Filer.fs();
	var parentWindow = window.parent;
	var codeMirror;
	var params = new UrlParams();

	var defaultHTML = require("text!default.html");

	// Force entry to if statments on line 262 of brackets.js to create
	// a new project
	PreferencesManager.setViewState("afterFirstLaunch", false);
	params.remove("skipSampleProjectLoad");

	function _listener(event) {
		if(event.data === "_undo") {
			CommandManager.execute(Commands.EDIT_UNDO);
		}
		else if(event.data === "_redo") {
			CommandManager.execute(Commands.EDIT_REDO);
		}
		else if(event.data === "_small") {
			ViewCommand.setFontSize("8");
		}
		else if(event.data === "_normal") {
			CommandManager.execute(Commands.VIEW_RESTORE_FONT_SIZE);
		}
		else if(event.data === "_large") {
			ViewCommand.setFontSize("18");
		}
    }

	AppInit.appReady(function() {
		// Once the app has loaded our file,
		// and we can be confident the editor is open,
		// get a reference to it and attach our "onchange"
		// listener to codemirror
		codeMirror = EditorManager.getActiveEditor()._codeMirror;

		parentWindow.postMessage(JSON.stringify({
			type: "bramble:change",
			sourceCode: codeMirror.getValue()
		}), "*");

		codeMirror.on("change", function(e){
			parentWindow.postMessage(JSON.stringify({
				type: "bramble:change",
				sourceCode: codeMirror.getValue()
			}), "*");
		});

		window.addEventListener("message", _listener);
	});

	// Eventually, we'll listen for a message from
	// thimble containing the make's initial code.
	// For now, we are defaulting to thimble's starter
	// make.
	exports.initExtension = function() {
		var deferred = new $.Deferred();
		var data;

		function _getInitialDocument(e) {
			try {
				data = e.data || null;
				data = JSON.parse(data);
				data = data || {};
			} catch(err) {
				// Quick fix: Ignore the 'process-tick' message being sent
				if(e.data === 'process-tick') {
					return;
				}

				console.error("Parsing message from thimble failed: ", err);

				deferred.reject();
				return;
			}

			// Remove the listener after we confirm the event is the
			// one we're waiting for
			if (data.type !== "bramble:init") {
				return;
			}
			window.removeEventListener("message", _getInitialDocument);

			fs.writeFile(
				'/index.html',
				data.source ? data.source : defaultHTML,
				function(err) {
					if (err) {
						deferred.reject();
						return;
					}

					deferred.resolve();
				}
			);
		}
		window.addEventListener("message", _getInitialDocument);

		// Signal to thimble that we're waiting for the
		// initial make source code
		window.parent.postMessage(JSON.stringify({
			type: "bramble:init"
		}), "*");

		return deferred.promise();
	};
});
