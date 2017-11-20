export interface NodeInterface {
    ID: number;
    LABELS: Array<string>;
    META: any;
    TYPE?: string;
    props: any;
    fixed?: false;
    x?: number;
    y?: number;
    hydrate(data: any, allowReplace: boolean): void;
    properties(): any;
    add(prop: string, value: any): any
    set(prop: string, value: any, enumerable?: boolean): any;
    reset(props: any): any;
    get(prop: string): any;
    remove(prop: string): any;
    getId(): number;
    getType(): string;
    getLabels(): Array<string>;
    getFirstLabel(): string;
    setLabels(labels: Array<string>): any;
    addLabel(label: string): any
    metadata(): any
    [prop: string]: any
}
