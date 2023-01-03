import * as ts from 'typescript';

export function visitDecorator(name: string | string[], visitor: ts.Visitor, context: ts.TransformationContext) {
  const names = !Array.isArray(name) ? [name] : name;
  const visit: ts.Visitor = node => {
    const src = node.getSourceFile();
    if (ts.isDecorator(node) && names.includes(node.getChildAt(1, src).getFirstToken()!.getText(src))) {
      return ts.visitEachChild(node, visitor, context);
    }
    return ts.visitEachChild(node, visit, context);
  };
  return visit;
}
