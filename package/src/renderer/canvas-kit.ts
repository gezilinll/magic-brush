import type { CanvasKit, Surface } from 'canvaskit-wasm';
import CanvasKitInit from 'canvaskit-wasm';

let canvasKit: CanvasKit;

export async function initCanvasKit(): Promise<void> {
    await CanvasKitInit({
        locateFile: (file) => 'https://unpkg.com/canvaskit-wasm@latest/bin/' + file,
    }).then((CanvasKit) => {
        canvasKit = CanvasKit;
    });
}

export class CanvasKitRenderer {
    private _surface: Surface;
    private _lastX = 0;
    private _lastY = 0;
    constructor(private canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this._surface = canvasKit.MakeSWCanvasSurface(this.canvas)!;
        if (!this._surface) {
            throw new Error('Failed to create a CanvasKit Surface');
        }
    }

    extendTextureEdges(image: HTMLCanvasElement): HTMLCanvasElement {
        const padding = 2; // 边缘扩展的像素宽度
        const canvas = document.createElement('canvas');
        canvas.width = image.width + padding * 2;
        canvas.height = image.height + padding * 2;
        const ctx = canvas.getContext('2d')!;

        // 填充边缘颜色
        ctx.drawImage(image, padding, padding, image.width, image.height);
        return canvas;
    }

    convertToPremultipliedAlpha(imageData: ImageData) {
        const { data, width, height } = imageData;
        const newData = new Uint8ClampedArray(data.length);

        for (let i = 0; i < data.length; i += 4) {
            const alpha = data[i + 3] / 255;
            newData[i] = data[i] * alpha; // Red
            newData[i + 1] = data[i + 1] * alpha; // Green
            newData[i + 2] = data[i + 2] * alpha; // Blue
            newData[i + 3] = data[i + 3]; // Alpha remains unchanged
        }

        return new ImageData(newData, width, height);
    }

    render(image: CanvasImageSource, x: number, y: number, width: number, height: number) {
        const canvas = this._surface.getCanvas();

        // @ts-expect-error ignore
        let srcWidth = image.width;
        // @ts-expect-error ignore
        let srcHeight = image.height;
        if (!(image instanceof HTMLCanvasElement)) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = srcWidth;
            tempCanvas.height = srcHeight;
            const ctx = tempCanvas.getContext('2d');
            ctx!.drawImage(image, 0, 0, srcWidth, srcHeight);
            image = tempCanvas;
        }
        // image = this.extendTextureEdges(image);
        srcWidth = image.width;
        srcHeight = image.height;
        const context = image.getContext('2d')!;
        const imageData = context.getImageData(0, 0, srcWidth, srcHeight);
        const premultipliedImageData = this.convertToPremultipliedAlpha(imageData);
        const skImage = canvasKit.MakeImage(
            {
                width: srcWidth,
                height: srcHeight,
                colorType: canvasKit.ColorType.RGBA_8888, // RGBA 格式
                alphaType: canvasKit.AlphaType.Premul, // 设置为预乘 Alpha
                colorSpace: canvasKit.ColorSpace.SRGB,
            },
            premultipliedImageData.data,
            premultipliedImageData.width * 4
        )!;

        const paint = new canvasKit.Paint();
        paint.setAntiAlias(true);

        // const skImage = canvasKit.MakeImageFromCanvasImageSource(image);
        skImage.makeCopyWithDefaultMipmaps();

        const shaderOptions = {
            filter: canvasKit.FilterMode.Linear,
            mipmap: canvasKit.MipmapMode.Linear,
            tileModeX: canvasKit.TileMode.Clamp,
            tileModeY: canvasKit.TileMode.Clamp,
        };
        const scaleX = this.canvas.width / skImage.width();
        const scaleY = this.canvas.height / skImage.height();
        const matrix = canvasKit.Matrix.scaled(scaleX, scaleX);
        const shader = skImage.makeShaderOptions(
            shaderOptions.tileModeX,
            shaderOptions.tileModeY,
            shaderOptions.filter,
            shaderOptions.mipmap,
            matrix
        );
        paint.setShader(shader);
        canvas.drawRect([this._lastX, this._lastY, width, height], paint);

        // canvas.drawImageRectOptions(
        //     skImage,
        //     [0, 0, skImage.width(), skImage.height()],
        //     [this._lastX, this._lastY, width, height],
        //     canvasKit.FilterMode.Linear,
        //     canvasKit.MipmapMode.Linear,
        //     paint
        // );
        this._surface.flush();

        paint.delete();

        skImage.delete();
        this._lastX++;
        this._lastY++;
    }

    saveCanvasAsImage(
        canvas: HTMLCanvasElement,
        fileName = 'canvas-image.png',
        format = 'png',
        quality = 1
    ) {
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error('The first argument must be an HTMLCanvasElement.');
        }

        // 支持的图片格式
        const supportedFormats = ['png', 'jpeg'];
        if (!supportedFormats.includes(format)) {
            throw new Error(`Unsupported format "${format}". Use 'png' or 'jpeg'.`);
        }

        // 根据格式生成图片的 Data URL
        const mimeType = `image/${format}`;
        const dataURL = canvas.toDataURL(mimeType, quality);

        // 创建一个临时 <a> 元素
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = fileName;

        // 触发下载
        link.click();
    }

    destroy() {
        this._surface.delete();
    }
}
