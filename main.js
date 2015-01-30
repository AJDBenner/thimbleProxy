define(function (require, exports, module) {
	"use strict";

	//load dependencies
	var CommandManager = brackets.getModule("command/CommandManager"),
		Menus          = brackets.getModule("command/Menus"),
		EditorManager  = brackets.getModule("editor/EditorManager");
	
	var editor  = EditorManager.getActiveEditor();
		parent  = window.frameElement.ownerDocument,
		srcCode = editor.document.getValue();

	var onChange = function(){
		var obj = {
			type: "bramble:change",
			sourceCode: srcCode
		};
		
		return obj;
	};

	$(EditorManager).on("activeEditorChange", onChange);

	//parent.postMessage();

	// First, register a command - a UI-less object associating an id to a handler
	var MY_COMMAND_ID = "thimbleProxy"; // package-style naming to avoid collisions
	CommandManager.register("Thimble Proxy", MY_COMMAND_ID, onChange);
	
	// Then create a menu item bound to the command
	// The label of the menu item is the name we gave the command (see above)
	var menu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
	menu.addMenuItem(MY_COMMAND_ID, "Ctrl-Alt-H");
});