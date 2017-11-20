export interface NodeInterface {
    ID: number;
    LABELS: Array<string>;
    props: any;
    fixed?: false;
    x?: number;
    y?: number;
    hydrate(data: any, allowReplace: boolean): void;
    properties(): any;
    set(prop: string, value: any, enumerable?: boolean): any;
    get(prop: string): any;
    getId(): number;
    getLabels(): Array<string>;
    getFirstLabel(): string;
    [prop: string]: any
}
