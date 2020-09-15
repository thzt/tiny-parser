var Parser;
(function (Parser) {
    let sourceText;
    let pos;
    let end;
    let token;
    /**
     * syntax
     *   list       = '(' elements ')'
     *   elements   = element | element elements
     *   element    = identifier | list
     *
     *   identifier = [a-z]+
     *   whitespace = ' ' | '\n'
     *
     * example
     *   (ab cd (ee ff gg))
     */
    function parse(code) {
        sourceText = code;
        pos = 0;
        end = sourceText.length;
        nextToken();
        assert(SyntaxKind.LeftBracket);
        const body = parseList();
        nextToken();
        assert(SyntaxKind.EndOfFile);
        return body;
    }
    Parser.parse = parse;
    function parseList() {
        const elements = parseElements();
        const rb = nextToken();
        return elements;
    }
    function parseElements() {
        const elements = [];
        while (true) {
            nextToken();
            if (isElementsTeminate()) {
                break;
            }
            const element = parseElement();
            elements.push(element);
        }
        return elements;
    }
    function parseElement() {
        if (token.kind === SyntaxKind.LeftBracket) {
            return parseList();
        }
        console.assert(token.kind === SyntaxKind.Identifier);
        return token;
    }
    function nextToken() {
        while (true) {
            if (pos >= end) {
                return token = createNode(SyntaxKind.EndOfFile, pos, pos, null);
            }
            let ch = sourceText.charAt(pos);
            switch (ch) {
                case '(':
                    return token = createNode(SyntaxKind.LeftBracket, pos++, pos, '(');
                case ')':
                    return token = createNode(SyntaxKind.RightBracket, pos++, pos, ')');
                case ' ':
                case '\n':
                    pos++;
                    continue;
                default:
                    if (isIdentifierStart(ch)) {
                        return token = scanIdentifier();
                    }
                    return token = createNode(SyntaxKind.RightBracket, pos++, pos, ch);
            }
        }
    }
    function isIdentifierStart(ch) {
        return ch >= 'a' && ch <= 'z';
    }
    function isIdentifierPart(ch) {
        return isIdentifierStart(ch);
    }
    function scanIdentifier() {
        const identifierStart = pos;
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
        const value = sourceText.slice(identifierStart, pos);
        return createNode(SyntaxKind.Identifier, pos, end, value);
    }
    function isElementsTeminate() {
        switch (token.kind) {
            case SyntaxKind.EndOfFile:
            case SyntaxKind.RightBracket:
                return true;
            default:
                return false;
        }
    }
    function createNode(kind, pos, end, value) {
        return {
            kind,
            kindName: Object.values(SyntaxKind)[kind],
            pos,
            end,
            value,
        };
    }
    function assert(kind) {
        if (token.kind === kind) {
            return;
        }
        const message = `unexpected token: ${JSON.stringify(token)}`;
        throw new Error(message);
    }
    let SyntaxKind;
    (function (SyntaxKind) {
        SyntaxKind[SyntaxKind["LeftBracket"] = 0] = "LeftBracket";
        SyntaxKind[SyntaxKind["RightBracket"] = 1] = "RightBracket";
        SyntaxKind[SyntaxKind["Identifier"] = 2] = "Identifier";
        SyntaxKind[SyntaxKind["Unknown"] = 3] = "Unknown";
        SyntaxKind[SyntaxKind["EndOfFile"] = 4] = "EndOfFile";
    })(SyntaxKind || (SyntaxKind = {}));
})(Parser || (Parser = {}));
/// <reference path="parser.ts" />
var Parser;
(function (Parser) {
    const main = () => {
        const ast = Parser.parse(`
      (ab cd 
        (ee ff gg)
      )
    `);
        debugger;
    };
    main();
})(Parser || (Parser = {}));
//# sourceMappingURL=index.js.map