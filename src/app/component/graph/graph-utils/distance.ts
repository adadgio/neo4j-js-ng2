export function distance(pointA: [number, number], pointB: [number, number]): number {
    const dx = pointA[0] - pointB[0];   // delta x
    const dy = pointA[1] - pointB[1];   // delta y
    return Math.sqrt(dx * dx + dy * dy); // distance
}
