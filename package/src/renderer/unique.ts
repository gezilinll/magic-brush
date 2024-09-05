import { BrushPotions } from '..';
import { RenderPoint } from '../common/point';
import { distanceBetween2Points } from '../common/utils';

export function renderUnique(
    context: CanvasRenderingContext2D,
    points: RenderPoint[],
    options: BrushPotions
) {
    if (options.type === 'felt-tip-marker') {
        renderFeltTipMarker(context, points, options);
    } else if (options.type === 'beads') {
        renderBeads(context, points, options);
    }
}

export function renderFeltTipMarker(
    context: CanvasRenderingContext2D,
    points: RenderPoint[],
    options: BrushPotions
) {
    const radius = options.size / 2;
    const fillColor = 'orange';
    let offset = 0;
    for (let index = 0; index < points.length; index += offset) {
        const point = points[index];
        const alpha = point.attachData ? point.attachData.alpha : Math.random() * 0.5 + 0.5;
        context.globalAlpha = alpha;
        context.fillStyle = fillColor;
        context.beginPath();
        context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        context.fill();

        offset = point.attachData
            ? point.attachData.nextIndex - index
            : Math.floor(Math.random() * 5) + 1;
        point.attachData = point.attachData ?? {};
        point.attachData.nextIndex = index + offset;
        point.attachData.alpha = alpha;
    }
}

export function renderBeads(
    context: CanvasRenderingContext2D,
    points: RenderPoint[],
    _options: BrushPotions
) {
    const fillColor = 'purple';
    for (let index = 1; index < points.length; index++) {
        const prePoint = points[index - 1];
        const point = points[index];
        const distance = distanceBetween2Points(prePoint, point);
        const midX = (prePoint.x + point.x) / 2;
        const midY = (prePoint.y + point.y) / 2;
        context.globalAlpha = 0.7;
        context.fillStyle = fillColor;
        context.beginPath();
        context.arc(midX, midY, distance / 2, 0, Math.PI * 2);
        context.fill();
    }
}
