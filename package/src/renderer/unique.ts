import { BrushPotions } from '..';
import { RenderPoint } from '../common/point';
import { distanceBetween2Points, getRandomFloat, lerp } from '../common/utils';

export function randomColor() {
    return (
        '#' +
        Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, '0')
    );
}

export function renderUnique(
    context: CanvasRenderingContext2D,
    points: RenderPoint[],
    options: BrushPotions
) {
    if (options.type === 'felt-tip-marker') {
        renderFeltTipMarker(context, points, options);
    } else if (options.type === 'beads') {
        renderBeads(context, points, options);
    } else if (options.type === 'flip-wiggle') {
        renderFlipWiggle(context, points, options);
    } else if (options.type === 'tangents') {
        renderTangents(context, points, options);
    } else if (options.type === 'filling-gaps') {
        renderFillingGaps(context, points, options);
    } else if (options.type === 'splatter-points') {
        renderSplatterPoints(context, points, options);
    } else if (options.type === 'hatching') {
        renderHatching(context, points, options);
    } else if (options.type === 'spray') {
        renderSpray(context, points, options);
    }
}

export function renderFeltTipMarker(
    context: CanvasRenderingContext2D,
    points: RenderPoint[],
    options: BrushPotions
) {
    const radius = options.size / 2;
    let offset = 0;
    for (let index = 0; index < points.length; index += offset) {
        const point = points[index];
        const alpha = point.attachData ? point.attachData.alpha : Math.random() * 0.5 + 0.5;
        const color = point.attachData ? point.attachData.color : randomColor();
        context.globalAlpha = alpha;
        context.fillStyle = color;
        context.beginPath();
        context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        context.fill();

        offset = point.attachData
            ? point.attachData.nextIndex - index
            : Math.floor(Math.random() * 5) + 1;
        point.attachData = point.attachData ?? {};
        point.attachData.nextIndex = index + offset;
        point.attachData.alpha = alpha;
        point.attachData.color = color;
    }
}

export function renderBeads(
    context: CanvasRenderingContext2D,
    points: RenderPoint[],
    _options: BrushPotions
) {
    for (let index = 1; index < points.length; index++) {
        const prePoint = points[index - 1];
        const point = points[index];
        const color = point.attachData ? point.attachData.color : randomColor();
        const distance = distanceBetween2Points(prePoint, point);
        const midX = (prePoint.x + point.x) / 2;
        const midY = (prePoint.y + point.y) / 2;
        context.globalAlpha = 0.7;
        context.fillStyle = color;
        context.beginPath();
        context.arc(midX, midY, distance / 2, 0, Math.PI * 2);
        context.fill();
        point.attachData = point.attachData ?? {};
        point.attachData.color = color;
    }
}

export function renderFlipWiggle(
    context: CanvasRenderingContext2D,
    points: RenderPoint[],
    _options: BrushPotions
) {
    let frameCount = 0;
    for (let index = 1; index < points.length; index++) {
        const prePoint = points[index - 1];
        const point = points[index];
        const angle = Math.atan2(point.y - prePoint.y, point.x - prePoint.x);
        const flip = (frameCount % 2) * Math.PI;

        const distance = distanceBetween2Points(prePoint, point);
        const midX = (prePoint.x + point.x) / 2;
        const midY = (prePoint.y + point.y) / 2;
        context.strokeStyle = 'rgb(255, 120, 0)';
        context.beginPath();
        context.arc(midX, midY, distance / 2, angle + flip, angle + Math.PI + flip);
        context.stroke();
        frameCount++;
    }
}

export function renderTangents(
    context: CanvasRenderingContext2D,
    points: RenderPoint[],
    options: BrushPotions
) {
    for (let index = 1; index < points.length; index++) {
        const prePoint = points[index - 1];
        const point = points[index];

        context.save();
        context.fillStyle = 'rgba(60, 180, 0, 0.6)';
        context.strokeStyle = 'none';
        context.translate(point.x, point.y);
        const angle = Math.atan2(point.y - prePoint.y, point.x - prePoint.x);
        context.rotate(angle);
        const minSize = options.size / 2;
        const distance = Math.hypot(point.x - prePoint.x, point.y - prePoint.y);
        context.beginPath();
        context.ellipse(0, 0, distance * 4 + minSize, minSize, 0, 0, Math.PI * 2);
        context.fill();
        context.restore();
    }
}

export function renderFillingGaps(
    context: CanvasRenderingContext2D,
    points: RenderPoint[],
    options: BrushPotions
) {
    for (let index = 1; index < points.length; index++) {
        const prePoint = points[index - 1];
        const point = points[index];

        context.strokeStyle = 'rgba(0, 0, 0, 1)';
        context.lineWidth = 1;
        const width = options.size;

        const lerps = 16;
        for (let i = 0; i <= lerps - 1; i++) {
            const x = lerp(point.x, prePoint.x, i / lerps);
            const y = lerp(point.y, prePoint.y, i / lerps);
            context.beginPath();
            context.moveTo(x - width, y - width);
            context.lineTo(x + width, y + width);
            context.stroke();
        }
    }
}

export function renderSplatterPoints(
    context: CanvasRenderingContext2D,
    points: RenderPoint[],
    options: BrushPotions
) {
    for (let index = 1; index < points.length; index++) {
        const prePoint = points[index - 1];
        const point = points[index];

        context.fillStyle = 'rgb(100, 181, 249)';
        context.lineWidth = options.size;
        const lerps = 8;
        const alpha: number[] = point.attachData ? (point.attachData.alpha as number[]) : [];
        for (let i = 0; i < lerps; i++) {
            const x = lerp(point.x, prePoint.x, i / lerps + lerps);
            const y = lerp(point.y, prePoint.y, i / lerps + lerps);
            context.beginPath();
            const alphaValue = point.attachData ? alpha[i] : Math.random() * 0.5 + 0.1;
            context.globalAlpha = alphaValue;
            context.arc(x, y, options.size / 2, 0, Math.PI * 2);
            context.fill();
            if (alpha.length < i + 1) {
                alpha.push(alphaValue);
            }
        }
        point.attachData = point.attachData ?? {};
        point.attachData.alpha = alpha;
    }
}

export function renderHatching(
    context: CanvasRenderingContext2D,
    points: RenderPoint[],
    options: BrushPotions
) {
    for (let index = 1; index < points.length; index++) {
        const prePoint = points[index - 1];
        const point = points[index];

        context.strokeStyle = 'rgba(15, 15, 255, 0.86)';
        context.lineWidth = 1;

        const speed = Math.abs(point.x - prePoint.x) + Math.abs(point.y - prePoint.y);
        const dx = point.y - prePoint.y;
        const dy = point.x - prePoint.x;
        const magnitude = speed / 2;
        const length = Math.sqrt(dx * dx + dy * dy);
        const vectorX = (dx / length) * magnitude;
        const vectorY = (dy / length) * magnitude + options.size / 2;

        const lerps = 3;
        for (let i = 0; i < lerps; i++) {
            const x = lerp(point.x, prePoint.x, i / lerps);
            const y = lerp(point.y, prePoint.y, i / lerps);

            context.beginPath();
            context.moveTo(x - vectorX, y - vectorY);
            context.lineTo(x + vectorX, y + vectorY);
            context.stroke();
        }
    }
}

export function renderSpray(
    context: CanvasRenderingContext2D,
    points: RenderPoint[],
    options: BrushPotions
) {
    for (let index = 1; index < points.length; index++) {
        const prePoint = points[index - 1];
        const point = points[index];

        context.fillStyle = 'rgba(0, 0, 0, 1)';
        const speed = Math.abs(point.x - prePoint.x) + Math.abs(point.y - prePoint.y);
        const minRadius = options.size / 2;
        const sprayDensity = 10;
        const r = speed + minRadius;
        const rSquared = r * r;

        const lerps = 10;
        for (let i = 0; i < lerps; i++) {
            const lerpX = lerp(point.x, prePoint.x, i / lerps);
            const lerpY = lerp(point.y, prePoint.y, i / lerps);
            for (let j = 0; j < sprayDensity; j++) {
                const randX = getRandomFloat(-r, r);
                const randY = getRandomFloat(-1, 1) * Math.sqrt(rSquared - randX * randX);
                context.beginPath();
                context.arc(lerpX + randX, lerpY + randY, 1, 0, Math.PI * 2);
                context.fill();
            }
        }
    }
}
