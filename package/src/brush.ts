import getStroke from 'perfect-freehand';
import simplify from 'simplify-js';

import { Point } from './common/point';
import { Rect } from './common/rect';
import { Easing, EASINGS } from './easing';

export declare type FillType = 'color' | 'image';

export interface BrushPotions {
    simplifyPoints?: number;
    thinning?: number;
    smoothing?: number;
    streamline?: number;

    easing?: Easing;
    start?: {
        cap?: boolean;
        taper?: number | boolean;
        easing?: Easing;
    };
    end?: {
        cap?: boolean;
        taper?: number | boolean;
        easing?: Easing;
    };

    fillType: 'color' | 'image';
    fillSize: number;
    disableFill?: boolean;
    fillColor?: string;
    fillImage?: CanvasImageSource;
}

export class FreehandBrush {
    private _points: Point[] = [];
    private _options: BrushPotions;
    private _canvas: HTMLCanvasElement;
    private _pointsBBox: Rect;
    private _realBBox: Rect;

    constructor(options?: BrushPotions) {
        this._options = options || {
            fillType: 'color',
            fillColor: '#666666',
            fillSize: 4,
        };
        this._canvas = document.createElement('canvas');
        this._canvas.style.pointerEvents = 'none';
        this._pointsBBox = new Rect(
            Number.MAX_VALUE,
            Number.MIN_VALUE,
            Number.MAX_VALUE,
            Number.MIN_VALUE
        );
        this._realBBox = new Rect(
            Number.MAX_VALUE,
            Number.MIN_VALUE,
            Number.MAX_VALUE,
            Number.MIN_VALUE
        );
    }

    updateOptions(options: Partial<BrushPotions>) {
        Object.assign(this._options, options);
        if (this._points.length > 0) {
            this._updateRealBBox();
        }
    }

    addPoint(p: Point) {
        this._pointsBBox.left = Math.min(this._pointsBBox.left, p.x);
        this._pointsBBox.right = Math.max(this._pointsBBox.right, p.x);
        this._pointsBBox.top = Math.min(this._pointsBBox.top, p.y);
        this._pointsBBox.bottom = Math.max(this._pointsBBox.bottom, p.y);
        this._points.push(p);

        this._updateRealBBox();
    }

    get left() {
        return this._realBBox.left;
    }

    get top() {
        return this._realBBox.top;
    }

    get canvas() {
        return this._canvas;
    }

    draw(): HTMLCanvasElement | null {
        const dpr = Math.max(2, window.devicePixelRatio);
        const context = this._canvas.getContext('2d')!;
        context.clearRect(0, 0, this._canvas.width, this._canvas.height);
        const width = this._realBBox.width;
        const height = this._realBBox.height;
        this._canvas.width = width * dpr;
        this._canvas.height = height * dpr;
        this._canvas.style.width = `${width}px`;
        this._canvas.style.height = `${height}px`;
        this._initBrushPaint(context);

        const strokePoints = getStroke(this._points, {
            simulatePressure: true,
            size: this._options.fillSize,
            thinning: this._options.thinning,
            streamline: this._options.streamline,
            smoothing: this._options.smoothing,
            easing: this._options.easing ? EASINGS[this._options.easing] : undefined,
            start: this._options.start
                ? {
                      cap: this._options.start.cap,
                      taper: this._options.start.taper,
                      easing: this._options.start.easing
                          ? EASINGS[this._options.start.easing]
                          : undefined,
                  }
                : undefined,
            end: this._options.end
                ? {
                      cap: this._options.end.cap,
                      taper: this._options.end.taper,
                      easing: this._options.end.easing
                          ? EASINGS[this._options.end.easing]
                          : undefined,
                  }
                : undefined,
        });
        const simplifyPoints = simplify(
            strokePoints.map((item) => {
                return { x: item[0], y: item[1] };
            }),
            this._options.simplifyPoints || 0.1
        );
        context.save();
        context.scale(dpr, dpr);
        context.translate(
            this._realBBox.left < 0 ? -this._realBBox.left : 0,
            this._realBBox.top < 0 ? -this._realBBox.top : 0
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
        context.restore();

        return this._canvas;
    }

    private _initBrushPaint(context: CanvasRenderingContext2D) {
        context.lineJoin = context.lineCap = 'round';
        if (this._options.fillType === 'color') {
            context.fillStyle = this._options.fillColor!;
        } else if (this._options.fillType === 'image') {
            context.fillStyle = context.createPattern(this._options.fillImage!, 'repeat')!;
        }
    }

    private _midPointBtw(p1: Point, p2: Point): Point {
        return {
            x: p1.x + (p2.x - p1.x) / 2,
            y: p1.y + (p2.y - p1.y) / 2,
        };
    }

    private _updateRealBBox() {
        this._realBBox.left = this._pointsBBox.left - this._options.fillSize / 2;
        this._realBBox.right = this._pointsBBox.right + this._options.fillSize / 2;
        this._realBBox.top = this._pointsBBox.top - this._options.fillSize / 2;
        this._realBBox.bottom = this._pointsBBox.bottom + this._options.fillSize / 2;
    }
}
