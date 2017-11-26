// determine if all values of array1 are in array2 and vice versa, whatever the order though
export function quote(value: any) {
    if (typeof(value) === 'number') {
        return value;
    } else {
        if (!isNaN(value)) {
            return parseInt(value);
        } else {
            return `'${value}'`;
        }
    }
}
