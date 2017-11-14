interface Properties {
    id: any;
    [prop: string]: any;
}

export class Node
{
    x: number;
    y: number;

    properties: any = {};

    constructor(properties: Properties)
    {
        this.properties = properties;
    }

    getId()
    {
        return this.properties.id
    }

    setCoords(x: number, y: number)
    {
        this.x = x;
        this.y = y;
        return this;
    }

    toObject()
    {
        return {
            // x: this.x,
            // y: this.y,
            properties: this.properties
        }
    }
}
