import { Point } from './common/point';

export class FreehandBrush {
    private _points: Point[] = [];
    private _lastRenderIndex: number = 0;

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
}
