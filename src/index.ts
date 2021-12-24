/// <reference path="parser.ts" />

namespace Parser {
  const main = () => {
    const ast = parse(`
      (1 + 2) + (3 + 4) * (5 + 6)
    `);

    debugger;
  };

  main();
}
