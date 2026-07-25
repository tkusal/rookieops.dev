const alertTypes = new Map([
  ['NOTE', 'note'],
  ['TIP', 'tip'],
  ['IMPORTANT', 'important'],
  ['WARNING', 'warning'],
  ['CAUTION', 'caution']
]);

function firstText(node) {
  if (!node) return null;
  if (node.type === 'text') return node;
  if (!Array.isArray(node.children)) return null;
  for (const child of node.children) {
    const found = firstText(child);
    if (found) return found;
  }
  return null;
}

function visit(node) {
  if (!Array.isArray(node.children)) return;

  for (const child of node.children) {
    if (child.type === 'element' && child.tagName === 'blockquote') {
      const firstParagraph = child.children?.find(
        (item) => item.type === 'element' && item.tagName === 'p'
      );
      const textNode = firstText(firstParagraph);
      const match = textNode?.value?.match(/^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/);

      if (match) {
        const type = alertTypes.get(match[1]);
        textNode.value = textNode.value.replace(match[0], '');
        child.properties ||= {};
        child.properties.className = ['markdown-alert', `markdown-alert-${type}`];
        child.properties.dataAlert = type;
        child.children.unshift({
          type: 'element',
          tagName: 'p',
          properties: { className: ['markdown-alert-title'] },
          children: [{ type: 'text', value: match[1][0] + match[1].slice(1).toLowerCase() }]
        });
      }
    }

    visit(child);
  }
}

export function rehypeAlerts() {
  return (tree) => visit(tree);
}
