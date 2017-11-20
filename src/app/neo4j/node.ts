import { NodeInterface } from './node-interface';

const reserved = [
    'ID', 'LABELS',
];

export class Node implements NodeInterface
{
    ID: number;
    LABELS = [];
    props: any = {};

    constructor(data: any = null)
    {
        if (null !== data) {
            this.hydrate(data)
        }
    }

    hydrate(data: any, allowReplace: boolean = true)
    {
        for (let prop in data) {
            if (data.hasOwnProperty(prop) && typeof data[prop] !== 'function') {

                if (reserved.indexOf(prop) === -1) {
                    this.props[prop] = data[prop]
                } else {
                    this[prop] = data[prop]
                }
            }
        }
    }

    set(prop: string, value: any, enumerable: boolean = true)
    {
        if (false === enumerable) {
            Object.defineProperty(this, prop, {
                configurable: false,
                enumerable: false,
                writable: true,
                value: value
            })
        } else {

            if (reserved.indexOf(prop) === -1) {
                this.props[prop] = value;
            } else {
                this[prop] = value
            }

        }
    }

    properties()
    {
        return this.props;
    }

    get(prop: string)
    {
        return (typeof this.props[prop] === 'undefined') ? null : this.props[prop]
    }

    getId()
    {
        return this.ID
    }

    getLabels()
    {
        return this.LABELS
    }

    getFirstLabel()
    {
        return (this.LABELS.length > 0) ? this.LABELS[0] : null
    }
}
