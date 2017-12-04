import { NodeInterface }  from '../model';

export function name(node: NodeInterface, nameOptions: Array<string>) {

    for (let prop of nameOptions) {
        if (
            typeof(node['props'][prop]) !== 'undefined' && node['props'][prop] != null
        ) {
            return node['props'][prop]
        }
    }
    
    for (let prop of nameOptions) {
        if (
            typeof(node[prop]) !== 'undefined' && node[prop] != null
        ) {
            return node[prop]
        }
    }

    return '?';
}
