import { NodeInterface } from './node.interface';

const reserved = [
    'ID', 'LABELS', 'META', 'TYPE'
];

export class Node implements NodeInterface
{
    ID: number;
    LABELS: Array<string> = [];
    META: any;
    TYPE?: string;
    props: any = {};
    x?: number;
    y?: number;
    fixed?: boolean;

    constructor(data: any = null)
    {
        if (null !== data) {
            this.hydrate(data)
        }
    }

    hydrate(data: any, allowReplace: boolean = true): void
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

    reset(data: any)
    {
        for (let prop in this.props) {
            if (data.hasOwnProperty(prop)) {
                // keep the prop !
            } else {
                this.remove(prop)
            }
        }

        return this
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

        return this
    }

    add(prop: string, value: any)
    {
        if (reserved.indexOf(prop) === -1) {
            this.props[prop] = value;
        } else {
            this[prop] = value
        }
        return this
    }

    renameProperty(prop: string, newProp: string)
    {
        const value = this.props[prop]
        this.remove(prop)
        this.add(newProp, value)
        return this
    }

    remove(prop: string)
    {
        delete(this.props[prop])
        return this
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

    getType()
    {
        return this.TYPE
    }

    getLabels()
    {
        return this.LABELS
    }

    hasLabel(label: string)
    {
        return this.LABELS.indexOf(label) > -1 ? true : false;
    }

    setLabels(labels: Array<string>)
    {
        this.LABELS = labels
        return this
    }

    addLabel(label: string)
    {
        this.LABELS.push(label)
        return this
    }

    getFirstLabel()
    {
        return (this.LABELS.length > 0) ? this.LABELS[0] : null
    }

    metadata()
    {
        return this.META
    }

    setFixed(fixed: boolean)
    {
        this.fixed = fixed
        return this
    }

    setCoords(coords: [number, number])
    {
        this.x = coords[0];
        this.y = coords[1];
        return this
    }

    getCoords()
    {
        return [this.x, this.y]
    }
}
