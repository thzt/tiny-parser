const code = `<div class="test"><span>abc</span></div>`;

/**
 * html = < identifier props > html </ identifier>
 * props = identifier = " identifier " props | ''
 * 
 * whitespace = ' ' | '\n'
 * identifer = [a-z]+
 */

const parser = (code) => {
  let pos = 0;
  let end = code.length;

  let token;

  let tokenKind = {
    identifier: '(identifier)',
    eof: '(eof)',
    leftBracket: '<',
    rightBracket: '>',
    leftBracketSlash: '</',
    equal: '=',
    quote: '"',
  };

  const parse = () => {
    nextToken(); // 执行其他 parse 之前先 nextToken，根据 token 决定接下来的行为
    assert(tokenKind.leftBracket);

    const html = parseHtml(); // parse 返回之前已经调用了 nextToken，便于返回后直接判断
    assert(tokenKind.eof);

    return html;
  };

  // html = < identifier props > html </ identifier>
  const parseHtml = () => {
    assert(tokenKind.leftBracket);

    nextToken();
    assert(tokenKind.identifier);
    const tagName = token;
    nextToken(); // 根据 token 决定下一步行动

    // props
    const props = parseProps();  // token 可能是 identifier 或者 >
    assert(tokenKind.rightBracket);

    nextToken(); // 准备后续处理

    // child
    let child;
    if (token.kind === tokenKind.identifier) {
      child = token;
      nextToken(); // 处理完当前 token，退出前定位到下一个 token
    } else {
      assert(tokenKind.leftBracket); // 符合进入 parse 的条件（token 为第一个字符），不用继续 nextToken 了
      child = parseHtml();
    }
    assert(tokenKind.leftBracketSlash);

    nextToken();
    assert(tokenKind.identifier);
    const rightTagName = token;

    nextToken();
    assert(tokenKind.rightBracket);

    nextToken();

    return {
      tagName,
      rightTagName,
      props,
      child,
    };
  };

  // props = identifier = " identifier " props | ''
  const parseProps = () => {
    if (token.kind === tokenKind.rightBracket) {
      const props = [];

      // 已经定位到处理 props 后的 nextToken 了，不用再调用一次
      return props;
    }

    assert(tokenKind.identifier);

    const props = [];
    while (true) {
      if (token.kind === tokenKind.rightBracket) {
        break;
      }

      assert(tokenKind.identifier);
      const propName = token;

      nextToken();
      assert(tokenKind.equal);

      nextToken();
      assert(tokenKind.quote);

      nextToken();
      assert(tokenKind.identifier);
      const propValue = token;

      nextToken();
      assert(tokenKind.quote);

      props.push({
        name: propName,
        value: propValue,
      });

      nextToken();
    }

    // 已经定位到处理 props 后的 nextToken 了，不用再调用一次
    return props;
  };



  const assert = (tokenKind) => {
    if (token.kind === tokenKind) {
      return;
    }

    throw new Error(`unexpected token kind: ${JSON.stringify(token)}`);
  };

  const nextToken = () => {
    while (true) {
      if (pos >= end) {
        return token = createToken(tokenKind.eof, pos, pos, null);
      }

      const ch = code.charAt(pos);
      switch (ch) {
        case ' ':
        case '\n':
          ++pos;
          continue;

        case '>': return token = createToken(tokenKind.rightBracket, pos, ++pos, ch);

        case '=': return token = createToken(tokenKind.equal, pos, ++pos, ch);

        case '"': return token = createToken(tokenKind.quote, pos, ++pos, ch);

        case '<': {
          const nextCh = code.charAt(pos + 1);
          if (nextCh === '/') {
            return token = createToken(tokenKind.leftBracketSlash, pos, pos += 2, '</');
          }
          return token = createToken(tokenKind.leftBracket, pos, ++pos, ch);
        }

        default: {
          const start = pos;
          const identifier = scanIdentifier(start);
          return token = createToken(tokenKind.identifier, start, pos, identifier);
        }
      }
    }
  };

  const scanIdentifier = (start) => {
    const remain = code.slice(start);

    const match = /[a-z]+/.exec(remain);
    if (match == null) {
      throw new Error(`unexpected identifier start: ${remain}`);
    }

    const [identifer] = match;
    pos += identifer.length;
    return identifer;
  };

  const createToken = (tokenKind, pos, end, source) => {
    return {
      kind: tokenKind,
      pos,
      end,
      source,
    };
  };

  return parse();
};

debugger
const html = parser(code);
debugger