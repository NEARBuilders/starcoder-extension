// 'vscode' module contains the VS Code extensibility API
import * as vscode from 'vscode';
import { Range } from 'vscode';
import scansel from './commands/scansel';
import updatetoken from './updatetoken';
import lifetime from './commands/lifetime';

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

    context.subscriptions.push(scandoc);
    context.subscriptions.push(scandocprompt);
    context.subscriptions.push(tokenscreen);
    context.subscriptions.push(realtime);

    // "Hello World" sample
    const prompt = vscode.commands.registerCommand('extension.generate', () => {
        vscode.window.showInformationMessage('Greetings!');
    });

    context.subscriptions.push(prompt);

    async function query(data: any): Promise<any> {
        try {
            const response = await fetch(
                "https://api-inference.huggingface.co/models/bigcode/starcoder2-3b",
                {
                    headers: {
                        Authorization: "Bearer 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",
                        "Content-Type": "application/json",
                    },
                    method: "POST",
                    body: JSON.stringify(data),
                }
            );
            const result = await response.json();
            return result;
        } catch (error) {
            console.error("Error querying HuggingFace API:", error);
            return null;
        }
    }

    // VS Code completion-sample

	// provider for plaintext completion items
    const provider1 = vscode.languages.registerCompletionItemProvider('plaintext', {
        async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
            const simpleCompletion = new vscode.CompletionItem('Hi coder!');
            // work in progress
            const snippetCompletion = new vscode.CompletionItem('Start writing code!');
            const response = await query({ "inputs": "What are you building?" });
            snippetCompletion.insertText = new vscode.SnippetString(`Good ${response ? response.generated_text : "day"}`);
            const docs: any = new vscode.MarkdownString("Inserts a snippet that lets you select [link](x.ts).");
            snippetCompletion.documentation = docs;
            docs.baseUri = vscode.Uri.parse('https://api-inference.huggingface.co/models/bigcode/starcoder2-3b');

            const commitCharacterCompletion = new vscode.CompletionItem('console');
            commitCharacterCompletion.commitCharacters = ['.'];
            commitCharacterCompletion.documentation = new vscode.MarkdownString('Press `.` to get `console.`');

            const commandCompletion = new vscode.CompletionItem('new');
            commandCompletion.kind = vscode.CompletionItemKind.Keyword;
            commandCompletion.insertText = 'new ';
            commandCompletion.command = { command: 'editor.action.triggerSuggest', title: 'Re-trigger completions...' };

            return [
                simpleCompletion,
                snippetCompletion,
                commitCharacterCompletion,
                commandCompletion
            ];
        }
    });

	// trigger suggested completions after a '.' is typed
    const provider2 = vscode.languages.registerCompletionItemProvider(
        'plaintext',
        {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                // get all text until the `position` and check if it reads `console.`
                // and if so then complete if `log`, `warn`, and `error`
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

//     INLINE COMPLETIONS
//
//     console.log('inline-completions demo started');
//     vscode.commands.registerCommand('demo-ext.command1', async (...args) => {
//         vscode.window.showInformationMessage('command1: ' + JSON.stringify(args));
//     });

//     const provider: vscode.InlineCompletionItemProvider = {
//         async provideInlineCompletionItems(document, position, context, token) {
//             console.log('provideInlineCompletionItems triggered');
//             const regexp = /\/\/ \[(.+?),(.+?)\)(.*?):(.*)/;
//             if (position.line <= 0) {
//                 return;
//             }

//             const result: vscode.InlineCompletionList = {
//                 items: [],
//                 commands: [],
//             };

//             let offset = 1;
//             while (offset > 0) {
//                 if (position.line - offset < 0) {
//                     break;
//                 }
//                 const lineBefore = document.lineAt(position.line - offset).text;
//                 const matches = lineBefore.match(regexp);
//                 if (!matches) {
//                     break;
//                 }
//                 offset++;

//                 const start = matches[1];
//                 const startInt = parseInt(start, 10);
//                 const end = matches[2];
//                 const endInt =
//                     end === '*'
//                         ? document.lineAt(position.line).text.length
//                         : parseInt(end, 10);
//                 const flags = matches[3];
//                 const completeBracketPairs = flags.includes('b');
//                 const isSnippet = flags.includes('s');
//                 const text = matches[4].replace(/\\n/g, '\n');

//                 result.items.push({
//                     insertText: isSnippet ? new vscode.SnippetString(text) : text,
//                     range: new Range(position.line, startInt, position.line, endInt),
//                     completeBracketPairs,
//                 });
//             }

//             if (result.items.length > 0) {
//                 result.commands!.push({
//                     command: 'demo-ext.command1',
//                     title: 'Build',
//                     arguments: [1, 2],
//                 });
//             }
//             return result;
//         },

//         handleDidShowCompletionItem(completionItem: vscode.InlineCompletionItem): void {
//             console.log('handleDidShowCompletionItem');
//         },

//         /**
//          * Is called when an inline completion item was accepted partially.
//          * @param acceptedLength The length of the substring of the inline completion that was accepted already.
//          */
//         handleDidPartiallyAcceptCompletionItem(
//             completionItem: vscode.InlineCompletionItem,
//             info: vscode.PartialAcceptInfo | number
//         ): void {
//             console.log('handleDidPartiallyAcceptCompletionItem');
//         },
//     };
//     vscode.languages.registerInlineCompletionItemProvider({ pattern: '**' }, provider);

}

export function deactivate() {}
