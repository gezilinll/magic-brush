export class Point {
    x: number = 0;
    y: number = 0;

    constructor(_x: number, _y: number) {
        this.x = _x;
        this.y = _y;
    }
}

export class RenderPoint extends Point {
    angle: number[] = [];
    offsetX: number[] = [];
    offsetY: number[] = [];
    rendered: boolean = false;
}
