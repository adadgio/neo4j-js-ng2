export function diff(array1: Array<any>, array2: Array<any>) {
    let a = [], diff = [];

    for (let i = 0; i < array1.length; i++) {
        a[array1[i]] = true;
    }
    
    for (let i = 0; i < array2.length; i++) {
        if (a[array2[i]]) {
            delete a[array2[i]];
        } else {
            a[array2[i]] = true;
        }
    }

    for (let k in a) {
        diff.push(k);
    }

    return diff;
}
