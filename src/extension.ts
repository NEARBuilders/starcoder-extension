// 'vscode' module contains the VS Code extensibility API
import * as vscode from 'vscode';
//import { Range } from 'vscode';
import scansel from './commands/scansel';
import updatetoken from './updatetoken';
import lifetime from './commands/lifetime';
import request from './request';

export function activate(context: vscode.ExtensionContext) {
    // from StarCoderEx
    console.log('Extension "nearcoder" is now activated!');

    if (vscode.workspace.getConfiguration("nearcoder").get("bearertoken") === "") {
        updatetoken();
    }

    let scandoc = vscode.commands.registerCommand('nearcoder.ScanSel', async () => {
        await scansel();
    });

    let scandocprompt = vscode.commands.registerCommand('nearcoder.ScanSelPrompt', async () => {
        await scansel();
    });

    let tokenscreen = vscode.commands.registerCommand('nearcoder.TokenScreen', async () => {
        await updatetoken();
    });

    let realtime = vscode.commands.registerCommand('nearcoder.StartLifeTime', async () => {
        await lifetime();
    });

    context.subscriptions.push(scandoc, scandocprompt, tokenscreen, realtime);

    // "Hello World" sample
    const prompt = vscode.commands.registerCommand('extension.generate', () => {
        vscode.window.showInformationMessage('Greetings!');
    });

    context.subscriptions.push(prompt);

    // VS Code completion-sample

	// provider for plaintext completion items
    const provider1 = vscode.languages.registerCompletionItemProvider('plaintext', {
        async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
            // work in progress
            const range = new vscode.Range(new vscode.Position(0, 0), position);
            const text = document.getText(range);
            const response = await request(text);
            if (!response) {
                return [];
            }

            const snippetCompletion = new vscode.CompletionItem('Start writing code!');
            snippetCompletion.insertText = new vscode.SnippetString(response);
            snippetCompletion.documentation = new vscode.MarkdownString("Token suggestion from AI model.");
            return [snippetCompletion];
        }
    });

	// trigger suggested completions after a '.' is typed
    const provider2 = vscode.languages.registerCompletionItemProvider(
        'plaintext',
        {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                const linePrefix = document.lineAt(position).text.slice(0, position.character);
                if (!linePrefix.endsWith('near.')) {
                    return undefined;
                }
                return [
                    new vscode.CompletionItem('create', vscode.CompletionItemKind.Method),
                    new vscode.CompletionItem('test', vscode.CompletionItemKind.Method),
                    new vscode.CompletionItem('build', vscode.CompletionItemKind.Method),
                ];
            }
        },
        '.' // triggered whenever a '.' is being typed
    );

    context.subscriptions.push(provider1, provider2);

    const inlineProvider: vscode.InlineCompletionItemProvider = {
        async provideInlineCompletionItems(document: vscode.TextDocument, position: vscode.Position, context: vscode.InlineCompletionContext, token: vscode.CancellationToken) {
            const range = new vscode.Range(new vscode.Position(0, 0), position);
            const text = document.getText(range);
            const response = await request(text);
            if (!response) {
                return { items: [] };
            }

            const completionItem = new vscode.InlineCompletionItem(response, range);
            return { items: [completionItem] };
        }
    };

    vscode.languages.registerInlineCompletionItemProvider({ pattern: '**' }, inlineProvider);

}

export function deactivate() {}
