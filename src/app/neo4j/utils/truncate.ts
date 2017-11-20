import { NodeInterface }  from '../node-interface';

export function truncate(str: string, len: number = 10) {
    let trunc = str.substring(0, len).trim()
    return (str.length > len) ? `${trunc}...` : str
}
