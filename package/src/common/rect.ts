export class Rect {
    left: number;
    right: number;
    top: number;
    bottom: number;

    constructor(_left: number, _right: number, _top: number, _bottom: number) {
        this.left = _left;
        this.right = _right;
        this.top = _top;
        this.bottom = _bottom;
    }

    get width() {
        return this.right - this.left;
    }

    get height() {
        return this.bottom - this.top;
    }
}
