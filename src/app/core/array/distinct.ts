export function distinct(prop: string, array: Array<any>) {
    const keys = array.map((obj) => { return obj[prop] })
    return array.filter((obj, i) => { return keys.indexOf(obj[prop]) === i })
}
