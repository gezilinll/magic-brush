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
        const offset = options.material!.stackRepeat ? 1 : options.size / 3;
        for (let z = 0; z <= distance || z === 0; z += offset) {
            let x = start.x + Math.sin(angle) * z - options.size / 2;
            let y = start.y + Math.cos(angle) * z - options.size / 2;

            context.save();
            if (!options.material!.stackRepeat) {
                const randomAngle = Math.random() * 2 * Math.PI;
                const randomOffset = 3;
                const randomOffsetX = (Math.random() - 0.5) * randomOffset;
                const randomOffsetY = (Math.random() - 0.5) * randomOffset;
                x += randomOffsetX;
                y += randomOffsetY;
                context.translate(x + options.size / 2, y + options.size / 2);
                context.rotate(randomAngle);
                context.translate(-(x + options.size / 2), -(y + options.size / 2));
            }
            context.drawImage(options.material!.img, x, y, options.size, options.size);
            context.restore();
        }
    }
}
