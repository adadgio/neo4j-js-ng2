import { NodeInterface }  from '../node-interface';

export function color(node: NodeInterface, colorOptions: Array<string>) {
    const label = node.getFirstLabel()

    if (typeof colorOptions[label] !== 'undefined') {
        return colorOptions[label]
    }

    return '#1E1F24'
}
