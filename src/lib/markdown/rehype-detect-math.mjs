function containsKatex(node) {
  if (
    node.type === 'element'
    && Array.isArray(node.properties?.className)
    && node.properties.className.includes('katex')
  ) {
    return true;
  }

  return Array.isArray(node.children) && node.children.some(containsKatex);
}

export function rehypeDetectMath() {
  return (tree, file) => {
    if (!containsKatex(tree)) return;

    file.data.astro ||= {};
    file.data.astro.frontmatter ||= {};
    file.data.astro.frontmatter.math = true;
  };
}
