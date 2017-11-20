import { NodeInterface }  from '../node-interface';

export function name(node: NodeInterface, nameOptions: Array<string>) {
    for (let prop of nameOptions) {

        if (typeof(node['props'][prop]) !== 'undefined' && node['props'][prop] != null && node['props'][prop].trim() !== '') {
            return node['props'][prop]
        }
    }

    return '?'
}
