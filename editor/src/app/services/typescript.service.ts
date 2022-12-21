import { Injectable } from '@angular/core';
import { from, map } from 'rxjs';
import * as ts from 'typescript';
import { Decorator, HasDecorators, Node, SourceFile, SyntaxKind } from 'typescript';
import { File } from '../classes/file';

@Injectable({
  providedIn: 'root',
})
export class TypescriptService {
  getSource(file: File) {
    return from(file.content()).pipe(map(content => ts.createSourceFile(file.path, content, ts.ScriptTarget.Latest)));
  }

  getClassDecorator(name: string, src: SourceFile) {
    return src
      .getChildren(src)
      .find(i => i.kind === SyntaxKind.SyntaxList)
      ?.getChildren(src)
      .filter(i => i.kind === SyntaxKind.ClassDeclaration)
      .filter((i): i is HasDecorators => ts.canHaveDecorators(i))
      .map(i => ts.getDecorators(i))
      .flat()
      .find(
        i =>
          i?.kind === SyntaxKind.Decorator &&
          i
            .getChildren(src)
            .find(i => i.kind === SyntaxKind.CallExpression)
            ?.getChildren(src)
            .some(i => i.getText(src) === name)
      );
  }

  getDecoratorParam(dec: Decorator, index: number, src: SourceFile) {
    return dec
      .getChildren(src)
      .find(i => i.kind === SyntaxKind.CallExpression)
      ?.getChildren(src)
      .find(i => i.kind === SyntaxKind.SyntaxList)
      ?.getChildren(src)
      .filter(i => i.kind !== SyntaxKind.CommaToken)[index];
  }

  getObjectProp(obj: Node, name: string, src: SourceFile) {
    return obj
      .getChildren(src)
      .find(i => ![SyntaxKind.OpenBraceToken, SyntaxKind.CloseBraceToken].includes(i.kind))
      ?.getChildren(src)
      .filter(i => i.kind !== SyntaxKind.CommaToken)
      .find(i => i.getChildren(src).some(j => j.getText(src) === name));
  }

  setObjectPropValue(prop: Node, value: string, src: SourceFile) {
    const i = prop.getChildren()[2];
    const span = ts.createTextSpan(i.pos, i.end - i.pos);
    const range = ts.createTextChangeRange(span, value.length);
    console.log('New Value', value);
    console.log(i);
    console.log(span, range);
    src = src.update(value, range);
    return src;
  }
}
