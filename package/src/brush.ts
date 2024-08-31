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
            width: 8,
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
        context.save();
        this._initBrushPaint(context);
        context.beginPath();
        context.moveTo(
            this._points[this._lastRenderIndex].x,
            this._points[this._lastRenderIndex].y
        );
        const length = this._points.length;
        for (let index = this._lastRenderIndex + 1; index < length; index++) {
            context.lineTo(this._points[index].x, this._points[index].y);
        }
        this._lastRenderIndex = length - 1;
        context.stroke();
        context.restore();
    }

    private _initBrushPaint(context: CanvasRenderingContext2D) {
        context.lineWidth = this._options.width;
        if (this._options.type === 'color') {
            context.strokeStyle = this._options.color!;
        } else if (this._options.type === 'image') {
            context.strokeStyle = context.createPattern(this._options.image!, 'repeat')!;
        }
    }
}
