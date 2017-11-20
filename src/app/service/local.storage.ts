/**
 * Local storage service.
 */
class LocalStorageSingleton
{

    get(key: string, defaults?: any) {
        let value = localStorage.getItem(key);

        if (typeof value === 'undefined' || value == null) {
            value = (defaults) ? defaults : null
        }

        return this.output(value);
    }

    set(key: string, input: any) {
        localStorage.setItem(key, this.transform(input));
        return this;
    }

    remove(key: string) {
        localStorage.removeItem(key);
        return this;
    }

    output(data: any) {
        let value: any;
        if (data === null) { return null }
        
        try {
            value = JSON.parse(data);
        } catch (e) {
            value = data;
        }

        return value;
    }

    transform(data: any) {
        const type = typeof(data);
        let value: any;

        switch (type) {
            case 'string':
                value = data;
            break;
            case 'number':
                value = data;
            break;
            case 'object':
                value = JSON.stringify(data);
            break;
            default:
                value = data;
            break;
        }

        return value;
    }
}

export let LocalStorage = new LocalStorageSingleton();
