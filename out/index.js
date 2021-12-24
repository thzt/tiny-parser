var Parser;
(function (Parser) {
    let TokenKind;
    (function (TokenKind) {
        TokenKind[TokenKind["LeftParenthesis"] = 0] = "LeftParenthesis";
        TokenKind[TokenKind["RightParenthesis"] = 1] = "RightParenthesis";
        TokenKind[TokenKind["Number"] = 2] = "Number";
        TokenKind[TokenKind["Plus"] = 3] = "Plus";
        TokenKind[TokenKind["Multiple"] = 4] = "Multiple";
        TokenKind[TokenKind["EndOfFile"] = 5] = "EndOfFile";
    })(TokenKind || (TokenKind = {}));
    let sourceText;
    let pos;
    let length;
    let token;
    /**
      四则运算的文法（只包含 加法 和 乘法）
        Expr   -> Expr + Term | Term
        Term   -> Term * Factor | Factor
        Factor -> NUMBER | ( Expr )
   
      消除左递归
        Expr  -> Term Expr'
        Expr' -> + Term Expr' | ε
        
        Term  -> Factor Term'
        Term' -> * Factor Term' | ε
        
        Factor  -> NUMBER | ( Expr )
   
      Ref: https://zhuanlan.zhihu.com/p/208906640
     */
    function parse(code) {
        sourceText = code;
        pos = 0;
        length = sourceText.length;
        nextToken();
        const expr = parseExpr();
        assert(TokenKind.EndOfFile);
        return expr;
    }
    Parser.parse = parse;
    // Expr  -> Term Expr'
    function parseExpr() {
        const term = parseTerm();
        const exprPlus = parseExprPlus(term);
        return exprPlus;
    }
    // Expr' -> + Term Expr' | ε
    function parseExprPlus(term) {
        switch (token.kind) {
            case TokenKind.Plus: {
                nextToken();
                const rightTerm = parseTerm();
                const exprPlus = parseExprPlus(rightTerm);
                return {
                    left: term,
                    operator: '+',
                    right: exprPlus,
                };
            }
            default: {
                return term;
            }
        }
    }
    // Term  -> Factor Term'
    function parseTerm() {
        const factor = parseFactor();
        const termPlus = parseTermPlus(factor);
        return termPlus;
    }
    // Term' -> * Factor Term' | ε
    function parseTermPlus(factor) {
        switch (token.kind) {
            case TokenKind.Multiple: {
                nextToken();
                const rightFactor = parseFactor();
                const termPlus = parseTermPlus(rightFactor);
                return {
                    left: factor,
                    operator: '*',
                    right: termPlus,
                };
            }
            default: {
                return factor;
            }
        }
    }
    // Factor  -> NUMBER | ( Expr )
    function parseFactor() {
        switch (token.kind) {
            case TokenKind.Number: {
                const num = token;
                nextToken();
                return num;
            }
            case TokenKind.LeftParenthesis: {
                nextToken();
                const expr = parseExpr();
                assert(TokenKind.RightParenthesis);
                nextToken();
                return expr;
            }
            default: {
                debugger;
                throw new Error('parseFactor error');
            }
        }
    }
    function nextToken() {
        while (true) {
            if (pos >= length) {
                return token = createToken(TokenKind.EndOfFile, pos, pos, null);
            }
            const ch = sourceText.charAt(pos);
            switch (ch) {
                case '(':
                    return token = createToken(TokenKind.LeftParenthesis, pos, ++pos, ch);
                case ')':
                    return token = createToken(TokenKind.RightParenthesis, pos, ++pos, ch);
                case '+':
                    return token = createToken(TokenKind.Plus, pos, ++pos, ch);
                case '*':
                    return token = createToken(TokenKind.Multiple, pos, ++pos, ch);
                case ' ':
                case '\n':
                    ++pos;
                    continue;
                default:
                    if (isNumberStart(ch)) {
                        const end = scanNumber(sourceText, pos, length);
                        const num = sourceText.slice(pos, end);
                        return token = createToken(TokenKind.Number, pos, (pos = end), num);
                    }
            }
        }
    }
    function scanNumber(sourceCode, pos, length) {
        ++pos;
        while (true) {
            if (pos >= length) {
                break;
            }
            const ch = sourceCode.charAt(pos);
            if (!isNumberPart(ch)) {
                break;
            }
            ++pos;
        }
        return pos;
    }
    function isNumberStart(ch) {
        return ch >= '1' && ch <= '9';
    }
    function isNumberPart(ch) {
        return ch >= '0' && ch <= '9';
    }
    function createToken(kind, start, end, text) {
        return {
            kind,
            start,
            end,
            text,
        };
    }
    function assert(kind) {
        if (token.kind === kind) {
            return;
        }
        debugger;
        const message = `unexpected token: ${JSON.stringify(token)}`;
        throw new Error(message);
    }
})(Parser || (Parser = {}));
/// <reference path="parser.ts" />
var Parser;
(function (Parser) {
    const main = () => {
        const ast = Parser.parse(`
      (1 + 2) + (3 + 4) * (5 + 6)
    `);
        debugger;
    };
    main();
})(Parser || (Parser = {}));
//# sourceMappingURL=index.js.map