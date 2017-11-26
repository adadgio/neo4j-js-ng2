import { NodeInterface }  from '../../../neo4j/model';

export function primary(node: NodeInterface, primaryKey: string) {
    // primaryKey = (
    //     typeof(primaryKey) === 'undefined'
    //     || primaryKey === 'none'
    //     || primaryKey == null
    //     || primaryKey.trim() == ''
    // ) ? 'ID' : primaryKey;

    if (typeof(node[primaryKey]) === 'undefined') {
        primaryKey = 'ID';
        console.warn(`primary-key.ts Node primary "${primaryKey}" key does not exist, ID will be used by default`)
    }

    return node[primaryKey];
}
