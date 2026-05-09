const fs = require('fs');
const path = require('path');
const ts = require('typescript');

/**
 * AI-Friendly Skeleton Generator (TypeScript AST version)
 * Strips implementation details from TypeScript files to save tokens during research.
 * Uses the TypeScript Compiler API for robust AST parsing.
 */

function skeletonize(content, filename) {
  const sourceFile = ts.createSourceFile(
    filename,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  const skeleton = [];

  for (const node of sourceFile.statements) {
    if (ts.isImportDeclaration(node)) {
      skeleton.push(node.getText(sourceFile));
    } else if (ts.isExportDeclaration(node) || ts.isExportAssignment(node)) {
      skeleton.push(node.getText(sourceFile));
    } else if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
      skeleton.push(node.getText(sourceFile));
    } else if (ts.isClassDeclaration(node)) {
      const isExported = node.modifiers && node.modifiers.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
      if (isExported) {
        let modifiers = node.modifiers ? node.modifiers.map(m => m.getText(sourceFile)).join(' ') + ' ' : '';
        let className = node.name ? node.name.text : 'default';
        
        let extendsClause = '';
        if (node.heritageClauses) {
          extendsClause = ' ' + node.heritageClauses.map(h => h.getText(sourceFile)).join(' ');
        }

        let classStr = `${modifiers}class ${className}${extendsClause} {\n`;
        
        for (const member of node.members) {
          if (ts.isMethodDeclaration(member)) {
            let memberModifiers = member.modifiers ? member.modifiers.map(m => m.getText(sourceFile)).join(' ') + ' ' : '';
            let name = member.name ? member.name.getText(sourceFile) : '';
            classStr += `  ${memberModifiers}${name}() { ... }\n`;
          } else if (ts.isPropertyDeclaration(member)) {
             classStr += `  ${member.getText(sourceFile)}\n`;
          } else if (ts.isConstructorDeclaration(member)) {
             classStr += `  constructor() { ... }\n`;
          }
        }
        classStr += '}';
        skeleton.push(classStr);
      }
    } else if (ts.isFunctionDeclaration(node)) {
      const isExported = node.modifiers && node.modifiers.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
      if (isExported) {
        let modifiers = node.modifiers ? node.modifiers.map(m => m.getText(sourceFile)).join(' ') + ' ' : '';
        let name = node.name ? node.name.text : 'default';
        // Get function parameters and return type if any
        let paramsAndReturnType = node.getText(sourceFile).split('{')[0].trim();
        // Fallback to basic reconstruction if splitting fails
        if (!paramsAndReturnType) {
            paramsAndReturnType = `${modifiers}function ${name}()`;
        }
        skeleton.push(`${paramsAndReturnType} { ... }`);
      }
    } else if (ts.isVariableStatement(node)) {
      const isExported = node.modifiers && node.modifiers.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
      if (isExported) {
        const text = node.getText(sourceFile);
        if (text.includes('=')) {
           skeleton.push(text.split('=')[0].trim() + ' = { ... };');
        } else {
           skeleton.push(text);
        }
      }
    }
  }

  return skeleton.join('\n\n');
}

const target = process.argv[2];
if (!target) {
  console.error('Usage: node generate-skeleton.js <file_or_dir>');
  process.exit(1);
}

const fullPath = path.resolve(target);
if (!fs.existsSync(fullPath)) {
    console.error(`File or directory not found: ${fullPath}`);
    process.exit(1);
}

function processPath(currentPath) {
  if (fs.statSync(currentPath).isDirectory()) {
    const items = fs.readdirSync(currentPath);
    for (const item of items) {
      const itemPath = path.join(currentPath, item);
      if (fs.statSync(itemPath).isDirectory()) {
        processPath(itemPath);
      } else if (itemPath.endsWith('.ts') || itemPath.endsWith('.tsx')) {
        console.log(`\n--- [ ${itemPath.replace(path.resolve('.'), '')} ] ---`);
        console.log(skeletonize(fs.readFileSync(itemPath, 'utf-8'), itemPath));
      }
    }
  } else {
    console.log(`\n--- [ ${currentPath.replace(path.resolve('.'), '')} ] ---`);
    console.log(skeletonize(fs.readFileSync(currentPath, 'utf-8'), path.basename(currentPath)));
  }
}

processPath(fullPath);
