import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';
function check(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) { check(file); continue; }
    if (!/\.tsx?$/.test(file) || file.endsWith('.test.ts')) continue;
    const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
    for (const node of source.statements) {
      if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier)) continue;
      const dependency = node.moduleSpecifier.text;
      const presentation = /\/(screens|components)\//.test(file) || file.endsWith('/SignInPanel.web.tsx');
      if (presentation && (/\/api\//.test(dependency) || /^@clerk\//.test(dependency))) {
        throw Error(`${file}: presentation must use a model hook, not ${dependency}`);
      }
      if (file.endsWith('/createAppStore.ts') && (!node.importClause?.isTypeOnly && dependency !== 'zustand/vanilla')) {
        throw Error(`${file}: state must depend on typed API contracts, not ${dependency}`);
      }
      if ((file.endsWith('/contracts.ts') || file.endsWith('/signInApi.ts')) && !node.importClause?.isTypeOnly) {
        throw Error(`${file}: contracts must not depend on runtime implementations`);
      }
    }
  }
}
check('frontend/src');
console.log('Frontend boundaries verified: presentation -> model/store -> API contracts -> provider/HTTP adapters.');
