import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';

const files = [];
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts')) files.push(file);
  }
}
walk('backend/src');
const provider = /^(express|pg|sharp)$|^@clerk\/|^@supabase\//;
for (const file of files) {
  const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  for (const node of source.statements) {
    if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier)) continue;
    const dependency = node.moduleSpecifier.text;
    const typeOnly = node.importClause?.isTypeOnly;
    if (file.endsWith('/routes.ts')) {
      const allowed = dependency === 'express' || dependency.startsWith('../http/') || (typeOnly && dependency === './controller.js');
      if (!allowed) throw Error(`${file}: routers may map controllers/middleware, not import ${dependency}`);
    }
    if (file.endsWith('/controller.ts') && (provider.test(dependency) && dependency !== 'express' || /\/(service|repository|storage|identity|images)\.js$/.test(dependency))) {
      throw Error(`${file}: controllers must call API interfaces, not ${dependency}`);
    }
    if (file.endsWith('/service.ts') && (provider.test(dependency) || !typeOnly && /\/(repository|storage|identity|images)\.js$/.test(dependency))) {
      throw Error(`${file}: service implementations must use provider/persistence interfaces, not ${dependency}`);
    }
    if (file.endsWith('/api.ts') && (!typeOnly || provider.test(dependency))) {
      throw Error(`${file}: API contracts must be independent of runtime providers and HTTP types`);
    }
    if (file.endsWith('/repository.ts') && /\/(routes|controller|service)\.js$/.test(dependency)) {
      throw Error(`${file}: persistence must not depend on presentation/application implementations`);
    }
  }
  if (file.endsWith('/routes.ts')) {
    function visit(node) {
      if (ts.isPropertyAccessExpression(node) && ['body', 'params', 'query', 'status', 'json', 'send'].includes(node.name.text)) {
        throw Error(`${file}: HTTP extraction/response handling belongs in controllers (${node.name.text})`);
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
}
console.log('Backend boundaries verified: router -> controller -> API/service implementation -> persistence.');
