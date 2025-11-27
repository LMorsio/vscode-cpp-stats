import * as vscode from 'vscode';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {

    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = `$(dashboard) C++ Stats`;
    statusBarItem.color = '#5f9ea0';
    statusBarItem.tooltip = 'Click to calculate C++ file statistics';
    statusBarItem.command = 'extension.cppStats';
    statusBarItem.show();

    context.subscriptions.push(statusBarItem);

    let disposable = vscode.commands.registerCommand('extension.cppStats', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor ) {
            vscode.window.showErrorMessage("Open C/C++ file before starting analysis!");
            return;
        } else {
            const lang = editor.document.languageId;
            if (lang !== 'c' && lang !== 'cpp' && lang !== 'c++') {
                vscode.window.showErrorMessage("Open C/C++ file before starting analysis!");
                return;
            }
        }

        const filePath = editor.document.fileName;
        const pythonScript = path.join(context.extensionPath, "analyzer.py");

        const python = spawn("python", [pythonScript, filePath]);

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

function showWebView(content: string) {
    const panel = vscode.window.createWebviewPanel(
        "cppStats",
        "C++ Statistics",
        vscode.ViewColumn.One,
        {}
    );

    const origin = vscode.extensions.getExtension('morsio.vscode-cpp-stats')!.extensionPath;

    const htmlPath = path.join(
        origin,
        'src',
        'summary.html'
    );

    const cssPath = vscode.Uri.file(
        path.join(origin, "src", "styles.css")
    );

    const cssUri = panel.webview.asWebviewUri(cssPath);
    
    let html = fs.readFileSync(htmlPath, 'utf8');

    html = html.replace("{{stats}}", content);
    html = html.replace("{{styles.css}}", cssUri.toString());

    panel.webview.html = html;
}

export function deactivate() {}
