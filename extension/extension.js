'use strict'

const vscode = require('vscode')

function activate(context) {
    console.log('[terminal-titles] activated')

    const disposable = vscode.commands.registerCommand(
        'terminalTitles.debugInfo',
        () => {
            void vscode.window.showInformationMessage(
                'Terminal Titles: Debug Info'
            )
        }
    )

    context.subscriptions.push(disposable)
}

function deactivate() {
    // No-op
}

module.exports = {
    activate,
    deactivate,
}
