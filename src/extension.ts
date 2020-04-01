// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

/**
 * Support functions
 */
function nextChar(c: string) {
  var isLowerCase = false;
  if (c == c.toLowerCase()) {
    isLowerCase = true;
  }
  var u = c.toUpperCase();
  if (same(u, "Z")) {
    var txt = "";
    var i = u.length;
    while (i--) {
      txt += "A";
    }
    return convertCase(txt + "A", isLowerCase);
  } else {
    var p = "";
    var q = "";
    if (u.length > 1) {
      p = u.substring(0, u.length - 1);
      q = String.fromCharCode(p.slice(-1).charCodeAt(0));
    }
    var l = u.slice(-1).charCodeAt(0);
    var z = nextLetter(l);
    if (z === "A") {
      return convertCase(
        p.slice(0, -1) + nextLetter(q.slice(-1).charCodeAt(0)) + z,
        isLowerCase
      );
    } else {
      return convertCase(p + z, isLowerCase);
    }
  }
}

function nextLetter(l: number) {
  if (l < 90) {
    return String.fromCharCode(l + 1);
  } else {
    return "A";
  }
}

function same(str: string | any[], char: string) {
  var i = str.length;
  while (i--) {
    if (str[i] !== char) {
      return false;
    }
  }
  return true;
}

function convertCase(c: string, isLowerCase: boolean) {
  if (isLowerCase) {
    c = c.toLowerCase();
  }
  return c;
}

function getPaddingLength(st: string | any[]) {
  var counter = 0;
  for (var i = 0, b = st.length; i < b; i++) {
    if (st[i] !== "0") {
      break;
    }
    counter++;
  }

  if (counter == st.length) {
    counter--;
  }

  if (counter > 0) {
    return st.length;
  } else {
    return 0;
  }
}

Number.prototype.pad = function(paddingLength: number) {
  var sign = Math.sign(this) === -1 ? "-" : "";
  var s = String(Math.abs(this));
  while (s.length < paddingLength) {
    s = "0" + s;
  }
  return sign + s;
};

function doSelection(action: string) {
  const config = vscode.workspace.getConfiguration("increment-selection");

  var editor = vscode.window.activeTextEditor;
  if (!editor) {
    return; // No open text editor
  }

  var selections = editor.selections;
  if (config.topToBottom) {
    selections.sort((a: { start: { compareTo: (arg0: any) => any; }; }, b: { start: any; }) => a.start.compareTo(b.start));
  }
  var firstSelection = editor.document.getText(selections[0]);

  // If it is a number or nothing has been selected
  if (!isNaN(parseInt(firstSelection)) || firstSelection.length == 0) {
    //default behaviour if no selection are made
    if (firstSelection.length == 0) {
      firstSelection = "0";
    }

    var paddingLength = getPaddingLength(firstSelection);

    firstSelection = parseInt(firstSelection);

    editor.edit(function(edit: string) {
      selections.forEach(function(selection: any) {
        edit.replace(
          selection,
          String(
            action === "increment"
              ? (firstSelection++).pad(paddingLength)
              : (firstSelection--).pad(paddingLength)
          )
        );
      });
    });
  } else {
    // if it is a char
    editor.edit(function(edit: string) {
      selections.forEach(function(selection: any) {
        edit.replace(selection, String(firstSelection));
        firstSelection = nextChar(firstSelection);
      });
    });
  }
}

function reverse() {
  var editor = vscode.window.activeTextEditor;
  if (!editor) {
    return; // No open text editor
  }

  var content: any[] = [];
  var selections = editor.selections;
  selections.forEach(function(selection: any) {
    content.push(editor.document.getText(selection));
  });

  editor.selections.reverse();
  selections = editor.selections;

  const zip = (arr1: any[], arr2: any[]) => arr1.map((k: any, i: string | number) => [k, arr2[i]]);

  var pairs = zip(selections, content);

  editor.edit(function(edit: string) {
    pairs.forEach(function(pair: any[]) {
      edit.replace(pair[0], pair[1]);
    });
  });
}

//---------------------------------------------------------------------------------------------

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "increment" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "extension.helloWorld",
    () => {
      // The code you place here will be executed every time your command is executed

      // Display a message box to the user
      vscode.window.showInformationMessage("Hello World!");
    }
  );

  let incrementSelection = vscode.commands.registerCommand(
    "extension.incrementSelection",
    function() {
      doSelection("increment");
    }
  );

  let decrementSelection = vscode.commands.registerCommand(
    "extension.decrementSelection",
    function() {
      doSelection("decrement");
    }
  );

  let reverseSelection = vscode.commands.registerCommand(
    "extension.reverseSelection",
    function() {
      reverse();
    }
  );

  context.subscriptions.push(
    disposable,
    incrementSelection,
    decrementSelection,
    reverseSelection
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
