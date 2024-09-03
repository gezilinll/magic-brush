import getStroke from 'perfect-freehand';
import simplify from 'simplify-js';

import { Point } from './common/point';
import { Rect } from './common/rect';
import { EASINGS } from './easing';
import { BrushPotions } from './options';
import { renderInk } from './renderer/ink';
import { renderMaterial } from './renderer/material';

export class FreehandBrush {
    private _points: Point[] = [];
    private _options: BrushPotions;
    private _canvas: HTMLCanvasElement;
    private _pointsBBox: Rect;
    private _realBBox: Rect;

    constructor(options?: BrushPotions) {
        this._options = options || {
            type: 'ink',
            size: 16,
            simplifyPoints: 0.1,
            ink: {
                fillType: 'color',
                fillColor: '#000000',
            },
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

    private _drawRotatedImage(image: CanvasImageSource, angle: number) {
        const canvas = document.createElement('canvas')!;
        canvas.width = 70;
        canvas.height = 70;
        const ctx = canvas.getContext('2d')!;
        ctx.translate(35, 35);
        ctx.rotate(angle);
        ctx.drawImage(image, -35, -35, 70, 70);
        return canvas;
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

        const strokePoints = getStroke(this._points, {
            simulatePressure: true,
            size: this._options.type === 'ink' ? this._options.size : 1,
            thinning: this._options.ink?.thinning,
            streamline: this._options.ink?.streamline,
            smoothing: this._options.ink?.smoothing,
            easing: this._options.ink?.easing ? EASINGS[this._options.ink.easing] : undefined,
            start: this._options.ink?.start
                ? {
                      cap: this._options.ink.start.cap,
                      taper: this._options.ink.start.taper,
                      easing: this._options.ink.start.easing
                          ? EASINGS[this._options.ink.start.easing]
                          : undefined,
                  }
                : undefined,
            end: this._options.ink?.end
                ? {
                      cap: this._options.ink.end.cap,
                      taper: this._options.ink.end.taper,
                      easing: this._options.ink.end.easing
                          ? EASINGS[this._options.ink.end.easing]
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
        if (this._options.type === 'material') {
            renderMaterial(context, simplifyPoints, this._options);
        } else if (this._options.type === 'ink') {
            renderInk(context, simplifyPoints, this._options);
        }
        context.restore();

        return this._canvas;
    }

    private _updateRealBBox() {
        this._realBBox.left = this._pointsBBox.left - this._options.size / 2;
        this._realBBox.right = this._pointsBBox.right + this._options.size / 2;
        this._realBBox.top = this._pointsBBox.top - this._options.size / 2;
        this._realBBox.bottom = this._pointsBBox.bottom + this._options.size / 2;
    }
}
