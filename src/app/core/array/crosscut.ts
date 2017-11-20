// determine if all values of array1 are in array2 and vice versa, whatever the order though
export function crosscut(array1: Array<any>, array2: Array<any>) {
    array1 = array1.map(v => { return (typeof(v) === 'string') ? v.toLowerCase() : v })
    array2 = array2.map(v => { return (typeof(v) === 'string') ? v.toLowerCase() : v })

    function isIn(value: any, index) {
        return array1.indexOf(value) > -1;
    }

    return array2.every(isIn)
}
