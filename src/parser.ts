export type CommandKind =
    | 'python'
    | 'r'
    | 'bash'
    | 'node'
    | 'pytest'
    | 'make'
    | 'other'

export type TargetType = 'file' | 'module' | 'target' | 'command' | 'none'

export interface ParseResult {
    kind: CommandKind
    command: string | null
    argv: string[]
    rawTokens: string[]
    primaryTarget: string | null
    targetType: TargetType
    title: string
}

export interface TokenizeOptions {
    keepEmpty?: boolean
}

export function tokenizeCommandLine(
    input: string,
    options: TokenizeOptions = {}
): string[] {
    const tokens: string[] = []
    let current = ''
    let state: 'normal' | 'single' | 'double' = 'normal'

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

export function parseCommandLine(commandLine: string): ParseResult {
    const rawTokens = tokenizeCommandLine(commandLine)
    const argv = stripWrappers(rawTokens)

    if (argv.length === 0) {
        return {
            kind: 'other',
            command: null,
            argv,
            rawTokens,
            primaryTarget: null,
            targetType: 'none',
            title: 'Terminal',
        }
    }

    const command = argv[0]
    const args = argv.slice(1)
    const commandBase = normalizeCommandName(command)

    let kind = classifyCommand(commandBase)
    let targetInfo = { primaryTarget: null as string | null, targetType: 'none' as TargetType }

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
            targetInfo = {
                primaryTarget: basenameLike(nodeInfo.script),
                targetType: 'file',
            }
        }
    } else if (kind === 'r') {
        const rInfo = parseRArgs(commandBase, args)
        if (rInfo.script) {
            targetInfo = {
                primaryTarget: basenameLike(rInfo.script),
                targetType: 'file',
            }
        }
    } else if (kind === 'bash') {
        const bashInfo = parseShellArgs(args)
        if (bashInfo.script) {
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
        rawTokens,
        primaryTarget: targetInfo.primaryTarget,
        targetType: targetInfo.targetType,
        title,
    }
}

export function classifyCommand(commandBase: string): CommandKind {
    if (isPythonCommand(commandBase)) return 'python'
    if (isPytestCommand(commandBase)) return 'pytest'
    if (isNodeCommand(commandBase)) return 'node'
    if (isRCommand(commandBase)) return 'r'
    if (isShellCommand(commandBase)) return 'bash'
    if (isMakeCommand(commandBase)) return 'make'
    return 'other'
}

export function formatTitle(
    kind: CommandKind,
    primaryTarget: string | null,
    commandBase: string
): string {
    const labelMap: Record<CommandKind, string> = {
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

function stripWrappers(tokens: string[]): string[] {
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

function normalizeCommandName(command: string): string {
    const base = basenameLike(command)
    const lower = base.toLowerCase()
    if (lower.endsWith('.exe')) return lower.slice(0, -4)
    return lower
}

function basenameLike(value: string): string {
    const trimmed = value.replace(/[\\/]+$/g, '')
    const parts = trimmed.split(/[\\/]/)
    return parts[parts.length - 1] || value
}

function isEnvAssignment(token: string): boolean {
    return /^[A-Za-z_][A-Za-z0-9_]*=.*/.test(token)
}

function isPythonCommand(commandBase: string): boolean {
    return (
        commandBase === 'python' ||
        commandBase.startsWith('python3') ||
        commandBase === 'py'
    )
}

function isPytestCommand(commandBase: string): boolean {
    return commandBase === 'pytest' || commandBase === 'py.test'
}

function isPytestModule(moduleName: string): boolean {
    const normalized = moduleName.toLowerCase()
    return normalized === 'pytest' || normalized === 'py.test'
}

function isNodeCommand(commandBase: string): boolean {
    return commandBase === 'node' || commandBase === 'nodejs'
}

function isRCommand(commandBase: string): boolean {
    return commandBase === 'r' || commandBase === 'rscript'
}

function isShellCommand(commandBase: string): boolean {
    return (
        commandBase === 'bash' ||
        commandBase === 'sh' ||
        commandBase === 'zsh' ||
        commandBase === 'fish'
    )
}

function isMakeCommand(commandBase: string): boolean {
    return commandBase === 'make' || commandBase === 'gmake'
}

function parsePythonArgs(args: string[]): {
    mode: 'module' | 'script' | 'code' | 'interactive'
    module?: string
    script?: string
    remainingArgs: string[]
} {
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
        return {
            mode: 'script',
            script: token,
            remainingArgs: args.slice(i + 1),
        }
    }

    return { mode: 'interactive', remainingArgs: [] }
}

function parseNodeArgs(args: string[]): {
    mode: 'script' | 'eval' | 'repl'
    script?: string
} {
    for (let i = 0; i < args.length; i += 1) {
        const token = args[i]
        if (token === '-e' || token === '-p') {
            return { mode: 'eval' }
        }
        if (token.startsWith('-')) {
            continue
        }
        return { mode: 'script', script: token }
    }

    return { mode: 'repl' }
}

function parseRArgs(commandBase: string, args: string[]): { script?: string } {
    if (commandBase === 'rscript') {
        for (const token of args) {
            if (!token.startsWith('-')) {
                return { script: token }
            }
        }
        return {}
    }

    for (let i = 0; i < args.length; i += 1) {
        const token = args[i]
        if ((token === '-f' || token === '--file') && i + 1 < args.length) {
            return { script: args[i + 1] }
        }
    }
    return {}
}

function parseShellArgs(args: string[]): { script?: string } {
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

function parsePytestArgs(args: string[]): { primaryTarget: string | null; targetType: TargetType } {
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

function pytestOptionTakesValue(option: string): boolean {
    return (
        option === '-k' ||
        option === '-m' ||
        option === '-c' ||
        option === '--confcutdir' ||
        option === '--rootdir' ||
        option === '--maxfail'
    )
}

function parseMakeArgs(args: string[]): { primaryTarget: string | null; targetType: TargetType } {
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

function makeOptionTakesValue(option: string): boolean {
    return option === '-f' || option === '-C' || option === '-j'
}
