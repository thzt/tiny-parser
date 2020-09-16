/// <reference path="parser.ts" />

namespace Parser {
  const main = () => {
    const ast = parse(`
      <div id="tiny" class="parser">
        <span>
          abc
        </span>
      </div>
    `);

    debugger;
  };

  main();
}
