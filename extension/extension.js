'use strict'

const vscode = require('vscode')
const path = require('path')
const { parseCommandTokens, tokenizeCommandLine } = require('./parser')
const { sanitizeTitle } = require('./title')

const EXTENSION_ID = 'terminalTabTitles'
const COMMAND_ID = 'terminalTabTitles.debugInfo'
const TEST_COMMAND_ID = 'terminalTabTitles.renameActiveTerminalTest'
const REVERT_COMMAND_ID = 'terminalTabTitles.revertActiveTerminalToBaseline'
const OUTPUT_CHANNEL_NAME = 'Terminal Tab Titles'
const OUTPUT_PREFIX = '[terminal-tab-titles]'
const MIN_RENAME_INTERVAL_MS = 200
const DUPLICATE_TITLE_WINDOW_MS = 3000
const RENAME_GUARD_MS = 120
const EDITOR_RUN_DETECT_WINDOW_MS = 3000
const DEFAULT_BASELINE_NAME = 'bash'

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
        /^Java:\s+.+\.java\b/i,
    ]
    return patterns.some((pattern) => pattern.test(trimmed))
}

function isTransientProcessName(name) {
    if (!name) return false
    const trimmed = name.trim().toLowerCase()
    if (!trimmed) return false
    const patterns = [
        /^python(?:\d+(?:\.\d+)*)?$/,
        /^node(js)?$/,
        /^r$/,
        /^rscript$/,
        /^pwsh$/,
        /^powershell$/,
    ]
    return patterns.some((pattern) => pattern.test(trimmed))
}

function isShellBaselineName(name) {
    if (!name) return false
    const trimmed = name.trim().toLowerCase()
    return ['bash', 'zsh', 'sh', 'fish'].includes(trimmed)
}

function ensureTerminalState(terminal) {
    let state = terminalState.get(terminal)
    if (!state) {
        state = {
            baselineName: '',
            baselineCaptured: false,
            isDedicatedPermanent: false,
            fixedName: null,
            openedAtMs: 0,
            hasSeenAnyExecution: false,
            isTemporarilyRenamed: false,
            lastTemporaryTitle: null,
            lastRenameAt: 0,
            lastTitle: '',
            lastCommandLine: '',
        }
        terminalState.set(terminal, state)
        return state
    }

    return state
}

function captureBaselineIfNeeded(terminal, state, source) {
    if (!state || state.baselineCaptured) return
    const name = terminal && terminal.name ? String(terminal.name) : ''
    if (!name) return
    const trimmed = name.trim()
    if (!trimmed) return

    const isDedicatedName = isDedicatedTerminalName(trimmed)
    const isTransient = isTransientProcessName(trimmed)
    const isShellBaseline = isShellBaselineName(trimmed)
    if (isTransient && !isDedicatedName) {
        logDebug(`baseline capture skipped (transient): "${trimmed}"`)
        return
    }

    const wasDedicated = state.isDedicatedPermanent
    state.baselineName = trimmed
    state.baselineCaptured = true
    const baselineMatches = isDedicatedName
    if (!wasDedicated) {
        state.isDedicatedPermanent = baselineMatches
        if (state.isDedicatedPermanent) {
            state.fixedName = sanitizeTitle(state.baselineName)
        }
    }

    if (source === 'deferred') {
        logDebug(`baseline deferred capture: "${state.baselineName}"`)
    } else {
        logDebug(`baseline captured: "${state.baselineName}"`)
    }
    logDebug(
        `dedicated? ${baselineMatches ? 'yes' : 'no'} (reason: ${
            baselineMatches ? 'matched regex' : isShellBaseline ? 'shell baseline' : 'no match'
        })`
    )
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

function stripRedirectionsFromSegment(segment) {
    if (!segment) return []
    const tokens = tokenizeCommandLine(segment)
    const redirOperators = new Set([
        '>',
        '>>',
        '<',
        '2>',
        '2>>',
        '&>',
        '1>',
        '1>>',
    ])
    const redirWithTarget = /^(?:\d>>|\d>|>>|>|<|&>)/
    const output = []
    for (let i = 0; i < tokens.length; i += 1) {
        const token = tokens[i]
        if (redirOperators.has(token)) {
            i += 1
            continue
        }
        if (redirWithTarget.test(token)) {
            continue
        }
        output.push(token)
    }
    return output
}

function isInvalidParsedTitle(parsed) {
    if (!parsed || !parsed.title) return true
    if (!parsed.primaryTarget) return true
    const title = String(parsed.title).toLowerCase()
    return title.includes(': null')
}

function isBaselineEligibleForEditorDetection(baselineName) {
    if (!baselineName) return true
    return baselineName.trim().toLowerCase() === 'bash'
}

function activeEditorMatchesParsed(parsed) {
    if (!parsed || parsed.targetType !== 'file' || !parsed.primaryTarget) {
        return false
    }
    const editor = vscode.window.activeTextEditor
    if (!editor || !editor.document || !editor.document.uri) return false
    const fsPath = editor.document.uri.fsPath
    if (!fsPath) return false
    const base = path.basename(fsPath)
    if (base === parsed.primaryTarget) return true
    if (parsed.rawTarget && fsPath.endsWith(parsed.rawTarget)) return true
    return false
}

async function enforceDedicatedName(terminal, state, options = {}) {
    if (!state.isDedicatedPermanent || !state.fixedName) return
    const name = sanitizeTitle(state.fixedName)
    if (!name) return
    await applyTitleToTerminal(terminal, name, {
        force: true,
        bypassRateLimit: options.bypassRateLimit === true,
    })
}

async function applyTitleToTerminal(terminal, title, options = {}) {
    if (!terminal || !title) return false

    const state = ensureTerminalState(terminal)
    const now = Date.now()
    const bypassRateLimit = options.bypassRateLimit === true
    const force = options.force === true

    if (!bypassRateLimit) {
        if (now - state.lastRenameAt < MIN_RENAME_INTERVAL_MS) {
            logDebug('rate limited: rename skipped')
            return false
        }
        if (
            !force &&
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
    captureBaselineIfNeeded(event.terminal, state, 'deferred')
    const isFirstExecution = !state.hasSeenAnyExecution
    if (isFirstExecution) {
        state.hasSeenAnyExecution = true
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

    const tokensForParsing = stripRedirectionsFromSegment(commandLine)
    if (!tokensForParsing.length) {
        logDebug('start event ignored: empty after redirection strip')
        return
    }

    const parsed = parseCommandTokens(tokensForParsing)

    if (state.isDedicatedPermanent) {
        logDebug('start event: dedicated terminal enforcement')
        await enforceDedicatedName(event.terminal, state)
        return
    }

    if (
        isFirstExecution &&
        !state.isTemporarilyRenamed &&
        parsed.targetType === 'file' &&
        !isInvalidParsedTitle(parsed) &&
        state.openedAtMs > 0 &&
        Date.now() - state.openedAtMs <= EDITOR_RUN_DETECT_WINDOW_MS &&
        isBaselineEligibleForEditorDetection(state.baselineName) &&
        activeEditorMatchesParsed(parsed)
    ) {
        const fixedName = sanitizeTitle(parsed.title)
        if (fixedName) {
            state.isDedicatedPermanent = true
            state.fixedName = fixedName
            logDebug(
                `dedicated (editor-run) detected; fixedName="${fixedName}" reason: active editor match`
            )
            await applyTitleToTerminal(event.terminal, fixedName, {
                force: true,
                bypassRateLimit: true,
                commandLine,
            })
            return
        }
    }

    if (parsed.kind === 'other') {
        logDebug('start event ignored: kind other')
        return
    }
    if (parsed.targetType !== 'file') {
        logDebug('start event ignored: targetType not file')
        return
    }
    if (isInvalidParsedTitle(parsed)) {
        logDebug('start event ignored: invalid parsed title')
        return
    }
    const safeTitle = sanitizeTitle(parsed.title)

    logDebug(`execution start: ${rawCommandLine}`)
    const normalizedForLog = tokensForParsing.join(' ')
    if (normalizedForLog !== rawCommandLine) {
        logDebug(`tokens for parsing: ${JSON.stringify(tokensForParsing)}`)
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
    captureBaselineIfNeeded(event.terminal, state, 'deferred')
    if (state.isDedicatedPermanent) {
        logDebug('end event: dedicated terminal enforcement')
        await enforceDedicatedName(event.terminal, state)
        return
    }

    if (!state.isTemporarilyRenamed) {
        logDebug('end event ignored: not temporarily renamed')
        return
    }

    if (
        !state.baselineCaptured ||
        !state.baselineName ||
        isTransientProcessName(state.baselineName)
    ) {
        state.baselineName = DEFAULT_BASELINE_NAME
        state.baselineCaptured = true
        logDebug(`baseline fallback applied: "${DEFAULT_BASELINE_NAME}"`)
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
                    'Terminal Tab Titles: No active terminal.'
                )
                return
            }

            const state = ensureTerminalState(terminal)
            captureBaselineIfNeeded(terminal, state, 'deferred')
            if (state.isDedicatedPermanent) {
                logInfo('set title test skipped: dedicated terminal')
                void vscode.window.showInformationMessage(
                    'Terminal Tab Titles: Dedicated terminal; no change.'
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
                    'Terminal Tab Titles: Temporary rename applied.'
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
                    'Terminal Tab Titles: No active terminal.'
                )
                return
            }

            const state = ensureTerminalState(terminal)
            captureBaselineIfNeeded(terminal, state, 'deferred')
            if (state.isDedicatedPermanent) {
                logInfo('revert skipped: dedicated terminal')
                void vscode.window.showInformationMessage(
                    'Terminal Tab Titles: Dedicated terminal; no revert.'
                )
                return
            }
            const baseline = sanitizeTitle(state.baselineName)
            if (!baseline) {
                logInfo('revert skipped: missing baseline')
                void vscode.window.showInformationMessage(
                    'Terminal Tab Titles: No baseline name.'
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
                    'Terminal Tab Titles: Reverted to baseline.'
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
                'Terminal Tab Titles: Debug Info'
            )
        }
    )
    context.subscriptions.push(debugDisposable)

    registerTestCommand(context)

    const openDisposable = vscode.window.onDidOpenTerminal((terminal) => {
        const state = ensureTerminalState(terminal)
        state.openedAtMs = Date.now()
        captureBaselineIfNeeded(terminal, state, 'open')
        logDebug(
            `terminal opened: openedAtMs=${state.openedAtMs} initial name="${terminal.name}"`
        )
    })
    context.subscriptions.push(openDisposable)

    const hasShellExecEvents =
        typeof vscode.window.onDidStartTerminalShellExecution === 'function'
    const hasShellExecEndEvents =
        typeof vscode.window.onDidEndTerminalShellExecution === 'function'
    const hasNameChangeEvents =
        typeof vscode.window.onDidChangeTerminalName === 'function'

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

    logInfo(
        `terminal name change events available: ${
            hasNameChangeEvents ? 'yes' : 'no'
        }`
    )

    if (hasNameChangeEvents) {
        const nameDisposable = vscode.window.onDidChangeTerminalName(
            async (terminal) => {
                const state = ensureTerminalState(terminal)
                captureBaselineIfNeeded(terminal, state, 'deferred')
                if (!state.isDedicatedPermanent || !state.fixedName) return
                if (renamingTerminals.has(terminal)) return
                if (terminal.name === state.fixedName) return
                logDebug(`name changed: enforcing fixed name ${state.fixedName}`)
                await enforceDedicatedName(terminal, state)
            }
        )
        context.subscriptions.push(nameDisposable)
    }
}

function deactivate() {
    // No-op
}

module.exports = {
    activate,
    deactivate,
}
