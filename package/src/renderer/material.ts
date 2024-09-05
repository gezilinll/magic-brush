import { Point, RenderPoint } from '../common/point';
import {
    angleBetween2Points,
    distanceBetween2Points,
    getPointKey,
    getRandomInt,
} from '../common/utils';
import { BrushPotions } from '../options';
import { updateSmoothAndSimplifiedRenderPoints } from './ink';

export function updateMaterialRenderPoints(
    points: Point[],
    cached: Map<string, RenderPoint>,
    options: BrushPotions
): RenderPoint[] {
    if (options.material!.repeatMode !== 'incompact-size') {
        return updateSmoothAndSimplifiedRenderPoints(points, cached, options);
    }
    const result: RenderPoint[] = [];
    points.forEach((point, index) => {
        const key = getPointKey(index, point);
        if (cached.has(key)) {
            result.push(cached.get(key)!);
        } else {
            result.push({ ...point, angle: [], offsetX: [], offsetY: [], rendered: false });
        }
    });
    return result;
}

export function renderMaterial(
    context: CanvasRenderingContext2D,
    points: RenderPoint[],
    options: BrushPotions
) {
    const length = points.length;
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (let index = 1; index < length; index++) {
        const start = points[index - 1];
        const end = points[index];
        const distance = start.rendered
            ? start.angle.length
            : Math.floor(distanceBetween2Points(start, end));
        const angle = start.rendered ? 0 : angleBetween2Points(start, end);
        let offset = 1;
        if (!start.rendered && options.material!.repeatMode !== 'compact') {
            offset =
                options.material!.repeatMode === 'incompact-size'
                    ? options.size / 3
                    : options.material!.fixedOffset!;
        }
        for (let z = 0; z <= distance || z === 0; z += offset) {
            const minRandomOffset = options.material?.minRandomOffset || -3;
            const maxRandomOffset = options.material?.maxRandomOffset || 3;
            const resultAngle =
                options.material!.repeatMode !== 'incompact-size'
                    ? 0
                    : start.rendered
                    ? start.angle[z]
                    : Math.random() * 2 * Math.PI;
            const resultOffsetX =
                options.material!.repeatMode !== 'incompact-size'
                    ? Math.sin(angle) * z
                    : start.rendered
                    ? start.offsetX[z]
                    : getRandomInt(minRandomOffset, maxRandomOffset) + Math.sin(angle) * z;
            const resultOffsetY =
                options.material!.repeatMode !== 'incompact-size'
                    ? Math.cos(angle) * z
                    : start.rendered
                    ? start.offsetY[z]
                    : getRandomInt(minRandomOffset, maxRandomOffset) + Math.cos(angle) * z;
            const x = start.x + resultOffsetX - options.size / 2;
            const y = start.y + resultOffsetY - options.size / 2;

            context.save();
            if (options.material!.repeatMode === 'incompact-size') {
                context.translate(x + options.size / 2, y + options.size / 2);
                context.rotate(resultAngle);
                context.translate(-(x + options.size / 2), -(y + options.size / 2));
            }
            context.drawImage(options.material!.img, x, y, options.size, options.size);
            context.restore();
            if (!start.rendered) {
                start.angle.push(resultAngle);
                start.offsetX.push(resultOffsetX);
                start.offsetY.push(resultOffsetY);
            }
        }
        start.rendered = true;
    }
}
