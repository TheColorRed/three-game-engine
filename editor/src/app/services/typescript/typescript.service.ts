import { Injectable } from '@angular/core';
import { from, map } from 'rxjs';
import * as ts from 'typescript';
import { SourceFile, TransformerFactory } from 'typescript';
import { File } from '../../classes/file';
import { visitDecorator } from './visitors/decorator.visitor';
import { objectVisitor, replaceObjectPropertyVisitor as propReplace } from './visitors/object.visitor';

export interface ObjectValue {
  value: any;
  type: 'string' | 'boolean' | 'number' | 'function' | 'array';
}

export interface ObjectConfig {
  [keyof: string]: ObjectValue;
}

@Injectable({
  providedIn: 'root',
})
export class TypescriptService {
  /**
   * Loads a typescript file from disk into memory as an AST.
   * @param file The file to load the content from.
   */
  getSource(file: File) {
    return from(file.content()).pipe(
      map(content => ts.createSourceFile(file.path, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS))
    );
  }
  /**
   * Saves a typescript source file in memory to disk.
   * @param file The file to save the content to.
   * @param src The typescript source.
   */
  saveSource(file: File, src: SourceFile) {
    const txt = this.getSourceText(src);
    return file.save(txt);
  }
  /**
   * Sets a decorator configuration value in a file.
   * @param decoratorName The name of the decorator.
   * @param propertyName The property name in the config.
   * @param propertyValue The new property value.
   * @param src The TypeScript source file.
   */
  setDecoratorConfigValue(decoratorName: string, propertyName: string, propertyValue: string, src: SourceFile) {
    function transform(): TransformerFactory<SourceFile> {
      return context => {
        const fact = ts.factory;
        const replaceObjProp = propReplace(propertyName, () => fact.createStringLiteral(propertyValue, true));
        const object = objectVisitor(context, replaceObjProp);
        const decorator = visitDecorator(decoratorName, object, context);
        return node => ts.visitNode(node, decorator);
      };
    }
    return ts.transform(src, [transform()]).transformed[0];
  }

  getDecoratorConfigValues(decoratorName: string, src: SourceFile) {
    const r =
      (src
        .getChildren()
        .find(i => i.kind === ts.SyntaxKind.SyntaxList)
        ?.getChildren()
        .find(i => ts.isClassDeclaration(i))
        ?.getChildren()
        .find(i => i.kind === ts.SyntaxKind.SyntaxList)
        ?.getChildren()
        .find(i => ts.isDecorator(i))
        ?.getChildren()
        .find(i => {
          const text = i.getChildAt(0)?.getText(src);
          return ts.isCallExpression(i) && text === decoratorName;
        })
        ?.getChildren()
        .find(i => i.kind === ts.SyntaxKind.SyntaxList)
        ?.getChildren()
        .find(i => ts.isObjectLiteralExpression(i))
        ?.getChildren()
        .find(i => i.kind === ts.SyntaxKind.SyntaxList)
        ?.getChildren()
        .filter(i => ts.isPropertyAssignment(i))
        .map(i => {
          const children = i.getChildren().filter((v, i) => i !== 1);
          return children.map((c, idx) => {
            let result: string | ObjectValue = c.getText(src);
            // This is the value
            if (idx === 1) return this.getValueObject(c);
            // This is the key
            return result;
          });
        }) as [[string, ObjectValue]]) ?? [];
    return r.reduce<{ [key: string]: any }>((acc, [key, val]) => {
      acc[key] = val;
      return acc;
    }, {}) as ObjectConfig;
  }

  getArrayValues(node: ts.Node) {
    if (ts.isArrayLiteralExpression(node)) {
      return node
        .getChildren()
        .find(i => i.kind === ts.SyntaxKind.SyntaxList)
        ?.getChildren()
        .filter(i => i.kind !== ts.SyntaxKind.CommaToken)
        .map(i => this.getValueObject(i));
    }
    return node.getText(node.getSourceFile());
  }

  getLiteralValue(node: ts.Node) {
    return node.getText(node.getSourceFile());
  }

  getValueObject(node: ts.Node): ObjectValue {
    const result = node.getText(node.getSourceFile());
    if (ts.isStringLiteral(node)) {
      return {
        value: result.replace(/^("|')|("|')$/g, ''),
        type: 'string',
      };
    } else if (ts.isNumericLiteral(node)) return { value: this.getLiteralValue(node), type: 'number' };
    else if (node.kind === ts.SyntaxKind.BooleanKeyword) return { value: this.getLiteralValue(node), type: 'boolean' };
    else if (ts.isArrayLiteralExpression(node)) return { value: this.getArrayValues(node), type: 'array' };
    // return { value: result, type: 'array' };
    else if (ts.isFunctionExpression(node)) return { value: result, type: 'function' };
    else return { value: result, type: 'string' };
  }

  getSourceText(src: SourceFile) {
    const printer = ts.createPrinter();
    const r = printer.printFile(src);
    return r;
  }
}
