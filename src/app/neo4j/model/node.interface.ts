export interface NodeInterface {
    ID: number;
    LABELS: Array<string>;
    META: any;
    TYPE?: string;
    props: any;
    fixed?: boolean;
    x?: number;
    y?: number;
    hydrate(data: any, allowReplace: boolean): void;
    properties(): any;
    add(prop: string, value: any): any
    set(prop: string, value: any, enumerable?: boolean): any;
    reset(props: any): any;
    get(prop: string): any;
    remove(prop: string): any;
    renameProperty(prop: string, newProp: string): any
    getId(): number;
    getType(): string;
    hasLabel(label:string): boolean;
    getLabels(): Array<string>;
    getFirstLabel(): string;
    setLabels(labels: Array<string>): any;
    addLabel(label: string): any
    metadata(): any
    [prop: string]: any

    setFixed(fixed: boolean): any;
    setCoords(coords: [number, number]): any;
    getCoords(): any
}
