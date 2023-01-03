import * as ts from 'typescript';

export function objectVisitor(context: ts.TransformationContext, visitor?: ts.Visitor) {
  const visit: ts.Visitor = node => {
    if (ts.isObjectLiteralElement(node) && visitor) return ts.visitEachChild(node, visitor, context);
    return ts.visitEachChild(node, visit, context);
  };
  return visit;
}

export function replaceObjectPropertyVisitor(prop: string, factory: () => ts.Node) {
  let nameNodeValue: ts.Node | undefined = undefined;
  const objectPropVisitor: ts.Visitor = node => {
    const src = node.getSourceFile();
    if (node.getText(src) === prop) {
      const children = node.parent.getChildren();
      nameNodeValue = children[children.indexOf(node) + 2];
    }
    if (typeof nameNodeValue !== 'undefined' && node === nameNodeValue) {
      return ts.visitNode(nameNodeValue, () => factory());
    }
    return node;
  };
  return objectPropVisitor;
}
