export class PropertyAccess
{
    constructor()
    {

    }

    getValue(data: any, accessor: string)
    {
        const keys = accessor.split('.')
        return this.descendKeysTree(data, keys)
    }
    
    descendKeysTree(data: any, keys: Array<string>)
    {
        if (keys.length === 0) {
            return data;
        }

        for (let key of keys) {

            const prop = this.findPropertyName(key)
            const index = this.findArrayIndex(key)

            if (typeof(data[prop])) {

                // update data to next level of data when key was found
                // and remove first key value to descend one level
                // also handles accessors featuring array access like "property[2]"

                if (false !== index) {
                    data = data[prop][index]
                } else {
                    data = data[prop]
                }

                keys.shift()

                if (keys.length === 0) {
                    return data
                } else {
                    return this.descendKeysTree(data, keys)
                }

            } else {
                return null;
            }
        }
    }

    /**
     * Accepts key values like "property[2]" or just "property"
     * and always return the "property" without the array access value.
     */
    findPropertyName(key: string): string
    {
        const parts = key.split('[')

        if (parts.length === 2) {
            return parts[0]
        } else {
            return key
        }
    }

    /**
     * Accepts key values like "property[2]" or just "property"
     * and always return the "2" index value (string or number)
     */
    findArrayIndex(key: string)
    {
        const parts = key.split('[')

        if (parts.length === 2) {
            const index = parts[1].replace(']', '')
            return index
        } else {
            return false
        }
    }
}
