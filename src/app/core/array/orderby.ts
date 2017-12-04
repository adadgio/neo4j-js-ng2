import { PropertyAccess } from '../property.access';

export function orderBy(access: string, array: Array<any>, order: string = 'ASC') {
    const accessor = new PropertyAccess()

    return array.sort((a, b) => {
        if (order === 'ASC') {
            return (accessor.getValue(a, access) > accessor.getValue(b, access)) ? 1 : -1;
        } else {
            return (accessor.getValue(a, access) < accessor.getValue(b, access)) ? 1 : -1;
        }
    })
}
