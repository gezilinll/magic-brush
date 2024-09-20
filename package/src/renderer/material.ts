import tinycolor from 'tinycolor2';

import { Point, RenderPoint } from '../common/point';
import {
    angleBetween2Points,
    distanceBetween2Points,
    getPointKey,
    getRandomInt,
} from '../common/utils';
import { BrushPotions } from '../options';

export function updateMaterialRenderPoints(
    points: Point[],
    cached: Map<string, RenderPoint>,
    _options: BrushPotions
): RenderPoint[] {
    // smooth?
    // https://library.superhi.com/posts/how-to-paint-with-code-creating-paintbrushes#:~:text=Filling%20in%20the%20gaps%20between%20points
    const result: RenderPoint[] = [];
    points.forEach((point, index) => {
        const key = getPointKey(index, point);
        if (cached.has(key)) {
            result.push(cached.get(key)!);
        } else {
            result.push({
                ...point,
                angle: [],
                offsetX: [],
                offsetY: [],
                rendered: false,
                attachData: null,
            });
        }
    });
    return result;
}

function transformMaskByGrayScale(
    inputSource: CanvasImageSource,
    outputCanvas: HTMLCanvasElement,
    color: { r: number; g: number; b: number }
) {
    const ctxOutput = outputCanvas.getContext('2d')!;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = outputCanvas.width;
    tempCanvas.height = outputCanvas.height;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.drawImage(inputSource, 0, 0, tempCanvas.width, tempCanvas.height);

    const inputImageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const outputImageData = ctxOutput.createImageData(tempCanvas.width, tempCanvas.height);

    const data = inputImageData.data;
    const outputData = outputImageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const alpha = data[i + 3] / 255;
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        const newAlpha = alpha * (1.0 - gray / 255);
        outputData[i] = color.r;
        outputData[i + 1] = color.g;
        outputData[i + 2] = color.b;
        outputData[i + 3] = newAlpha * 255;
    }

    ctxOutput.putImageData(outputImageData, 0, 0);
}

function getMaterial(options: BrushPotions) {
    if (!options.material!.colorType) {
        return options.material!.img;
    }
    const canvas = document.createElement('canvas');
    // @ts-expect-error ignore
    canvas.width = options.material!.img!.width;
    // @ts-expect-error ignore
    canvas.height = options.material!.img!.height;
    if (options.material!.colorType === 'mask') {
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(options.material!.img!, 0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = options.material!.maskColor!;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
    } else {
        const color = tinycolor(options.material!.maskColor!).toRgb();
        transformMaskByGrayScale(options.material!.img!, canvas, {
            r: color.r,
            g: color.g,
            b: color.b,
        });
    }

    return canvas;
}

export function renderMaterial(
    context: CanvasRenderingContext2D,
    points: RenderPoint[],
    options: BrushPotions
) {
    const material = getMaterial(options);
    const length = points.length;
    context.beginPath();
    if (points.length === 1) {
        context.drawImage(material, 0, 0, options.size, options.size);
    } else {
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
                context.drawImage(material, x, y, options.size, options.size);
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
}
