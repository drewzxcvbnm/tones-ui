

type ToNumberFunction<T> = (o: T) => number
type ObjectComparator<T> = (o1: T, o2: T) => number

export function groupByMapped<T, K, V>(list: T[], keyGetter: (o: T) => K, mapper: ((o: T) => V)): Map<K, V[]> {
    const map = new Map();
    list.forEach((item) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [mapper(item)]);
        } else {
            collection.push(mapper(item));
        }
    });
    return map;
}

export function groupBy<T, K>(list: T[], keyGetter: (o: T) => K): Map<K, T[]> {
    const map = new Map();
    list.forEach((item) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });
    return map;
}

export function toMap<T, K>(list: T[], keyGetter: (o: T) => K): Map<K, T> {
    const map = new Map();
    list.forEach((item) => {
        const key = keyGetter(item);
        const existingItem = map.get(key);
        if (!existingItem) {
            map.set(key, item);
        }
    });
    return map;
}

export function getComparator<T>(fieldExtractor: ToNumberFunction<T>): ObjectComparator<T> {
    return (o1: any, o2: any) => {
        if (fieldExtractor(o1).valueOf() === fieldExtractor(o2)) {
            return 0;
        }
        if (fieldExtractor(o1).valueOf() > fieldExtractor(o2)) {
            return 1;
        }
        return -1;
    }
}

export function countMap<T>(arr: T[]): Map<T, number> {
    const m = new Map<T, number>()
    for (const v of arr) {
        if (m.has(v)) {
            m.set(v, m.get(v)! + 1)
        } else {
            m.set(v, 0)
        }
    }
    return m;
}

export function cartesianProduct<T>(...allEntries: T[][]): T[][] {
    return allEntries.reduce<T[][]>(
        (results, entries) =>
            results
                .map(result => entries.map(entry => result.concat([entry])))
                .reduce((subResults, result) => subResults.concat(result), []),
        [[]]
    )
}


