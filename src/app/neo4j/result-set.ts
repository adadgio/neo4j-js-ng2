import { Node } from './node';

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

        // console.log(columns)
        // console.log(data)

        for (let index in columns) {
            const col = columns[index]
            const nfo = this.parseColumn(col)

            const alias = nfo.alias
            const prop = nfo.property

            if (typeof datasets[alias] === 'undefined') {
                datasets[alias] = []
            }

            for (let i in data) {

                let row = data[i].row

                if (typeof datasets[alias][i] === 'undefined') {
                    datasets[alias][i] = new Node()
                }

                // iterate through row properties
                for (let k in row) {

                    // only add value if index is current column index
                    // otherwhise all nodes will have all other node entities properties
                    if (k === index) {

                        let valOrProps = row[k]

                        if (prop === null) {

                            // use false to prevent overriding exisint properties
                            datasets[alias][i].hydrate(valOrProps, false)

                        } else if (prop === 'ID') {

                            // use false parameter to make this property non-enumerable (hidden)
                            datasets[alias][i].set('ID', valOrProps, false)

                        } else if (prop === 'LABELS') {

                            // use false parameter to make this property non-enumerable (hidden)
                            datasets[alias][i].set('LABELS', valOrProps, false)

                        } else {

                            // node.hydrate(valOrProps, false)
                        }

                    }

                }

                // add special functions to dataset (each array accessor)
                Object.defineProperty(datasets[alias], 'each', {
                    configurable: false,
                    enumerable: false,
                    writable: true,
                    value: function(callback: Function) {
                        for (let i in this) {
                            callback(this[i])
                        }
                        return this
                    }
                })

                Object.defineProperty(datasets[alias], 'distinct', {
                    configurable: false,
                    enumerable: false,
                    writable: true,
                    value: function(prop: string) {
                        // // const self = this
                        // let keys = this.map(n => {return n[prop]}).filter((num, i, self) => {
                        //     return self.indexOf(num) === i;
                        // })
                        //
                        // console.log(keys)
                        //
                        // for (let i = this.length; i >= 0; i--) {
                        //
                        //     if (typeof this[i] !== 'undefined' && keys.indexOf(this[i][prop]) > -1) {
                        //         console.log(this[i][prop], keys)
                        //         this.splice(i, 1)
                        //         keys.splice(i, 1)
                        //     }
                        // }
                        //
                        // console.log(this)
                        // return this
                        return this
                    }
                })

            }
        }

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

    isSpecialProperty(col: string)
    {
        const parts = col.split('(')
        return (parts.length === 2) ? true : false;
    }

    getSpecialPropertyColumnDescriptor(col: string)
    {
        const parts = col.split('(')

        if (parts.length === 2) {
            const col = parts[1].replace(')', '')
            return { columnName: col, specialProperty: parts[0] }
        } else {
            return null
        }
    }

    getDataset(col: string)
    {
        return (typeof this.datasets[col] === 'undefined') ? null : this.datasets[col];
    }

}
