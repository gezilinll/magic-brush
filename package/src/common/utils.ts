import { Point } from './point';

const average = (a: number, b: number) => (a + b) / 2;

export function generateSVGPath(pathData: string, width = 500, height = 500) {
    return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <path d="${pathData}" />
</svg>
    `;
}

export function getSvgPathFromStroke(points: number[][], closed = true) {
    const len = points.length;

    if (len < 4) {
        return ``;
    }

    let a = points[0];
    let b = points[1];
    const c = points[2];

    let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(2)},${b[1].toFixed(
        2
    )} ${average(b[0], c[0]).toFixed(2)},${average(b[1], c[1]).toFixed(2)} T`;

    for (let i = 2, max = len - 1; i < max; i++) {
        a = points[i];
        b = points[i + 1];
        result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(2)} `;
    }

    if (closed) {
        result += 'Z';
    }

    return result;
}

export function distanceBetween2Points(point1: Point, point2: Point) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
}

export function angleBetween2Points(point1: Point, point2: Point) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.atan2(dx, dy);
}

export function midPointBtw(p1: Point, p2: Point): Point {
    return {
        x: p1.x + (p2.x - p1.x) / 2,
        y: p1.y + (p2.y - p1.y) / 2,
    };
}

export function getPointKey(prefix: string | number, point: Point) {
    return `${prefix}_${point.x}_${point.y}`;
}

export function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

export function lerp(start: number, stop: number, amt: number) {
    return start + (stop - start) * amt;
}
