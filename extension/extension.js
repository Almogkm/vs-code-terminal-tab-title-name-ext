'use strict'

const vscode = require('vscode')
const { parseCommandLine } = require('./parser')
const { sanitizeTitle } = require('./title')

const EXTENSION_ID = 'terminalTitles'
const COMMAND_ID = 'terminalTitles.debugInfo'
const TEST_COMMAND_ID = 'terminalTitles.renameActiveTerminalTest'
const REVERT_COMMAND_ID = 'terminalTitles.revertActiveTerminalToBaseline'
const OUTPUT_CHANNEL_NAME = 'Terminal Titles'
const OUTPUT_PREFIX = '[terminal-titles]'
const MIN_RENAME_INTERVAL_MS = 200
const DUPLICATE_TITLE_WINDOW_MS = 3000
const RENAME_GUARD_MS = 120

let outputChannel = null

function getOutputChannel() {
    if (!outputChannel) {
        outputChannel = vscode.window.createOutputChannel(OUTPUT_CHANNEL_NAME)
    }
    return outputChannel
}

function logInfo(message) {
    const output = getOutputChannel()
    output.appendLine(`${OUTPUT_PREFIX} ${message}`)
}

function logDebug(message) {
    if (!isDebugEnabled()) return
    logInfo(message)
}

function isEnabled() {
    return vscode.workspace
        .getConfiguration(EXTENSION_ID)
        .get('enabled', true)
}

function isDebugEnabled() {
    return vscode.workspace
        .getConfiguration(EXTENSION_ID)
        .get('debugLogging', false)
}

function extractCommandLine(execution) {
    if (!execution || !execution.commandLine) return ''
    const cmd = execution.commandLine
    if (typeof cmd === 'string') return cmd
    if (typeof cmd.value === 'string') return cmd.value
    return ''
}

const renamingTerminals = new WeakSet()
const renamingTimers = new WeakMap()
const terminalState = new WeakMap()

function isDedicatedTerminalName(name) {
    if (!name) return false
    const trimmed = name.trim()
    const patterns = [
        /^Python:\s+.+\.py\b/i,
        /^R:\s+.+\.r\b/i,
        /^Sh:\s+.+\.(sh|bash)\b/i,
        /^Bash:\s+.+\.(sh|bash)\b/i,
        /^Node:\s+.+\.m?js\b/i,
    ]
    return patterns.some((pattern) => pattern.test(trimmed))
}

function ensureTerminalState(terminal) {
    let state = terminalState.get(terminal)
    if (!state) {
        state = {
            baselineName: terminal && terminal.name ? terminal.name : '',
            isDedicatedPermanent: false,
            isTemporarilyRenamed: false,
            lastTemporaryTitle: null,
            lastRenameAt: 0,
            lastTitle: '',
            lastCommandLine: '',
        }
        state.isDedicatedPermanent = isDedicatedTerminalName(state.baselineName)
        terminalState.set(terminal, state)
        return state
    }

    if (!state.baselineName && terminal && terminal.name) {
        state.baselineName = terminal.name
        if (!state.isDedicatedPermanent) {
            state.isDedicatedPermanent = isDedicatedTerminalName(state.baselineName)
        }
    }

    return state
}

function markRenaming(terminal) {
    renamingTerminals.add(terminal)
    const existing = renamingTimers.get(terminal)
    if (existing) {
        clearTimeout(existing)
    }
    const timer = setTimeout(() => {
        renamingTerminals.delete(terminal)
        renamingTimers.delete(terminal)
    }, RENAME_GUARD_MS)
    renamingTimers.set(terminal, timer)
}

function isInternalCommand(commandLine) {
    if (!commandLine) return false
    const trimmed = commandLine.trim()
    if (/^printf\b/.test(trimmed)) return true
    const oscPattern = /(?:\\x1b|\\033|\\u001b|\x1b|\u001b)\](?:0|2);/
    if (oscPattern.test(trimmed)) return true
    if (/\\x1b\]2;|\\033\]2;|\\x1b\]0;|\\033\]0;/.test(trimmed)) {
        return true
    }
    return false
}

function getPrimaryCommandSegment(commandLine) {
    if (!commandLine) return ''
    let state = 'normal'
    for (let i = 0; i < commandLine.length; i += 1) {
        const ch = commandLine[i]
        if (state === 'normal') {
            if (ch === "'") {
                state = 'single'
                continue
            }
            if (ch === '"') {
                state = 'double'
                continue
            }
            if (ch === '\\') {
                i += 1
                continue
            }
            if (ch === ';' || ch === '|' || ch === '&') {
                return commandLine.slice(0, i).trim()
            }
        } else if (state === 'single') {
            if (ch === "'") state = 'normal'
        } else if (state === 'double') {
            if (ch === '"') {
                state = 'normal'
            } else if (ch === '\\') {
                i += 1
            }
        }
    }
    return commandLine.trim()
}

async function applyTitleToTerminal(terminal, title, options = {}) {
    if (!terminal || !title) return false

    const state = ensureTerminalState(terminal)
    const now = Date.now()
    const bypassRateLimit = options.bypassRateLimit === true

    if (!bypassRateLimit) {
        if (now - state.lastRenameAt < MIN_RENAME_INTERVAL_MS) {
            logDebug('rate limited: rename skipped')
            return false
        }
        if (
            title === state.lastTitle &&
            now - state.lastRenameAt < DUPLICATE_TITLE_WINDOW_MS
        ) {
            logDebug('duplicate title suppressed')
            return false
        }
    }

    markRenaming(terminal)
    try {
        terminal.show(true)
        await vscode.commands.executeCommand(
            'workbench.action.terminal.renameWithArg',
            { name: title }
        )
        state.lastRenameAt = Date.now()
        state.lastTitle = title
        if (options.commandLine) {
            state.lastCommandLine = options.commandLine
        }
        logDebug(`title applied: ${title}`)
        return true
    } catch (error) {
        logInfo(`rename failed: ${String(error)}`)
        return false
    }
}

async function renameTerminalForExecution(event) {
    if (!event || !event.execution || !event.terminal) {
        logDebug('execution event missing terminal or execution')
        return
    }

    const state = ensureTerminalState(event.terminal)
    if (state.isDedicatedPermanent) {
        logDebug('start event ignored: dedicated terminal')
        return
    }

    const rawCommandLine = extractCommandLine(event.execution)
    if (!rawCommandLine) {
        logDebug('execution event missing commandLine')
        return
    }

    if (renamingTerminals.has(event.terminal)) {
        logDebug('ignored internal title command')
        return
    }

    if (isInternalCommand(rawCommandLine)) {
        logDebug('ignored internal title command')
        return
    }

    const commandLine = getPrimaryCommandSegment(rawCommandLine)
    if (!commandLine) return

    const parsed = parseCommandLine(commandLine)
    if (parsed.kind === 'other') {
        logDebug('start event ignored: kind other')
        return
    }
    if (parsed.targetType !== 'file') {
        logDebug('start event ignored: targetType not file')
        return
    }
    const safeTitle = sanitizeTitle(parsed.title)

    logDebug(`execution start: ${rawCommandLine}`)
    if (commandLine !== rawCommandLine) {
        logDebug(`command truncated for parsing: ${commandLine}`)
    }
    logDebug(`parsed title: ${parsed.title}`)

    if (!safeTitle) return

    const applied = await applyTitleToTerminal(event.terminal, safeTitle, {
        commandLine,
    })
    if (applied) {
        state.isTemporarilyRenamed = true
        state.lastTemporaryTitle = safeTitle
    }
}

function handleExecutionStart(event) {
    if (!isEnabled()) return
    void renameTerminalForExecution(event)
}

async function handleExecutionEnd(event) {
    if (!isEnabled()) return
    if (!event || !event.terminal) {
        logDebug('execution end missing terminal')
        return
    }

    const state = ensureTerminalState(event.terminal)
    if (state.isDedicatedPermanent) {
        logDebug('end event ignored: dedicated terminal')
        return
    }

    if (!state.isTemporarilyRenamed) {
        logDebug('end event ignored: not temporarily renamed')
        return
    }

    const baseline = sanitizeTitle(state.baselineName)
    if (!baseline) {
        logDebug('end event ignored: missing baseline')
        state.isTemporarilyRenamed = false
        state.lastTemporaryTitle = null
        return
    }

    const reverted = await applyTitleToTerminal(event.terminal, baseline, {
        bypassRateLimit: true,
    })
    logDebug(`revert ${reverted ? 'applied' : 'skipped'}`)
    state.isTemporarilyRenamed = false
    state.lastTemporaryTitle = null
}

function registerTestCommand(context) {
    const temporaryDisposable = vscode.commands.registerCommand(
        TEST_COMMAND_ID,
        async () => {
            const terminal = vscode.window.activeTerminal
            if (!terminal) {
                logInfo('set title test failed: no active terminal')
                void vscode.window.showInformationMessage(
                    'Terminal Titles: No active terminal.'
                )
                return
            }

            const state = ensureTerminalState(terminal)
            if (state.isDedicatedPermanent) {
                logInfo('set title test skipped: dedicated terminal')
                void vscode.window.showInformationMessage(
                    'Terminal Titles: Dedicated terminal; no change.'
                )
                return
            }

            const title = sanitizeTitle('Python: calculate_TVA_single.py')
            const success = await applyTitleToTerminal(terminal, title, {
                bypassRateLimit: true,
            })
            if (success) {
                state.isTemporarilyRenamed = true
                state.lastTemporaryTitle = title
                void vscode.window.showInformationMessage(
                    'Terminal Titles: Temporary rename applied.'
                )
            }
        }
    )

    const revertDisposable = vscode.commands.registerCommand(
        REVERT_COMMAND_ID,
        async () => {
            const terminal = vscode.window.activeTerminal
            if (!terminal) {
                logInfo('revert failed: no active terminal')
                void vscode.window.showInformationMessage(
                    'Terminal Titles: No active terminal.'
                )
                return
            }

            const state = ensureTerminalState(terminal)
            const baseline = sanitizeTitle(state.baselineName)
            if (!baseline) {
                logInfo('revert skipped: missing baseline')
                void vscode.window.showInformationMessage(
                    'Terminal Titles: No baseline name.'
                )
                return
            }

            const success = await applyTitleToTerminal(terminal, baseline, {
                bypassRateLimit: true,
            })
            if (success) {
                state.isTemporarilyRenamed = false
                state.lastTemporaryTitle = null
                void vscode.window.showInformationMessage(
                    'Terminal Titles: Reverted to baseline.'
                )
            }
        }
    )

    context.subscriptions.push(temporaryDisposable, revertDisposable)
}

function activate(context) {
    console.log(`${OUTPUT_PREFIX} activated`)
    logInfo('activated')

    const debugDisposable = vscode.commands.registerCommand(
        COMMAND_ID,
        () => {
            void vscode.window.showInformationMessage(
                'Terminal Titles: Debug Info'
            )
        }
    )
    context.subscriptions.push(debugDisposable)

    registerTestCommand(context)

    const openDisposable = vscode.window.onDidOpenTerminal((terminal) => {
        ensureTerminalState(terminal)
        logDebug(`terminal opened: ${terminal.name}`)
    })
    context.subscriptions.push(openDisposable)

    const hasShellExecEvents =
        typeof vscode.window.onDidStartTerminalShellExecution === 'function'
    const hasShellExecEndEvents =
        typeof vscode.window.onDidEndTerminalShellExecution === 'function'

    logInfo(
        `shell execution events available: ${hasShellExecEvents ? 'yes' : 'no'}`
    )

    if (hasShellExecEvents) {
        const execDisposable = vscode.window.onDidStartTerminalShellExecution(
            handleExecutionStart
        )
        context.subscriptions.push(execDisposable)
    } else {
        logInfo('shell execution events not available; no-op')
    }

    logInfo(
        `shell execution end events available: ${
            hasShellExecEndEvents ? 'yes' : 'no'
        }`
    )

    if (hasShellExecEndEvents) {
        const endDisposable = vscode.window.onDidEndTerminalShellExecution(
            handleExecutionEnd
        )
        context.subscriptions.push(endDisposable)
    }
}

function deactivate() {
    // No-op
}

module.exports = {
    activate,
    deactivate,
}
