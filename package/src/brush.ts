import getStroke from 'perfect-freehand';

import { Point } from './common/point';

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
    private _minOffsetLeft: number = Number.MAX_VALUE;
    private _maxOffsetRight: number = Number.MIN_VALUE;
    private _minOffsetTop: number = Number.MAX_VALUE;
    private _maxOffsetBottom: number = Number.MIN_VALUE;
    private _left: number = Number.NaN;
    private _top: number = Number.NaN;
    private _count: number = 0;

    constructor(options?: BrushPotions) {
        this._options = options || {
            type: 'color',
            color: '#666666',
            width: 4,
        };
        this._canvas = document.createElement('canvas');
        this._canvas.style.position = 'absolute';
        this._canvas.style.pointerEvents = 'none';
    }

    addPoint(p: Point) {
        if (isNaN(this._left)) {
            this._left = p.x;
            this._top = p.y;
            return;
        }
        this._minOffsetLeft = Math.min(this._minOffsetLeft, p.x);
        this._maxOffsetRight = Math.max(this._maxOffsetRight, p.x);
        this._minOffsetTop = Math.min(this._minOffsetTop, p.y);
        this._maxOffsetBottom = Math.max(this._maxOffsetBottom, p.y);
        this._points.push(p);
    }

    get left() {
        return this._left + this._minOffsetLeft;
    }

    get top() {
        return this._top + this._minOffsetTop;
    }

    get canvas() {
        return this._canvas;
    }

    draw(): HTMLCanvasElement | null {
        const points = getStroke(this._points, {
            size: this._options.width,
            thinning: 0.5,
            streamline: 0.5,
            smoothing: 0.5,
            simulatePressure: true,
        });
        const dpr = Math.max(2, window.devicePixelRatio);
        const context = this._canvas.getContext('2d')!;
        context.clearRect(0, 0, this._canvas.width, this._canvas.height);
        const width = this._maxOffsetRight - this._minOffsetLeft + this._options.width * 2;
        const height = this._maxOffsetBottom - this._minOffsetTop + this._options.width * 2;
        this._canvas.width = width * dpr;
        this._canvas.height = height * dpr;
        this._canvas.style.width = `${width}px`;
        this._canvas.style.height = `${height}px`;

        context.save();
        this._initBrushPaint(context);
        context.scale(dpr, dpr);
        context.translate(
            -this._minOffsetLeft + this._options.width,
            -this._minOffsetTop + this._options.width
        );
        context.beginPath();
        context.moveTo(points[0][0], points[0][1]);
        const length = points.length;
        let p1 = { x: points[0][0], y: points[0][1] };
        let p2 = { x: points[1][0], y: points[1][1] };
        for (let index = 1; index < length; index++) {
            const midPoint = this._midPointBtw(p1, p2);
            context.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
            if (index === length - 1) {
                break;
            }
            p1 = { x: points[index][0], y: points[index][1] };
            p2 = { x: points[index + 1][0], y: points[index + 1][1] };
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
