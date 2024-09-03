import { BrushPotions, Point } from '..';
import { midPointBtw } from '../common/utils';

export function renderInk(
    context: CanvasRenderingContext2D,
    points: Point[],
    options: BrushPotions
) {
    context.lineJoin = context.lineCap = 'round';
    if (options.ink.fillType === 'color') {
        context.fillStyle = options.ink.fillColor!;
    } else if (options.ink.fillType === 'image') {
        context.fillStyle = context.createPattern(options.ink.fillImage!, 'repeat')!;
    }

    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    const length = points.length;
    let p1 = { x: points[0].x, y: points[0].y };
    let p2 = { x: points[1].x, y: points[1].y };
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (let index = 1; index < length; index++) {
        const midPoint = midPointBtw(p1, p2);
        context.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
        if (index === length - 1) {
            break;
        }
        p1 = { x: points[index].x, y: points[index].y };
        p2 = { x: points[index + 1].x, y: points[index + 1].y };
    }
    context.closePath();
    context.fill();
}
