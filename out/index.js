var Parser;
(function (Parser) {
    let sourceText;
    let pos;
    let end;
    /**
     * syntax
     *   body = '<' identifier '>' body '</' identifier '>' | identifier
     *   identifier : [a-zA-Z_$][a-zA-Z_$0-9]*
     *   whitespace : ' ' | '\n'
     */
    function parse(code) {
        sourceText = code;
        pos = 0;
        end = sourceText.length;
        const body = parseBody();
        const eof = nextToken();
        console.assert(eof.type !== 'EndOfFile');
        return body;
    }
    Parser.parse = parse;
    function parseBody() {
        const token = nextToken(); // <
        if (token.type !== 'LessThanToken') {
            return token;
        }
        const id1 = nextToken(); // identifier
        nextToken(); // >
        const child = parseBody();
        nextToken(); // </
        const id2 = nextToken(); // identifier
        nextToken(); // >
        return {
            id1,
            id2,
            child,
        };
    }
    function nextToken() {
        while (true) {
            const tokenStart = pos;
            if (pos >= end) {
                const token = {
                    type: 'EndOfFile',
                    pos: pos,
                    end: pos,
                };
                return token;
            }
            let ch = sourceText.charAt(pos);
            switch (ch) {
                case '<':
                    if (sourceText.charAt(pos + 1) === '/') {
                        return {
                            type: 'LessThanSlashToken',
                            value: '</',
                            pos: pos += 2,
                            end: pos,
                        };
                    }
                    return {
                        type: 'LessThanToken',
                        value: '<',
                        pos: pos++,
                        end: pos,
                    };
                case '>':
                    return {
                        type: 'GreaterThanToken',
                        value: '>',
                        pos: pos++,
                        end: pos,
                    };
                case ' ':
                case '\n':
                    pos++;
                    continue;
                default:
                    if (isIdentifierStart(ch)) {
                        return scanIdentifier(tokenStart);
                    }
                    return {
                        type: 'Unknown',
                        pos: pos++,
                        end: pos,
                    };
            }
        }
    }
    function isIdentifierStart(ch) {
        return ch >= 'A' && ch <= 'Z' || ch >= 'a' && ch <= 'z' || ch === '$' || ch === '_';
    }
    function isIdentifierPart(ch) {
        return isIdentifierStart(ch) || idDigit(ch);
    }
    function idDigit(ch) {
        return ch >= '0' && ch <= '9';
    }
    function scanIdentifier(tokenStart) {
        pos++;
        while (true) {
            if (pos >= end) {
                break;
            }
            const ch = sourceText.charAt(pos);
            if (!isIdentifierPart(ch)) {
                break;
            }
            pos++;
        }
        const value = sourceText.slice(tokenStart, pos);
        return {
            type: 'Identifier',
            value,
            pos: tokenStart,
            end: pos,
        };
    }
})(Parser || (Parser = {}));
/// <reference path="parser.ts" />
var Parser;
/// <reference path="parser.ts" />
(function (Parser) {
    const main = () => {
        const ast = Parser.parse(`<aa><bb>cc</bb></aa>`);
        debugger;
    };
    main();
})(Parser || (Parser = {}));
//# sourceMappingURL=index.js.map