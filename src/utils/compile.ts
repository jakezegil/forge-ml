import ts from "typescript";
import fs from "fs";
import path from "path";

// Function to compile TypeScript code
function compileTypeScriptModule(tsCode: string, target: string) {
  const result = ts.transpileModule(tsCode, {
    compilerOptions: { module: ts.ModuleKind.ESNext, declaration: true },
  });

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, result.outputText);
}

export default compileTypeScriptModule;