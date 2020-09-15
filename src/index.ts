/// <reference path="parser.ts" />

namespace Parser {
  const main = () => {
    const ast = parse(`
      (ab cd 
        (ee ff gg)
      )
    `);

    debugger;
  };

  main();
}
