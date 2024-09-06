import { Easing } from './easing';

export declare type BrushType =
    | 'material'
    | 'ink'
    | 'felt-tip-marker'
    | 'beads'
    | 'flip-wiggle'
    | 'tangents'
    | 'filling-gaps'
    | 'splatter-points'
    | 'hatching'
    | 'spray';

export interface MaterialBrushOptions {
    img: CanvasImageSource;
    repeatMode: 'compact' | 'incompact-size' | 'incompact-fixed';
    minRandomOffset?: number;
    maxRandomOffset?: number;
    fixedOffset?: number;
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
    blendMode?: GlobalCompositeOperation;
    useHardLight?: boolean;
}

export interface UniqueBrushOptions {}

export interface BrushPotions {
    type: BrushType;
    size: number;
    simplifyPoints?: number;
    material?: MaterialBrushOptions;
    ink?: InkBrushOptions;
}
