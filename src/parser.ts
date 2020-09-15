namespace Parser {
  let sourceText: string;

  let pos: number;
  let end: number;

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
  export function parse(code) {
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

  function createNode(kind: SyntaxKind, pos, end, value) {
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

  enum SyntaxKind {
    LeftBracket,
    RightBracket,
    Identifier,
    Unknown,
    EndOfFile,
  }
}
