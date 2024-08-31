import { Point } from './common/point';

export interface BrushPotions {
    type: 'color' | 'image';
    width: number;
    color?: string;
    image?: CanvasImageSource;
}

export class FreehandBrush {
    private _points: Point[] = [];
    private _lastRenderIndex: number = 0;
    private _options: BrushPotions;

    constructor(options?: BrushPotions) {
        this._options = options || {
            type: 'color',
            color: '#666666',
            width: 10,
        };
    }

    addPoint(p: Point) {
        this._points.push(p);
    }

    draw(canvas: HTMLCanvasElement, clear?: boolean) {
        const context = canvas.getContext('2d')!;
        if (clear) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            this._lastRenderIndex = 0;
        }
        if (this._points.length - this._lastRenderIndex < 2) {
            return;
        }
        context.save();
        this._initBrushPaint(context);
        let p1 = this._points[this._lastRenderIndex];
        let p2 = this._points[this._lastRenderIndex + 1];
        context.beginPath();
        context.moveTo(p1.x, p1.y);
        const length = this._points.length;
        for (let index = this._lastRenderIndex + 1; index < length; index++) {
            const midPoint = this._midPointBtw(p1, p2);
            context.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
            p1 = this._points[index];
            p2 = this._points[index + 1];
        }
        context.lineTo(p1.x, p1.y);
        this._lastRenderIndex = length - 1;
        context.stroke();
        context.restore();
    }

    private _initBrushPaint(context: CanvasRenderingContext2D) {
        context.lineWidth = this._options.width;
        context.lineJoin = context.lineCap = 'round';
        if (this._options.type === 'color') {
            context.strokeStyle = this._options.color!;
        } else if (this._options.type === 'image') {
            context.strokeStyle = context.createPattern(this._options.image!, 'repeat')!;
        }
    }

    private _midPointBtw(p1: Point, p2: Point): Point {
        return {
            x: p1.x + (p2.x - p1.x) / 2,
            y: p1.y + (p2.y - p1.y) / 2,
        };
    }
}
