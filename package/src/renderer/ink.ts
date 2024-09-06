import getStroke from 'perfect-freehand';
import simplify from 'simplify-js';

import { BrushPotions, Point } from '..';
import { RenderPoint } from '../common/point';
import { midPointBtw } from '../common/utils';
import { Easing, EASINGS } from '../easing';

function getHardLightResult(options: BrushPotions) {
    const canvas = document.createElement('canvas');
    // @ts-expect-error ignore
    canvas.width = options.ink!.fillImg!.width;
    // @ts-expect-error ignore
    canvas.height = options.ink!.fillImg!.height;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = options.ink!.fillColor!;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = options.ink!.blendMode!;
    ctx.drawImage(options.ink!.fillImg!, 0, 0, canvas.width, canvas.height);
    return canvas;
}

export function updateSmoothAndSimplifiedRenderPoints(
    points: Point[],
    _cached: Map<string, RenderPoint>,
    options: BrushPotions
): RenderPoint[] {
    const simplifyPoints = simplify(points, options.simplifyPoints || 0.1);
    const strokePoints = getStroke(simplifyPoints, {
        simulatePressure: true,
        size: options.type === 'ink' ? options.size : 1,
        thinning: options.ink?.thinning,
        streamline: options.ink?.streamline,
        smoothing: options.ink?.smoothing,
        easing: options.ink?.easing ? EASINGS[options.ink.easing as Easing] : undefined,
        start: options.ink?.start
            ? {
                  cap: options.ink.start.cap,
                  taper: options.ink.start.taper,
                  easing: options.ink.start.easing
                      ? EASINGS[options.ink.start.easing as Easing]
                      : undefined,
              }
            : undefined,
        end: options.ink?.end
            ? {
                  cap: options.ink.end.cap,
                  taper: options.ink.end.taper,
                  easing: options.ink.end.easing
                      ? EASINGS[options.ink.end.easing as Easing]
                      : undefined,
              }
            : undefined,
    });

    return strokePoints.map((point) => {
        return {
            x: point[0],
            y: point[1],
            rendered: false,
            angle: [],
            offsetX: [],
            offsetY: [],
            attachData: null,
        };
    });
}

export function renderInk(
    context: CanvasRenderingContext2D,
    points: Point[],
    options: BrushPotions
) {
    context.lineJoin = context.lineCap = 'round';
    if (options.ink.fillType === 'color') {
        context.fillStyle = options.ink.fillColor!;
    } else if (options.ink.fillType === 'image') {
        context.fillStyle = options.ink.blendMode
            ? context.createPattern(getHardLightResult(options), 'repeat')!
            : context.createPattern(options.ink.fillImage!, 'repeat')!;
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
