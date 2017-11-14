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

        // prepate datasets
        for (let i in columns) {
            const colInfo = this.parseColumn(columns[i])
            const entity = colInfo.entity;
            datasets[entity] = [];
        }

        // console.log(datasets)
        console.log(data)
        console.log(columns)

        for (let index in data) {

            // const node = new Node();
            const row = data[index].row;
            // datasets[entity][index] = new Node();

            // datasets[entity][index] = new Node();
            // loop through each row properties (indexed by array)
            // and find to which column/entity the row belongs
            // there should be as much properties as columns

            for (let i in columns) {

                const value = row[i];
                const colInfo = this.parseColumn(columns[i])
                // console.log(colInfo)
                const entity = colInfo.entity;
                const prop = colInfo.property;

                if (typeof datasets[entity][index] === 'undefined') {
                    datasets[entity][index] = new Node();
                }

                console.log(`row[${index}] Col[${columns[i]}]`, value)

                if (typeof value === 'object') {
                     datasets[entity][index][prop] = value
                }
                
                // console.log(prop)
                if (null === prop) {

                    // datasets[entity][index][prop] =

                } else {

                    if (prop === 'ID') {

                    } else if (prop === 'LABELS') {

                    }

                }
                // if (null !== prop) {
                //
                //     if (prop === 'ID') {
                //
                //     } else if (prop === 'LABELS') {
                //
                //     } else {
                //         // console.log(entity, index, prop)
                //         datasets[entity][index].set(prop, value)
                //     }
                // }


                // the hydrated row will be pushed in the correct dataset
                // assign properties to the correct
                // for (let j in row) {
                //     const value = row[k];
                // }
            }

        }

        console.log(datasets)
        // for (let i in data) {
        //     const rowData = data[i].row;
        //
        //     // console.log(rowData)
        //     let entities = {};
        //
        //     for (let col of columns) {
        //         let nfo = this.parseColumn(col);
        //         let e = nfo.entity;
        //         entities[e] = new Node();
        //     }
        //
        //     for (let k in rowData) {
        //
        //         const colInfo = this.parseColumn(columns[k]);
        //         const e = colInfo.entity;
        //         const prop = colInfo.property;
        //
        //         if (prop === 'ID') {
        //
        //             // make this property non-enumerable by using false as a 2nd parameter
        //             entities[e].set('ID', rowData[k], false);
        //
        //         } else if (prop === 'LABELS') {
        //
        //             // make this property non-enumerable by using false as a 2nd parameter
        //             entities[e].set('LABELS', rowData[k], false);
        //
        //         } else {
        //
        //             // hydrate row but prevent replacing exeisting properties
        //             // by setting the hydration 2nd parameter to false
        //             entities[e].hydrate(rowData[k], false)
        //         }
        //     }
        //
        //     for (let e in entities) {
        //         const row = entities[e]
        //         datasets[e].push(row)
        //
        //         // define and each function looper for each dataset
        //         Object.defineProperty(datasets[e], 'each', {
        //             configurable: false,
        //             enumerable: false,
        //             writable: true,
        //             value: (callback: Function) => {
        //                 for (let i in this.datasets[e]) {
        //                     callback(this.datasets[e][i])
        //                 }
        //             }
        //         })
        //     }
        //
        // }

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
     *  n.name => { entity: "n", property: "name" }
     *  ID(n) => { entity: "n", property: "ID" }
     * @return object { entity: "", property }
     */
    parseColumn(col: string)
    {
        const partsA = col.split('.')
        const partsB = col.split('(')

        if (partsA.length === 2) {
            return { entity: partsA[0], property: partsA[1] }
        } else if (partsB.length === 2) {
            return { entity: partsB[1].replace(')', ''), property: partsB[0] }
        } else {
            return { entity: col, property: null }
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
