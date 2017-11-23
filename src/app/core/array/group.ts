export function group(criterium: string, array: Array<any>): Array<any> {
    let groups: any = {}

    for (let i in array) {
        const data = array[i]
        const key = array[i][criterium]

        if (typeof(groups[key]) === 'undefined') {
            groups[key] = []
        }

        groups[key].push(data)
    }

    let groupsArray: Array<any> = []

    for (var key in groups) {
       if (groups.hasOwnProperty(key)) {
           groupsArray.push(groups[key]);
       }
    }

    return groupsArray
}
