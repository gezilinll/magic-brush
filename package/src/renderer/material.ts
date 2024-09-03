import { Point } from '../common/point';
import { angleBetween2Points, distanceBetween2Points } from '../common/utils';
import { BrushPotions } from '../options';

export function renderMaterial(
    context: CanvasRenderingContext2D,
    points: Point[],
    options: BrushPotions
) {
    const length = points.length;
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (let index = 1; index < length; index++) {
        const start: Point = { x: points[index - 1].x, y: points[index - 1].y };
        const end: Point = { x: points[index].x, y: points[index].y };
        const distance = Math.floor(distanceBetween2Points(start, end));
        const angle = angleBetween2Points(start, end);
        for (let z = 0; z <= distance || z === 0; z++) {
            const x = start.x + Math.sin(angle) * z - options.size / 2;
            const y = start.y + Math.cos(angle) * z - options.size / 2;
            context.drawImage(options.material!.img, x, y, options.size, options.size);
        }
    }
}
