import getStroke from 'perfect-freehand';
import simplify from 'simplify-js';

import { Point } from './common/point';
import { Rect } from './common/rect';

export interface BrushPotions {
    type: 'color' | 'image';
    width: number;
    color?: string;
    image?: CanvasImageSource;
}

export class FreehandBrush {
    private _points: Point[] = [];
    private _options: BrushPotions;
    private _canvas: HTMLCanvasElement;
    private _rect: Rect;

    constructor(options?: BrushPotions) {
        this._options = options || {
            type: 'color',
            color: '#666666',
            width: 4,
        };
        this._canvas = document.createElement('canvas');
        this._canvas.style.pointerEvents = 'none';
        this._rect = new Rect(
            Number.MAX_VALUE,
            Number.MIN_VALUE,
            Number.MAX_VALUE,
            Number.MIN_VALUE
        );
    }

    addPoint(p: Point) {
        this._rect.left = Math.min(this._rect.left, p.x - this._options.width / 2);
        this._rect.right = Math.max(this._rect.right, p.x + this._options.width / 2);
        this._rect.top = Math.min(this._rect.top, p.y - this._options.width / 2);
        this._rect.bottom = Math.max(this._rect.bottom, p.y + this._options.width / 2);
        this._points.push(p);
    }

    get left() {
        return this._rect.left;
    }

    get top() {
        return this._rect.top;
    }

    get canvas() {
        return this._canvas;
    }

    draw(): HTMLCanvasElement | null {
        const dpr = Math.max(2, window.devicePixelRatio);
        const context = this._canvas.getContext('2d')!;
        context.clearRect(0, 0, this._canvas.width, this._canvas.height);
        const width = this._rect.width;
        const height = this._rect.height;
        this._canvas.width = width * dpr;
        this._canvas.height = height * dpr;
        this._canvas.style.width = `${width}px`;
        this._canvas.style.height = `${height}px`;
        this._initBrushPaint(context);

        const strokePoints = getStroke(this._points, {
            size: this._options.width,
            thinning: 0.5,
            streamline: 0.5,
            smoothing: 0.5,
            simulatePressure: true,
        });
        const simplifyPoints = simplify(
            strokePoints.map((item) => {
                return { x: item[0], y: item[1] };
            }),
            1
        );
        context.save();
        context.scale(dpr, dpr);
        context.translate(
            this._rect.left < 0 ? -this._rect.left : 0,
            this._rect.top < 0 ? -this._rect.top : 0
        );
        context.beginPath();
        context.moveTo(simplifyPoints[0].x, simplifyPoints[0].y);
        const length = simplifyPoints.length;
        let p1 = { x: simplifyPoints[0].x, y: simplifyPoints[0].y };
        let p2 = { x: simplifyPoints[1].x, y: simplifyPoints[1].y };
        for (let index = 1; index < length; index++) {
            const midPoint = this._midPointBtw(p1, p2);
            context.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
            if (index === length - 1) {
                break;
            }
            p1 = { x: simplifyPoints[index].x, y: simplifyPoints[index].y };
            p2 = { x: simplifyPoints[index + 1].x, y: simplifyPoints[index + 1].y };
        }
        context.closePath();
        context.fill();

        return this._canvas;
    }

    private _initBrushPaint(context: CanvasRenderingContext2D) {
        context.lineJoin = context.lineCap = 'round';
        if (this._options.type === 'color') {
            context.fillStyle = this._options.color!;
        } else if (this._options.type === 'image') {
            context.fillStyle = context.createPattern(this._options.image!, 'repeat')!;
        }
    }

    private _midPointBtw(p1: Point, p2: Point): Point {
        return {
            x: p1.x + (p2.x - p1.x) / 2,
            y: p1.y + (p2.y - p1.y) / 2,
        };
    }
}
