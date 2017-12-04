import { NodeInterface } from './node.interface';

export interface LinkInterface {
    source: NodeInterface;
    target: NodeInterface;
    relationship: NodeInterface;
}
