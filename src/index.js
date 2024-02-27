const code = `((1 + 2) * 3 + 4) * (5 + 6)`;

/**
 * 不用消除左递归，写一个不是左递归的文法即可
 * 
 * Expr = Term | Term + Expr
 * Term = Factor | Factor * Term
 * Factor = NUMBER | ( Expr )
 * 
 * NUMBER = [0-9]+
 */

const parser = (code) => {
  let pos = 0;
  let end = code.length;

  let token;
  let tokenKind = {
    leftPar: '(',
    rightPar: ')',
    plus: '+',
    mul: '*',
    eof: '(eof)',
    number: '(number)',
  };

  const parse = () => {
    nextToken(); // parse 之前 nextToken，便于在 parse 之前根据 token 类型做不同的事情

    const expr = parseExpr(); // parse 后已经 nextToken 过了，便于后面直接处理
    assert(tokenKind.eof);

    return expr;
  };

  // Expr = Term | Term + Expr
  const parseExpr = () => {
    const term = parseTerm();

    if (token.kind === tokenKind.plus) {
      nextToken(); // parse 都要 nextToken

      const expr = parseExpr();
      return {
        left: term,
        right: expr,
        op: '+',
      }
    }

    return term;
  };

  // Term = Factor | Factor * Term
  const parseTerm = () => {
    const factor = parseFactor();

    if (token.kind === tokenKind.mul) {
      nextToken();  // parse 之前都要 nextToken

      const term = parseTerm();
      return {
        left: factor,
        right: term,
        op: '*',
      };
    }

    return factor;
  };

  // Factor = NUMBER | ( Expr )
  const parseFactor = () => {
    if (token.kind === tokenKind.number) {
      const num = token;
      nextToken();  // 保证退出 parse 时，已经 nextToken 过了（指向下一个 token）
      return num;
    }

    assert(tokenKind.leftPar);
    nextToken();

    const expr = parseExpr();
    assert(tokenKind.rightPar);

    nextToken();  // 解析完再 nextToken 一下，指向下一个 token（便于后面直接处理当前 token）
    return expr;
  };

  const nextToken = () => {
    while (true) {
      if (pos >= end) {
        return token = createToken(tokenKind.eof, pos, pos, null);
      }

      const ch = code.charAt(pos);
      switch (ch) {
        case '(':
          return token = createToken(tokenKind.leftPar, pos, ++pos, ch);
        case ')':
          return token = createToken(tokenKind.rightPar, pos, ++pos, ch);
        case '+':
          return token = createToken(tokenKind.plus, pos, ++pos, ch);
        case '*':
          return token = createToken(tokenKind.mul, pos, ++pos, ch);

        case ' ':
        case '\n':
          ++pos;
          continue;

        default: {
          const start = pos;
          const num = scanNum(start);
          return token = createToken(tokenKind.number, start, pos, num);
        }
      }
    }
  };

  const scanNum = (start) => {
    while (true) {
      const ch = code.charAt(pos);
      if (/[0-9]/.test(ch)) {
        ++pos;
        continue;
      }

      break;
    }

    const num = code.slice(start, pos);
    return num;
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

    throw new Error(`unexpected token kind: ${JSON.stringify(token)}`);
  };

  return parse();
};

debugger
const expr = parser(code);
debugger