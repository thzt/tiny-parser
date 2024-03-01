const code = `
(ab cd 
  (ee ff gg)
)
`;

/**
 * list = ( elements )
 * elements = element | element elements
 * element = identifier | list
 * 
 * whitespace = ' ' | '\n'
 * identifier = [a-z]+
 */
const parser = code => {
  let pos = 0;
  const end = code.length;

  let token;
  const tokenKind = {
    leftBracket: '(',
    rightBracket: ')',
    identifier: '(identifier)',
    eof: '(eof)',
  };

  const parse = () => {
    nextToken();  // 启动 parse

    assert(tokenKind.leftBracket);  // 进入 parseList 前，token 为 (。【为 list 产生式右边的第一个字符】
    const list = parseList();

    assert(tokenKind.eof); // 出来后 token 为 eof，表明已经处理完 list 了【根据 list 的文法】
    return list;
  };

  // list = ( elements )
  const parseList = () => {
    nextToken(); // 跳过第一个字符，向后处理

    const elements = parseElements(); // 遇到非终结符，就调用新的 parse 函数
    assert(tokenKind.rightBracket); // 从 parse 退出，表明改终结符已经处理完了，token 指向该终结符之后

    nextToken(); // 跳过终结符 )
    return elements;
  };

  // elements = element | element elements
  const parseElements = () => {
    const elements = [];

    while (true) {
      if (token.kind === tokenKind.rightBracket) {  // 如果 token 已经指向了终结符之后，则停止
        break;
      }

      const element = parseElement(); // token 已经指向了 element 所以不必再次调用 nextToken
      elements.push(element);
    }

    return elements;
  };

  // element = identifier | list
  const parseElement = () => {
    if (token.kind === tokenKind.identifier) {
      const identifier = token;
      nextToken(); // 退出前，token 指向下一个位置
      return identifier;
    }

    assert(tokenKind.leftBracket); // 当前 token 位置已经是 list 的第一个字符了
    const list = parseList(); // parse 退出前已经指向了下一个位置，所以这里不用再次 nextToken 了
    return list;
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

        case '(':
          return token = createToken(tokenKind.leftBracket, pos, ++pos, ch);
        case ')':
          return token = createToken(tokenKind.rightBracket, pos, ++pos, ch);

        default: {
          const start = pos;
          const identifier = scanIdentifier(start);
          return token = createToken(tokenKind.identifier, start, pos, identifier);
        }
      }
    }
  };

  const scanIdentifier = (start) => {
    while (true) {
      const ch = code.charAt(pos);
      if (/[a-z]/.test(ch)) {
        ++pos;
        continue;
      }

      break;
    }

    const identifier = code.slice(start, pos);
    return identifier;
  };

  const createToken = (tokenKind, pos, end, source) => {
    return {
      kind: tokenKind,
      pos,
      end,
      source,
    };
  };

  const assert = (tokenKind) => {
    if (token.kind === tokenKind) {
      return;
    }

    throw new Error(`unexpected token: ${JSON.stringify(token)}`);
  };

  return parse(code);
};

debugger
const list = parser(code);
debugger