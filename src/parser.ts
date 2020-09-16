namespace Parser {
  let sourceText: string;

  let pos: number;
  let end: number;

  let token;

  /**
   * syntax
   *   html       = '<' identifier props '>' html '</' identifier '>' | identifier
   *   props      = '' | identifier '=' '"' identifier '"'
   * 
   *   identifier = [a-z]+
   *   whitespace = ' ' | '\n'
   * 
   * example
   *   <div class="test"><span>abc</span></div>
   */
  export function parse(code) {
    sourceText = code;
    pos = 0;
    end = sourceText.length;

    nextToken();  // <
    assert(SyntaxKind.LeftBracket);
    const html = parseHtml();

    nextToken();  // eof
    assert(SyntaxKind.EndOfFile);

    return html;
  }

  function parseHtml() {
    nextToken();  // identifier
    assert(SyntaxKind.Identifier);
    const tagName = token;

    nextToken();  // identifier or '>'
    const props = parseProps();

    nextToken();  // identifier or '<'
    let child;
    if (token.kind === SyntaxKind.Identifier) {
      child = token;
    } else {
      assert(SyntaxKind.LeftBracket);
      child = parseHtml();
    }

    nextToken();  // </
    assert(SyntaxKind.LeftBracketSlash);

    nextToken();  // identifier
    assert(SyntaxKind.Identifier);
    const rightTagName = token;

    nextToken();  // >
    assert(SyntaxKind.RightBracket);

    return {
      tagName,
      props,
      child,
      rightTagName,
    };
  }

  function parseProps() {
    const props = [];

    while (true) {
      if (token.kind === SyntaxKind.RightBracket) {
        break;
      }
      assert(SyntaxKind.Identifier);
      const propName = token;

      nextToken();  // =
      assert(SyntaxKind.Equal);
      nextToken();  // "
      assert(SyntaxKind.Quote);

      nextToken();  // identifier
      assert(SyntaxKind.Identifier);
      const propValue = token;

      props.push({
        name: propName,
        value: propValue,
      });

      nextToken();  // "
      nextToken();  // identifier or '>'
    }

    return props;
  }

  function nextToken() {
    while (true) {
      if (pos >= end) {
        return token = createNode(SyntaxKind.EndOfFile, pos, pos, null);
      }

      let ch = sourceText.charAt(pos);
      switch (ch) {
        case '<':
          if (sourceText.charAt(pos + 1) === '/') {
            return token = createNode(SyntaxKind.LeftBracketSlash, pos, pos += 2, '</');
          }
          return token = createNode(SyntaxKind.LeftBracket, pos, ++pos, '<');

        case '>':
          return token = createNode(SyntaxKind.RightBracket, pos, ++pos, '>');

        case '=':
          return token = createNode(SyntaxKind.Equal, pos, ++pos, '=');

        case '"':
          return token = createNode(SyntaxKind.Quote, pos, ++pos, '"');

        case ' ':
        case '\n':
          ++pos;
          continue;

        default:
          if (isIdentifierStart(ch)) {
            return token = scanIdentifier();
          }

          return token = createNode(SyntaxKind.RightBracket, pos, ++pos, ch);
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
    ++pos;

    while (true) {
      if (pos >= end) {
        break;
      }
      const ch = sourceText.charAt(pos);
      if (!isIdentifierPart(ch)) {
        break;
      }
      ++pos;
    }

    const value = sourceText.slice(identifierStart, pos);
    return createNode(SyntaxKind.Identifier, identifierStart, pos, value);
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
    LeftBracketSlash,
    Equal,
    Quote,
  }
}
