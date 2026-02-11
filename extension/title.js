'use strict'

const MAX_TITLE_LENGTH = 120
const CONTROL_CHARS = /[\x00-\x1F\x7F-\x9F]/g
const BIDI_CHARS = /[\u202A-\u202E\u2066-\u2069]/g
const WHITESPACE = /\s+/g

function sanitizeTitle(input) {
    if (!input) return ''
    let value = String(input)
    value = value.replace(CONTROL_CHARS, '')
    value = value.replace(BIDI_CHARS, '')
    value = value.replace(WHITESPACE, ' ')
    value = value.trim()
    if (!value) return ''
    if (value.length <= MAX_TITLE_LENGTH) return value
    return value.slice(0, MAX_TITLE_LENGTH)
}

module.exports = {
    sanitizeTitle,
    MAX_TITLE_LENGTH,
}
