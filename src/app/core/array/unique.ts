export function unique(array: Array<any>) {
    return array.filter((item, i) => { return array.indexOf(item) === i })
}
