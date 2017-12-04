import { Node, NodeInterface } from '../model';

// @todo Warn if not LABEL nor ID or event TYPE (for relationships) are not in the query
export class ResultSet
{
    datasets: any = {}

    constructor(results: any)
    {
        this.datasets = this.parse(results)
    }

    parse(results: Array<any>)
    {
        let datasets = {};
        const data: any = results['data'];
        const columns: any = results['columns'];

        for (let index in columns) {
            const col = columns[index]
            const nfo = this.parseColumn(col)

            const alias = nfo.alias
            const prop = nfo.property

            if (typeof datasets[alias] === 'undefined') {
                datasets[alias] = []

                Object.defineProperty(datasets[alias], 'alias', {
                    configurable: false,
                    enumerable: false,
                    writable: false,
                    value: alias
                })

                Object.defineProperty(datasets[alias], 'first', {
                    configurable: false,
                    enumerable: false,
                    writable: false,
                    value: function () {
                        return this.length > 0 ? this[0] : null
                    }
                })
            }

            for (let i in data) {

                let row = data[i].row;
                const meta = data[i].meta;

                // meta data from the neo4j rest api tells us if
                // current row a node or a relationship

                if (typeof datasets[alias][i] === 'undefined') {
                    datasets[alias][i] = new Node()
                }

                // iterate through row properties
                for (let k in row) {

                    // only add value if index is current column index
                    // otherwhise all nodes will have all other node entities properties
                    if (k === index) {

                        let valOrProps = row[k]
                        const metadata = meta[k]
                        datasets[alias][i].set('META', metadata, false)

                        if (prop === null) {

                            // use false to prevent overriding exisint properties
                            datasets[alias][i].hydrate(valOrProps, false)

                        } else if (prop === 'ID') {

                            // use false parameter to make this property non-enumerable (hidden)
                            datasets[alias][i].set('ID', valOrProps, false)

                        } else if (prop === 'LABELS') {

                            // use false parameter to make this property non-enumerable (hidden)
                            datasets[alias][i].set('LABELS', valOrProps, false)

                        } else if (prop === 'TYPE') {

                            datasets[alias][i].set('TYPE', valOrProps, false)

                        } else {

                            // node.hydrate(valOrProps, false)
                        }

                    }

                }

            }
        }
        
        this.datasets = datasets;
        return datasets;
    }

    addProperties(row: any, propsAndValues: any)
    {
        for (let prop in propsAndValues) {
            if (propsAndValues.hasOwnProperty(prop)) { row[prop] = propsAndValues[prop] }
        }
        return row;
    }

    /**
     * Turns column names into:
     *  n => { entity: "n", property: null }
     *  n.name => { alias: "n", property: "name" }
     *  ID(n) => { alias: "n", property: "ID" }
     * @return object { alias: "", property }
     */
    parseColumn(col: string)
    {
        const partsA = col.split('.')
        const partsB = col.split('(')

        if (partsA.length === 2) {
            return { alias: partsA[0], property: partsA[1] }
        } else if (partsB.length === 2) {
            return { alias: partsB[1].replace(')', ''), property: partsB[0] }
        } else {
            return { alias: col, property: null }
        }
    }

    getDatasets()
    {
        return this.datasets;
    }

    getDataset(col: string)
    {
        return (typeof this.datasets[col] === 'undefined') ? [] : this.datasets[col];
    }

    size()
    {
        return Object.keys(this.datasets).length;
    }
}
