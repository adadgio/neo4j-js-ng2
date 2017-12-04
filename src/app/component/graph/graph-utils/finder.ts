import { Node, Link } from '../../../neo4j/model';

const LINK_TYPE = 'LINK_TYPE';
const NODE_TYPE = 'NODE_TYPE';

export class FinderSingleton
{
    type: 'LINK_TYPE'|'NODE_TYPE';
    items: Array<any> = [];

    in(items: Array<Node|Link>): FinderSingleton
    {
        if (items.length === 0) {
            Object.assign(this.items, [])
        } else {
            Object.assign(this.items, items)
        }

        return this;
    }

    private idOf(needle: Node|Link|number): number
    {
        if (typeof needle === 'number') {
            return needle;
        } else {
            return (needle instanceof Node) ? needle.getId() : needle.relationship.getId();
        }
    }
    
    indexOf(needle: Node|Link|number)
    {
        for (let i in this.items) {
            if (this.idOf(this.items[i]) === this.idOf(needle)) {
                return parseInt(i);
            }
        }

        return null;
    }

    findById(id: number)
    {
        for (let i in this.items) {
            if (this.idOf(this.items[i]) === id) {
                return this.items[i];
            }
        }

        return null;
    }

    findIndexById(id: number)
    {
        if (typeof id === 'undefined') {
            console.warn(`finder.ts Trying to find a node by id but id is undefined, did you return ID(n) in your query?`)
        }

        for (let i in this.items) {
            if (this.idOf(this.items[i]) === id) {
                return parseInt(i)
            }
        }

        return null;
    }
}

export let Finder = new FinderSingleton();
