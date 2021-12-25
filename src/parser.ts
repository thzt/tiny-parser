namespace Parser {
  enum TokenKind {
    LeftParenthesis,
    RightParenthesis,
    Number,
    Plus,
    Multiple,
    EndOfFile,
  }
  interface Token {
    kind: TokenKind;
    start: number;
    end: number;
    text: string;
  }

  let sourceText: string;

  let pos: number;
  let length: number;

  let token: Token;

  /**
   * 四则运算表达式的文法（只包含加法和乘法）
      Expr -> Term | Term + Expr
      Term -> Factor | Factor * Term
      Factor -> NUMBER | ( Expr )
   */
  export function parse(code: string) {
    sourceText = code;
    pos = 0;
    length = sourceText.length;

    nextToken();
    const expr = parseExpr();
    assert(TokenKind.EndOfFile);

    return expr;
  }

  // Expr -> Term | Term + Expr
  function parseExpr() {
    const term = parseTerm();
    if (token.kind === TokenKind.Plus) {
      nextToken();
      const expr = parseExpr();
      return {
        left: term,
        right: expr,
        operator: '+',
      }
    }

    return term;
  }

  // Term -> Factor | Factor * Term
  function parseTerm() {
    const factor = parseFactor();
    if (token.kind === TokenKind.Multiple) {
      nextToken();
      const term = parseTerm();
      return {
        left: factor,
        right: term,
        operator: '*',
      };
    }

    return factor;
  }

  // Factor -> NUMBER | ( Expr )
  function parseFactor() {
    if (token.kind === TokenKind.Number) {
      const num = token;
      nextToken();
      return num;
    }

    if (token.kind === TokenKind.LeftParenthesis) {
      nextToken();
      const expr = parseExpr();
      assert(TokenKind.RightParenthesis);
      nextToken();
      return expr;
    }
  }

  // 词法分析器
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

  function createToken(kind: TokenKind, start, end, text): Token {
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
}
