/// <reference path="parser.ts" />

namespace Parser {
  const main = () => {
    const ast = parse(`<aa><bb>cc</bb></aa>`);
    debugger;
  };

  main();
}
