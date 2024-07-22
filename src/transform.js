import * as Babel from "babel-standalone";

/* plugins */

function uglifyPlugin() {
  const nameMap = new Map();
  let counter = 0;

  function getName(count) {
    const letters = "abcdefghijklmnopqrstuvwxyz";
    let name = "";

    do {
      name = letters[count % 26] + name;
      count = Math.floor(count / 26);
    } while (count > 0);

    return name;
  }

  const visitor = {
    Identifier(path) {
      const name = path.node.name;

      if (path.scope.hasBinding(name)) {
        if (!nameMap.has(name)) {
          nameMap.set(name, getName(counter++));
        }
        path.node.name = nameMap.get(name);
      }
    },
  };

  return {
    visitor,
  };
}

function addTimerPlugin() {
  const visitor = {
    FunctionDeclaration(path) {
      const { node } = path;
      const functionName = node.id.name;

      const startTimer = {
        type: "ExpressionStatement",
        expression: {
          type: "CallExpression",
          callee: {
            type: "MemberExpression",
            object: { type: "Identifier", name: "console" },
            property: { type: "Identifier", name: "time" },
          },
          arguments: [{ type: "StringLiteral", value: functionName }],
        },
      };

      const endTimer = {
        type: "ExpressionStatement",
        expression: {
          type: "CallExpression",
          callee: {
            type: "MemberExpression",
            object: { type: "Identifier", name: "console" },
            property: { type: "Identifier", name: "timeEnd" },
          },
          arguments: [{ type: "StringLiteral", value: functionName }],
        },
      };

      node.body.body.unshift(startTimer);
      node.body.body.push(endTimer);
    },
  };

  return {
    visitor,
  };
}

function enforceStylePlugin() {
  return {
    visitor: {
      VariableDeclarator(path) {
        const variableName = path.node.id.name;
        if (!/^[a-z][a-zA-Z0-9]*$/.test(variableName)) {
          console.warn(
            `Variable name "${variableName}" does not follow camelCase naming convention.`
          );
        }
      },
      Program: {
        exit(path) {
          const bindings = path.scope.bindings;
          Object.keys(bindings).forEach((name) => {
            if (!bindings[name].referenced) {
              console.warn(
                `Variable "${name}" is declared but its value is never read.`
              );
            }
          });
        },
      },
      FunctionDeclaration(path) {
        const { node } = path;
        const functionName = path.node.id.name;
        if (!/^[a-z][a-zA-Z0-9]*$/.test(functionName)) {
          console.warn(
            `Function name "${functionName}" does not follow camelCase naming convention.`
          );
        }
        if (
          !node.leadingComments ||
          !node.leadingComments.some(
            (comment) => comment.type === "CommentBlock"
          )
        ) {
          console.warn(
            `Function "${node.id.name}" should have a documentation comment.`
          );
        }
      },
    },
  };
}

Babel.registerPlugin("uglifyPlugin", uglifyPlugin);
Babel.registerPlugin("addTimerPlugin", addTimerPlugin);
Babel.registerPlugin("enforceStylePlugin", enforceStylePlugin);

export function transformCode(inputCode, options) {
  let outputCode = inputCode;

  if (options.uglify) {
    outputCode = Babel.transform(outputCode, { plugins: [uglifyPlugin] }).code;
  }

  if (options.addTimer) {
    outputCode = Babel.transform(outputCode, {
      plugins: [addTimerPlugin],
    }).code;
  }

  if (options.enforceStyle) {
    outputCode = Babel.transform(outputCode, {
      plugins: [enforceStylePlugin],
    }).code;
  }

  return outputCode;
}
