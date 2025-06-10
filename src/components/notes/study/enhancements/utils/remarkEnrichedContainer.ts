
import { visit } from 'unist-util-visit';

/**
 * Custom remark plugin to transform :::enriched directives into styled div elements
 */
export function remarkEnrichedContainer() {
  return (tree: any) => {
    visit(tree, (node: any) => {
      if (
        node.type === 'containerDirective' &&
        node.name === 'enriched'
      ) {
        const data = node.data || (node.data = {});
        data.hName = 'div';
        data.hProperties = {
          className: 'enriched-content-section'
        };
      }
    });
  };
}
