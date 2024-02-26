const code = `<div class="test"><span>abc</span></div>`;

/**
 * syntax
 *   html       = '<' identifier props '>' html '</' identifier '>'
 *   props      = '' | identifier '=' '"' identifier '"' props
 * 
 *   identifier = [a-z]+
 *   whitespace = ' ' | '\n'
 * 
 * example
 *   <div class="test"><span>abc</span></div>
 */

const parser = code => {
  let pos;
  let end;
  let token;
  let tokenKind = {
    leftBracket: '<',
    rightBracket: '>',
    leftBracketSlash: '</',
    identifier: '(identifier)',
    equal: '=',
    quote: '"',
    eof: '(eof)',
  };

  const parse = () => {
    pos = 0;
    end = code.length;

    nextToken();  // <
    assert(tokenKind.leftBracket);

    const html = parseHtml();

    nextToken();  // eof
    assert(tokenKind.eof);

    return html;
  };

  const parseHtml = () => {
    nextToken();  // identifier
    assert(tokenKind.identifier);
    const tagName = token;

    // props
    nextToken();  // identifier | >
    let props;
    if (token.kind === tokenKind.rightBracket) {  // >
      props = [];
    } else {
      assert(tokenKind.identifier);
      props = parseProps();  // identifier
      assert(tokenKind.rightBracket);  // >
    }

    // child
    nextToken();  // identifier | <
    let child;
    if (token.kind === tokenKind.identifier) {  // identifier
      child = token;
    } else {  // <
      assert(tokenKind.leftBracket);
      child = parseHtml();
      assert(tokenKind.rightBracket);  // >
    }

    nextToken();  // </
    assert(tokenKind.leftBracketSlash);

    nextToken();  // identifier
    assert(tokenKind.identifier);
    const rightTagName = token;

    nextToken();  // >
    assert(tokenKind.rightBracket);

    return {
      tagName,
      props,
      child,
      rightTagName,
    };
  };

  const parseProps = () => {  // identifier
    const props = [];

    while (true) {  // identifier | >
      if (token.kind === tokenKind.rightBracket) {  // >
        break;
      }

      assert(tokenKind.identifier);
      const propName = token;

      nextToken();  // =
      assert(tokenKind.equal);

      nextToken();  // "
      assert(tokenKind.quote);

      nextToken();  // identifier
      assert(tokenKind.identifier);
      const propValue = token;

      props.push({
        name: propName,
        value: propValue,
      });

      nextToken();  // "
      assert(tokenKind.quote);

      nextToken();  // identifier | >
    }

    return props;
  };

  const assert = (tokenKind) => {
    if (token.kind === tokenKind) {
      return;
    }

    const msg = `unexpected token: ${JSON.stringify(token)}`;
    throw new Error(msg);
  };

  const nextToken = () => {
    while (true) {
      if (pos >= end) {
        return token = createToken(tokenKind.eof, pos, pos, null);
      }

      let ch = code.charAt(pos);
      switch (ch) {
        case '<':
          if (code.charAt(pos + 1) === '/') {
            return token = createToken(tokenKind.leftBracketSlash, pos, pos += 2, '</');
          }
          return token = createToken(tokenKind.leftBracket, pos, ++pos, ch);

        case '>':
          return token = createToken(tokenKind.rightBracket, pos, ++pos, ch);

        case '"':
          return token = createToken(tokenKind.quote, pos, ++pos, ch);

        case '=':
          return token = createToken(tokenKind.equal, pos, ++pos, ch);

        case ' ':
        case '\n':
          ++pos;
          continue;

        default:
          return token = scanIdentifier();

      }
    }
  };

  const scanIdentifier = () => {
    const identifierStart = pos;

    while (true) {
      if (pos >= end) {
        break;
      }

      const ch = code.charAt(pos);
      if (/[a-z]/.test(ch)) {
        ++pos;
        continue;
      }

      break;
    }

    const identifer = code.slice(identifierStart, pos);
    return token = createToken(tokenKind.identifier, identifierStart, pos, identifer);
  };

  const createToken = (tokenKind, pos, end, sourceCode) => {
    return {
      kind: tokenKind,
      pos,
      end,
      value: sourceCode,
    };
  };

  return parse();
};

debugger
const html = parser(code);
debugger