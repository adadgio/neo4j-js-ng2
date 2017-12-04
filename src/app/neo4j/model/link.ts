import { NodeInterface } from './node.interface';
import { LinkInterface } from './link.interface';

export type LinkDataType = {
    source: NodeInterface;
    target: NodeInterface;
    relationship: NodeInterface;
}

export class Link implements LinkInterface
{
    source: NodeInterface;
    target: NodeInterface;
    relationship: NodeInterface;

    constructor(link: LinkDataType)
    {
        this.source = link.source;
        this.target = link.target;
        this.relationship = link.relationship;
    }
}
