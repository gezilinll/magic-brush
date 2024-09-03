import { Easing } from './easing';

export declare type BrushType = 'material' | 'ink';

export interface MaterialBrushOptions {
    img: CanvasImageSource;
    stackRepeat: boolean;
}

export interface InkBrushOptions {
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
    fillImg?: CanvasImageSource;
    fillColor?: string;
}

export interface BrushPotions {
    type: BrushType;
    size: number;
    simplifyPoints?: number;
    material?: MaterialBrushOptions;
    ink?: InkBrushOptions;
}
