import * as vscode from 'vscode'

const OUTPUT_CHANNEL_NAME = 'Terminal Titles'

export function activate(context: vscode.ExtensionContext) {
    const output = vscode.window.createOutputChannel(OUTPUT_CHANNEL_NAME)
    output.appendLine('Extension activated')

    const disposable = vscode.commands.registerCommand(
        'terminalTitles.debugInfo',
        () => {
            const info = {
                appName: vscode.env.appName,
                appHost: vscode.env.appHost,
                appRoot: vscode.env.appRoot,
                language: vscode.env.language,
                machineId: vscode.env.machineId,
                sessionId: vscode.env.sessionId,
                shell: process.env.SHELL || null,
                cwd: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || null,
            }

            output.appendLine('Debug Info:')
            output.appendLine(JSON.stringify(info, null, 2))
            output.show(true)
            void vscode.window.showInformationMessage(
                'Terminal Titles: Debug info written to output channel.'
            )
        }
    )

    context.subscriptions.push(output, disposable)
}

export function deactivate() {
    // No-op
}
