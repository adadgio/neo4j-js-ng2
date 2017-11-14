
export class Node
{
    private ID;
    private LABELS;

    constructor(data: any = null)
    {
        if (null !== data) {
            this.hydrate(data)
        }
    }

    hydrate(data: any, allowReplace: boolean = true)
    {
        for (let prop in data) {
            if (data.hasOwnProperty(prop)) {

                if (false === allowReplace && false === this.hasOwnProperty(prop)) {
                    this[prop] = data[prop]
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
            this[prop] = value;
        }
    }

    get(prop: string)
    {
        return (typeof this[prop] === 'undefined') ? null : this[prop]
    }

    getId()
    {
        return this.get('ID')
    }

    getLabels()
    {
        return this.get('LABELS')
    }
}
