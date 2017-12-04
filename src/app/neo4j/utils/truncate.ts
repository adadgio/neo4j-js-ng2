import { NodeInterface }  from '../model';

export function truncate(value: string|number, len: number = 10) {
    if (typeof(value) === 'number') { return value }

    let trunc = value.substring(0, len).trim()
    return (value.length > len) ? `${trunc}...` : value
}
