"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
function activate(context) {
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = `$(dashboard) C++ Stats`;
    statusBarItem.color = '#5f9ea0';
    statusBarItem.tooltip = 'Click to calculate C++ file statistics';
    statusBarItem.command = 'extension.cppStats';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
    let disposable = vscode.commands.registerCommand('extension.cppStats', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("Open C/C++ file before starting analysis!");
            return;
        }
        else {
            const lang = editor.document.languageId;
            if (lang !== 'c' && lang !== 'cpp' && lang !== 'c++') {
                vscode.window.showErrorMessage("Open C/C++ file before starting analysis!");
                return;
            }
        }
        const filePath = editor.document.fileName;
        const pythonScript = path.join(context.extensionPath, "analyzer.py");
        const python = (0, child_process_1.spawn)("python", [pythonScript, filePath]);
        let output = "";
        python.stdout.on("data", (data) => {
            output += data.toString();
        });
        python.on("close", () => {
            showWebView(output);
            vscode.window.setStatusBarMessage("C++ statistics updated!", 3000);
        });
        python.on("error", () => {
            vscode.window.showErrorMessage("An error occurred while running cpp-stats! Is Python installed on this machine?");
        });
    });
    context.subscriptions.push(disposable);
}
function showWebView(content) {
    const panel = vscode.window.createWebviewPanel("cppStats", "C++ Statistics", vscode.ViewColumn.One, {});
    panel.webview.html = `
    <html>
    <head>
        <meta charset="UTF-8">
        <title>C++ Statistics</title>
        <style>
            body {
                font-family: sans-serif;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100;
                margin: 0;
                background-color: #1f1f1f;
                color: #333;
            }
            h1 {
                color: #5f9ea0;
                font-size: 48px;
                margin-bottom: 20px;
            }
            pre {
                font-size: 24px;
                color: #cececeff;
                background-color: #205d5f;
                padding: 20px;
                border-radius: 8px;
                max-width: 90%;
                overflow-x: auto;
            }
        </style>
    </head>
    <body>
        <h1>C++ File Statistics</h1>
        <pre>${content}</pre>
    </body>
    </html>
    `;
}
function deactivate() { }
