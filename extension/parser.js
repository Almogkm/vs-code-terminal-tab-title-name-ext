'use strict'

function tokenizeCommandLine(input, options = {}) {
    const tokens = []
    let current = ''
    let state = 'normal'

    const pushCurrent = () => {
        if (current.length > 0 || options.keepEmpty) {
            tokens.push(current)
        }
        current = ''
    }

    for (let i = 0; i < input.length; i += 1) {
        const ch = input[i]

        if (state === 'normal') {
            if (ch === ' ' || ch === '\t' || ch === '\n') {
                pushCurrent()
                continue
            }
            if (ch === "'") {
                state = 'single'
                continue
            }
            if (ch === '"') {
                state = 'double'
                continue
            }
            if (ch === '\\') {
                if (i + 1 < input.length) {
                    current += input[i + 1]
                    i += 1
                    continue
                }
                continue
            }
            current += ch
            continue
        }

        if (state === 'single') {
            if (ch === "'") {
                state = 'normal'
                continue
            }
            current += ch
            continue
        }

        if (state === 'double') {
            if (ch === '"') {
                state = 'normal'
                continue
            }
            if (ch === '\\') {
                if (i + 1 < input.length) {
                    const next = input[i + 1]
                    if (
                        next === '"' ||
                        next === '\\' ||
                        next === '$' ||
                        next === '`' ||
                        next === '\n'
                    ) {
                        current += next
                        i += 1
                        continue
                    }
                }
                current += ch
                continue
            }
            current += ch
        }
    }

    pushCurrent()
    return tokens.filter((token) => token.length > 0 || options.keepEmpty)
}

function parseCommandTokens(rawTokens) {
    const tokens = Array.isArray(rawTokens) ? rawTokens.slice() : []
    const argv = stripWrappers(tokens)

    if (argv.length === 0) {
        return {
            kind: 'other',
            command: null,
            argv,
            rawTokens: tokens,
            primaryTarget: null,
            targetType: 'none',
            rawTarget: null,
            title: 'Terminal',
        }
    }

    const command = argv[0]
    const args = argv.slice(1)
    const commandBase = normalizeCommandName(command)

    let kind = classifyCommand(commandBase)
    let targetInfo = { primaryTarget: null, targetType: 'none' }
    let rawTarget = null

    if (kind === 'python') {
        const pythonInfo = parsePythonArgs(args)
        if (
            pythonInfo.mode === 'module' &&
            pythonInfo.module &&
            isPytestModule(pythonInfo.module)
        ) {
            kind = 'pytest'
            targetInfo = parsePytestArgs(pythonInfo.remainingArgs)
        } else if (pythonInfo.mode === 'module' && pythonInfo.module) {
            targetInfo = {
                primaryTarget: pythonInfo.module,
                targetType: 'module',
            }
        } else if (pythonInfo.mode === 'script' && pythonInfo.script) {
            rawTarget = pythonInfo.script
            targetInfo = {
                primaryTarget: basenameLike(pythonInfo.script),
                targetType: 'file',
            }
        }
    } else if (kind === 'pytest') {
        targetInfo = parsePytestArgs(args)
    } else if (kind === 'node') {
        const nodeInfo = parseNodeArgs(args)
        if (nodeInfo.mode === 'script' && nodeInfo.script) {
            rawTarget = nodeInfo.script
            targetInfo = {
                primaryTarget: basenameLike(nodeInfo.script),
                targetType: 'file',
            }
        }
    } else if (kind === 'r') {
        const rInfo = parseRArgs(commandBase, args)
        if (rInfo.script) {
            rawTarget = rInfo.script
            targetInfo = {
                primaryTarget: basenameLike(rInfo.script),
                targetType: 'file',
            }
        }
    } else if (kind === 'bash') {
        const bashInfo = parseShellArgs(args)
        if (bashInfo.script) {
            rawTarget = bashInfo.script
            targetInfo = {
                primaryTarget: basenameLike(bashInfo.script),
                targetType: 'file',
            }
        }
    } else if (kind === 'make') {
        targetInfo = parseMakeArgs(args)
    }

    const title = formatTitle(kind, targetInfo.primaryTarget, commandBase)

    return {
        kind,
        command,
        argv,
        rawTokens: tokens,
        primaryTarget: targetInfo.primaryTarget,
        targetType: targetInfo.targetType,
        rawTarget,
        title,
    }
}

function parseCommandLine(commandLine) {
    return parseCommandTokens(tokenizeCommandLine(commandLine))
}

function classifyCommand(commandBase) {
    if (isPythonCommand(commandBase)) return 'python'
    if (isPytestCommand(commandBase)) return 'pytest'
    if (isNodeCommand(commandBase)) return 'node'
    if (isRCommand(commandBase)) return 'r'
    if (isShellCommand(commandBase)) return 'bash'
    if (isMakeCommand(commandBase)) return 'make'
    return 'other'
}

function formatTitle(kind, primaryTarget, commandBase) {
    const labelMap = {
        python: 'Python',
        r: 'R',
        bash: 'Bash',
        node: 'Node',
        pytest: 'Pytest',
        make: 'Make',
        other: 'Command',
    }

    if (primaryTarget) {
        return `${labelMap[kind]}: ${primaryTarget}`
    }

    if (kind === 'other' && commandBase) {
        return `Command: ${commandBase}`
    }

    return labelMap[kind]
}

function stripWrappers(tokens) {
    let i = 0

    const skipEnvAssignments = () => {
        while (i < tokens.length && isEnvAssignment(tokens[i])) {
            i += 1
        }
    }

    skipEnvAssignments()

    while (i < tokens.length) {
        const token = tokens[i]
        if (token === 'env') {
            i += 1
            while (i < tokens.length) {
                const t = tokens[i]
                if (t === '--') {
                    i += 1
                    break
                }
                if (isEnvAssignment(t) || t.startsWith('-')) {
                    i += 1
                    continue
                }
                break
            }
            skipEnvAssignments()
            continue
        }

        if (token === 'sudo') {
            i += 1
            while (i < tokens.length) {
                const t = tokens[i]
                if (t === '--') {
                    i += 1
                    break
                }
                if (t === '-u' || t === '-g') {
                    i += 2
                    continue
                }
                if (t.startsWith('-')) {
                    i += 1
                    continue
                }
                break
            }
            skipEnvAssignments()
            continue
        }

        if (token === 'command' || token === 'time') {
            i += 1
            if (tokens[i] === '--') i += 1
            skipEnvAssignments()
            continue
        }

        break
    }

    return tokens.slice(i)
}

function normalizeCommandName(command) {
    const base = basenameLike(command)
    const lower = base.toLowerCase()
    if (lower.endsWith('.exe')) return lower.slice(0, -4)
    return lower
}

function basenameLike(value) {
    const trimmed = value.replace(/[\\/]+$/g, '')
    const parts = trimmed.split(/[\\/]/)
    return parts[parts.length - 1] || value
}

function isEnvAssignment(token) {
    return /^[A-Za-z_][A-Za-z0-9_]*=.*/.test(token)
}

function isPythonCommand(commandBase) {
    return (
        commandBase === 'python' ||
        commandBase.startsWith('python3') ||
        commandBase === 'py'
    )
}

function isPytestCommand(commandBase) {
    return commandBase === 'pytest' || commandBase === 'py.test'
}

function isPytestModule(moduleName) {
    const normalized = moduleName.toLowerCase()
    return normalized === 'pytest' || normalized === 'py.test'
}

function isNodeCommand(commandBase) {
    return commandBase === 'node' || commandBase === 'nodejs'
}

function isRCommand(commandBase) {
    return commandBase === 'r' || commandBase === 'rscript'
}

function isShellCommand(commandBase) {
    return (
        commandBase === 'bash' ||
        commandBase === 'sh' ||
        commandBase === 'zsh' ||
        commandBase === 'fish'
    )
}

function isMakeCommand(commandBase) {
    return commandBase === 'make' || commandBase === 'gmake'
}

function parsePythonArgs(args) {
    for (let i = 0; i < args.length; i += 1) {
        const token = args[i]
        if (token === '-m' && i + 1 < args.length) {
            return {
                mode: 'module',
                module: args[i + 1],
                remainingArgs: args.slice(i + 2),
            }
        }
        if (token === '-c') {
            return { mode: 'code', remainingArgs: args.slice(i + 2) }
        }
        if (token.startsWith('-')) {
            continue
        }
        if (!isLikelyFileToken(token, 'python')) {
            continue
        }
        return {
            mode: 'script',
            script: token,
            remainingArgs: args.slice(i + 1),
        }
    }

    return { mode: 'interactive', remainingArgs: [] }
}

function parseNodeArgs(args) {
    for (let i = 0; i < args.length; i += 1) {
        const token = args[i]
        if (token === '-e' || token === '-p') {
            return { mode: 'eval' }
        }
        if (token.startsWith('-')) {
            continue
        }
        if (!isLikelyFileToken(token, 'node')) {
            continue
        }
        return { mode: 'script', script: token }
    }

    return { mode: 'repl' }
}

function parseRArgs(commandBase, args) {
    if (commandBase === 'rscript') {
        for (const token of args) {
            if (!token.startsWith('-')) {
                if (!isLikelyFileToken(token, 'r')) {
                    continue
                }
                return { script: token }
            }
        }
        return {}
    }

    for (let i = 0; i < args.length; i += 1) {
        const token = args[i]
        if ((token === '-f' || token === '--file') && i + 1 < args.length) {
            if (!isLikelyFileToken(args[i + 1], 'r')) {
                return {}
            }
            return { script: args[i + 1] }
        }
    }
    return {}
}

function parseShellArgs(args) {
    for (let i = 0; i < args.length; i += 1) {
        const token = args[i]
        if (token === '-c') {
            return {}
        }
        if (token.startsWith('-')) {
            continue
        }
        return { script: token }
    }
    return {}
}

function parsePytestArgs(args) {
    for (let i = 0; i < args.length; i += 1) {
        const token = args[i]
        if (token.startsWith('-')) {
            if (pytestOptionTakesValue(token) && i + 1 < args.length) {
                i += 1
            }
            continue
        }
        return { primaryTarget: basenameLike(token), targetType: 'target' }
    }

    return { primaryTarget: null, targetType: 'none' }
}

function pytestOptionTakesValue(option) {
    return (
        option === '-k' ||
        option === '-m' ||
        option === '-c' ||
        option === '--confcutdir' ||
        option === '--rootdir' ||
        option === '--maxfail'
    )
}

function parseMakeArgs(args) {
    for (let i = 0; i < args.length; i += 1) {
        const token = args[i]
        if (token.startsWith('-')) {
            if (makeOptionTakesValue(token) && i + 1 < args.length) {
                i += 1
            }
            continue
        }
        return { primaryTarget: token, targetType: 'target' }
    }
    return { primaryTarget: null, targetType: 'none' }
}

function makeOptionTakesValue(option) {
    return option === '-f' || option === '-C' || option === '-j'
}

function isRedirectionToken(token) {
    if (!token) return false
    const trimmed = token.trim()
    const operators = new Set(['>', '>>', '<', '2>', '2>>', '&>', '1>', '1>>'])
    if (operators.has(trimmed)) return true
    return /^(?:\d>>|\d>|>>|>|<|&>)/.test(trimmed)
}

function isLikelyFileToken(token, kind) {
    if (!token) return false
    if (isRedirectionToken(token)) return false
    const lower = token.toLowerCase()
    const extMap = {
        python: ['.py'],
        node: ['.js', '.mjs', '.cjs'],
        r: ['.r'],
    }
    const extensions = extMap[kind] || []
    if (extensions.some((ext) => lower.endsWith(ext))) return true
    const looksLikePath =
        token.includes('/') ||
        token.includes('\\') ||
        token.startsWith('./') ||
        token.startsWith('../') ||
        token.startsWith('~/') ||
        token.startsWith('~\\') ||
        token.startsWith('.')
    return looksLikePath
}

module.exports = {
    tokenizeCommandLine,
    parseCommandLine,
    parseCommandTokens,
    classifyCommand,
    formatTitle,
}
