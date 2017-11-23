// determine if all values of array1 are in array2 and vice versa, whatever the order though
export function escape(value: any) {
    if (typeof value === 'undefined' || value === '' || value == null) {
        return '';
    }
    else if (typeof value  === 'string') {
        value = value.replace(/'/g, "\\\'")
    }
    else if (typeof value === 'number') {
        value = value;

    } else {
        console.warn(`cypher-query.ts: unsupported escape value ${typeof(value)}`)
    }

    return value;
}
