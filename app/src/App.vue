<template>
    <div
        id="app"
        style="position: absolute; background-color: rgb(233, 235, 237)"
        @mousedown="startDrawing"
        @mousemove="drawing"
        @mouseup="stopDrawing"
        @touchstart="
            (event) => {
                if (event.touches[0].pageX < 300 || isLoading) {
                    return;
                }
                startDrawing(event.touches[0]);
                event.preventDefault();
            }
        "
        @touchmove="
            (event) => {
                if (!isDrawing) {
                    return;
                }
                drawing(event.touches[0]);
                event.preventDefault();
            }
        "
        @touchend="
            (event) => {
                if (!isDrawing) {
                    return;
                }
                stopDrawing(event.touches[0]);
                event.preventDefault();
            }
        "
        @touchcancel="
            (event) => {
                if (!isDrawing) {
                    return;
                }
                stopDrawing(event.touches[0]);
                event.preventDefault();
            }
        "
    >
        <div ref="container" class="app"></div>
        <button
            style="
                position: absolute;
                right: 36px;
                bottom: 36px;
                box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.3);
            "
            @click="clear()"
        >
            Clear
        </button>
        <div
            class="control-container"
            :style="{
                pointerEvents: isDrawing ? 'none' : 'auto',
                userSelect: isDrawing ? 'none' : 'auto',
                height:
                    brushType === 'material'
                        ? isMaterialSupportColor
                            ? '630px'
                            : '530px'
                        : brushType === 'ink'
                        ? '660px'
                        : '410px',
            }"
        >
            <div class="buttons">
                <label>
                    <input type="radio" v-model="brushType" value="material" />
                    Material
                </label>
                <label>
                    <input type="radio" v-model="brushType" value="ink" />
                    Ink
                </label>
                <label>
                    <input type="radio" v-model="brushType" value="toy" />
                    Toy
                </label>
            </div>
            <div
                style="
                    width: 90%;
                    height: 1px;
                    background-color: black;
                    margin-top: 45px;
                    margin-left: 16px;
                "
            ></div>
            <div class="buttons" style="margin-top: 50px" v-if="brushType === 'material'">
                <button
                    v-for="(btn, index) in materialBrushStyles"
                    :key="index"
                    :class="{ active: selectedButtonIndex === index }"
                    @click="selectedButtonIndex = index"
                    :style="{ backgroundImage: `url(${btn.src})` }"
                ></button>
            </div>
            <div class="buttons" style="margin-top: 50px" v-if="brushType === 'ink'">
                <button
                    v-for="(btn, index) in inkBrushStyles"
                    :key="index"
                    :class="{ active: selectedButtonIndex === index }"
                    @click="selectedButtonIndex = index"
                    :style="{
                        backgroundImage:
                            index === 5
                                ? `linear-gradient(${fillColor}, ${fillColor})`
                                : `url(${btn.src})`,
                    }"
                ></button>
            </div>
            <div class="buttons" style="margin-top: 50px" v-if="brushType === 'toy'">
                <button
                    v-for="(btn, index) in toyBrushStyles"
                    :key="index"
                    :class="{ active: selectedButtonIndex === index }"
                    @click="selectedButtonIndex = index"
                    :style="{
                        backgroundImage: `url(${btn.src})`,
                    }"
                ></button>
            </div>
            <div
                :style="{
                    position: 'absolute',
                    marginTop: brushType === 'ink' ? '230px' : '450px',
                    marginLeft: '16px',
                }"
                v-if="brushType === 'ink' || isMaterialSupportColor"
            >
                <button
                    v-for="color in colors"
                    :key="color"
                    :class="['color-button', { selected: fillColor === color }]"
                    @click="fillColor = color"
                    :style="{ backgroundColor: color }"
                ></button>
            </div>
            <div
                style="position: absolute; margin-top: 300px; margin-left: 16px"
                v-if="brushType === 'ink' && selectedButtonIndex < 5"
            >
                <label for="blendMode">Blend Mode: </label>
                <select id="blendMode" v-model="blendMode">
                    <option value="linear">color</option>
                    <option value="color-burn">color-burn</option>
                    <option value="color-dodge">color-dodge</option>
                    <option value="copy">copy</option>
                    <option value="darken">darken</option>
                    <option value="destination-atop">destination-atop</option>
                    <option value="destination-in">destination-in</option>
                    <option value="destination-out">destination-out</option>
                    <option value="destination-over">destination-over</option>
                    <option value="difference">difference</option>
                    <option value="exclusion">exclusion</option>
                    <option value="hard-light">hard-light</option>
                    <option value="hue">hue</option>
                    <option value="lighten">lighten</option>
                    <option value="lighter">lighter</option>
                    <option value="luminosity">luminosity</option>
                    <option value="multiply">multiply</option>
                    <option value="overlay">overlay</option>
                    <option value="saturation">saturation</option>
                    <option value="screen">screen</option>
                    <option value="soft-light">soft-light</option>
                    <option value="source-atop">source-atop</option>
                    <option value="source-in">source-in</option>
                    <option value="source-out">source-out</option>
                    <option value="source-over">source-over</option>
                    <option value="xor">xor</option>
                </select>
            </div>
            <div
                :style="{
                    position: 'absolute',
                    marginTop:
                        brushType === 'material'
                            ? '260px'
                            : brushType === 'ink' && selectedButtonIndex < 5
                            ? '160px'
                            : '190px',
                }"
            >
                <div class="adjustments">
                    <div
                        :style="{
                            width: '90%',
                            height: '1px',
                            backgroundColor: 'black',
                            marginTop: isMaterialSupportColor ? '80px' : '10px',
                        }"
                    ></div>
                    <div
                        class="adjustment-control"
                        v-if="
                            brushType !== 'toy' &&
                            (brushType === 'ink' ||
                                materialBrushStyles[selectedButtonIndex].repeatMode === 'compact')
                        "
                    >
                        <label for="simplifyPoints">Simplify: </label>
                        <input
                            id="simplifyPoints"
                            type="range"
                            min="0.1"
                            max="10"
                            step="0.1"
                            v-model.number="simplifyPoints"
                        />
                        <span>{{ simplifyPoints }}</span>
                    </div>
                    <div class="adjustment-control">
                        <label for="size">Size: </label>
                        <input id="size" type="range" min="1" max="100" v-model.number="size" />
                        <span>{{ size }}</span>
                    </div>
                    <div
                        class="adjustment-control"
                        v-if="
                            brushType === 'material' &&
                            materialBrushStyles[selectedButtonIndex].repeatMode ===
                                'incompact-fixed'
                        "
                    >
                        <label for="size">Fixed Offset: </label>
                        <input
                            id="size"
                            type="range"
                            :min="1"
                            :max="10"
                            v-model.number="fixedOffset"
                        />
                        <span>{{ fixedOffset }}</span>
                    </div>
                    <div
                        class="adjustment-control"
                        v-if="
                            brushType === 'material' &&
                            materialBrushStyles[selectedButtonIndex].repeatMode === 'incompact-size'
                        "
                    >
                        <label for="size">Min Offset: </label>
                        <input
                            id="size"
                            type="range"
                            :min="-5"
                            :max="0"
                            v-model.number="minRandomOffset"
                        />
                        <span>{{ minRandomOffset }}</span>
                    </div>
                    <div
                        class="adjustment-control"
                        v-if="
                            brushType === 'material' &&
                            materialBrushStyles[selectedButtonIndex].repeatMode === 'incompact-size'
                        "
                    >
                        <label for="size">Max Offset: </label>
                        <input
                            id="size"
                            type="range"
                            min="0"
                            max="5"
                            v-model.number="maxRandomOffset"
                        />
                        <span>{{ maxRandomOffset }}</span>
                    </div>
                    <div class="adjustment-control" v-if="brushType === 'ink'">
                        <label for="thinning">Thinning: </label>
                        <input
                            id="thinning"
                            type="range"
                            min="-0.99"
                            max="0.99"
                            step="0.01"
                            v-model.number="thinning"
                        />
                        <span>{{ thinning }}</span>
                    </div>
                    <div class="adjustment-control" v-if="brushType === 'ink'">
                        <label for="streamline">Streamline: </label>
                        <input
                            id="streamline"
                            type="range"
                            min="0.01"
                            max="1"
                            step="0.01"
                            v-model.number="streamline"
                        />
                        <span>{{ streamline }}</span>
                    </div>
                    <div class="adjustment-control" v-if="brushType === 'ink'">
                        <label for="smoothing">Smoothing: </label>
                        <input
                            id="smoothing"
                            type="range"
                            min="0.01"
                            max="0.99"
                            step="0.01"
                            v-model.number="smoothing"
                        />
                        <span>{{ smoothing }}</span>
                    </div>
                    <div class="adjustment-control" v-if="brushType === 'ink'">
                        <label for="easing">Easing: </label>
                        <select id="easing" v-model="easing">
                            <option value="linear">Linear</option>
                            <option value="easeInQuad">EaseInQuad</option>
                            <option value="easeOutQuad">EaseOutQuad</option>
                            <option value="easeInOutQuad">EaseInOutQuad</option>
                            <option value="easeInCubic">EaseInCubic</option>
                            <option value="easeOutCubic">EaseOutCubic</option>
                            <option value="easeInOutCubic">EaseInOutCubic</option>
                            <option value="easeInQuart">EaseInQuart</option>
                            <option value="easeOutQuart">EaseOutQuart</option>
                            <option value="easeInOutQuart">EaseInOutQuart</option>
                            <option value="easeInQuint">EaseInQuint</option>
                            <option value="easeOutQuint">EaseOutQuint</option>
                            <option value="easeInOutQuint">EaseInOutQuint</option>
                            <option value="easeInSine">EaseInSine</option>
                            <option value="easeOutSine">EaseOutSine</option>
                            <option value="easeInOutSine">EaseInOutSine</option>
                            <option value="easeInExpo">EaseInExpo</option>
                            <option value="easeOutExpo">EaseOutExpo</option>
                            <option value="easeInOutExpo">EaseInOutExpo</option>
                        </select>
                    </div>
                    <div
                        style="width: 90%; height: 1px; background-color: black; margin-top: 10px"
                        v-if="brushType === 'ink'"
                    ></div>
                    <div class="adjustment-control" v-if="brushType === 'ink'">
                        <label for="taperStart">Taper Start: </label>
                        <input
                            id="taperStart"
                            type="range"
                            min="0"
                            max="100"
                            v-model.number="taperStart"
                        />
                        <span>{{ taperStart < 100 ? taperStart : true }}</span>
                    </div>
                    <div class="adjustment-control" v-if="brushType === 'ink' && taperStart === 0">
                        <label for="capStart">Cap Start: </label>
                        <input
                            type="checkbox"
                            id="capStart"
                            class="custom-checkbox"
                            v-model="capStart"
                        />
                    </div>
                    <div class="adjustment-control" v-if="brushType === 'ink' && taperStart !== 0">
                        <label for="easingStart">Easing Start: </label>
                        <select id="easingStart" v-model="easingStart">
                            <option value="linear">Linear</option>
                            <option value="easeInQuad">EaseInQuad</option>
                            <option value="easeOutQuad">EaseOutQuad</option>
                            <option value="easeInOutQuad">EaseInOutQuad</option>
                            <option value="easeInCubic">EaseInCubic</option>
                            <option value="easeOutCubic">EaseOutCubic</option>
                            <option value="easeInOutCubic">EaseInOutCubic</option>
                            <option value="easeInQuart">EaseInQuart</option>
                            <option value="easeOutQuart">EaseOutQuart</option>
                            <option value="easeInOutQuart">EaseInOutQuart</option>
                            <option value="easeInQuint">EaseInQuint</option>
                            <option value="easeOutQuint">EaseOutQuint</option>
                            <option value="easeInOutQuint">EaseInOutQuint</option>
                            <option value="easeInSine">EaseInSine</option>
                            <option value="easeOutSine">EaseOutSine</option>
                            <option value="easeInOutSine">EaseInOutSine</option>
                            <option value="easeInExpo">EaseInExpo</option>
                            <option value="easeOutExpo">EaseOutExpo</option>
                            <option value="easeInOutExpo">EaseInOutExpo</option>
                        </select>
                    </div>
                    <div
                        style="width: 90%; height: 1px; background-color: black; margin-top: 10px"
                        v-if="brushType === 'ink'"
                    ></div>
                    <div class="adjustment-control" v-if="brushType === 'ink'">
                        <label for="taperEnd">Taper End: </label>
                        <input
                            id="taperEnd"
                            type="range"
                            min="0"
                            max="100"
                            v-model.number="taperEnd"
                        />
                        <span>{{ taperEnd < 100 ? taperEnd : true }}</span>
                    </div>
                    <div class="adjustment-control" v-if="brushType === 'ink' && taperEnd === 0">
                        <label for="capEnd">Cap End: </label>
                        <input
                            type="checkbox"
                            id="capEnd"
                            class="custom-checkbox"
                            v-model="capEnd"
                        />
                    </div>
                    <div class="adjustment-control" v-if="brushType === 'ink' && taperEnd !== 0">
                        <label for="easingEnd">Easing End: </label>
                        <select id="easingEnd" v-model="easingEnd">
                            <option value="linear">Linear</option>
                            <option value="easeInQuad">EaseInQuad</option>
                            <option value="easeOutQuad">EaseOutQuad</option>
                            <option value="easeInOutQuad">EaseInOutQuad</option>
                            <option value="easeInCubic">EaseInCubic</option>
                            <option value="easeOutCubic">EaseOutCubic</option>
                            <option value="easeInOutCubic">EaseInOutCubic</option>
                            <option value="easeInQuart">EaseInQuart</option>
                            <option value="easeOutQuart">EaseOutQuart</option>
                            <option value="easeInOutQuart">EaseInOutQuart</option>
                            <option value="easeInQuint">EaseInQuint</option>
                            <option value="easeOutQuint">EaseOutQuint</option>
                            <option value="easeInOutQuint">EaseInOutQuint</option>
                            <option value="easeInSine">EaseInSine</option>
                            <option value="easeOutSine">EaseOutSine</option>
                            <option value="easeInOutSine">EaseInOutSine</option>
                            <option value="easeInExpo">EaseInExpo</option>
                            <option value="easeOutExpo">EaseOutExpo</option>
                            <option value="easeInOutExpo">EaseInOutExpo</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <span style="position: absolute; left: 40%; top: 40%; font-size: 66px" v-if="isLoading"
            >{{ loadingStatus }}
        </span>
    </div>
</template>

<script setup lang="ts">
import { throttle } from 'lodash';
import { BrushPotions, FreehandBrush, InkBrushOptions, MaterialBrushOptions } from 'magic-brush';
import { computed, onMounted, Ref, ref, watch } from 'vue';

declare type BrushElement = { brush: FreehandBrush; initLeft: number; initTop: number };

let elements: BrushElement[] = [];
let currentElement: BrushElement | null = null;
const brushType = ref('material');
const isLoading = ref(true);
const loadingStatus = ref('Loading...');
const isDrawing = ref(false);
const selectedButtonIndex = ref(0);
const simplifyPoints = ref(0.1);
const size = ref(36);
const container: Ref<HTMLDivElement | null> = ref(null);

// Material Brush
const materialBrushStyles: (MaterialBrushOptions & { src: string })[] = [
    { src: 'mb_style1.png', img: null!, repeatMode: 'compact' },
    { src: 'mb_style2.png', img: null!, repeatMode: 'compact' },
    { src: 'mb_style3.png', img: null!, repeatMode: 'compact' },
    { src: 'mb_style4.png', img: null!, repeatMode: 'incompact-fixed' },
    { src: 'mb_style5.png', img: null!, repeatMode: 'incompact-size' },
    { src: 'mb_style6.png', img: null!, repeatMode: 'incompact-size' },
    { src: 'mb_style7.png', img: null!, repeatMode: 'incompact-size' },
    { src: 'mb_style8.png', img: null!, repeatMode: 'compact' },
    { src: 'mb_style9.png', img: null!, repeatMode: 'compact' },
    { src: 'mb_style10.png', img: null!, repeatMode: 'incompact-size' },
    { src: 'mb_style11.png', img: null!, repeatMode: 'incompact-size' },
    { src: 'mb_style12.png', img: null!, repeatMode: 'incompact-size' },
    { src: 'mb_style13.png', img: null!, repeatMode: 'incompact-size' },
    { src: 'mb_style14.png', img: null!, repeatMode: 'incompact-size' },
    { src: 'mb_style15.png', img: null!, repeatMode: 'compact' },
];
const fixedOffset = ref(3);
const minRandomOffset = ref(-3);
const maxRandomOffset = ref(3);

// Ink Brush
const inkBrushStyles: {
    src: string;
    fillImg: CanvasImageSource;
    fillType: 'image' | 'color';
    useHardLight: boolean;
}[] = [
    { src: 'ib_style1.jpg', fillImg: null!, fillType: 'image', useHardLight: true },
    { src: 'ib_style2.jpg', fillImg: null!, fillType: 'image', useHardLight: true },
    { src: 'ib_style3.jpg', fillImg: null!, fillType: 'image', useHardLight: true },
    { src: 'ib_style4.jpg', fillImg: null!, fillType: 'image', useHardLight: true },
    { src: 'ib_style5.jpg', fillImg: null!, fillType: 'image', useHardLight: true },
    { src: '', fillImg: null!, fillType: 'color', useHardLight: false },
];
const blendMode = ref('hard-light');
const colors = ['#006994', '#FF4500', '#228B22', '#7851A9', '#FFB7C5'];
const fillColor = ref('#006994');
const thinning = ref(0.6);
const streamline = ref(0.5);
const smoothing = ref(0.5);
const easing = ref('linear');
const taperStart = ref(0);
const easingStart = ref('linear');
const capStart = ref(true);
const taperEnd = ref(0);
const easingEnd = ref('linear');
const capEnd = ref(true);

// Toy Brush
const toyBrushStyles: any[] = [
    { src: 'felt-tip-marker.jpg', type: 'felt-tip-marker' },
    { src: 'beads.jpg', type: 'beads' },
    { src: 'flip-wiggle.jpg', type: 'flip-wiggle' },
    { src: 'tangents.jpg', type: 'tangents' },
    { src: 'filling-gaps.jpg', type: 'filling-gaps' },
    { src: 'splatter-points.jpg', type: 'splatter-points' },
    { src: 'hatching.jpg', type: 'hatching' },
    { src: 'spray.jpg', type: 'spray' },
    { src: 'circles.jpg', type: 'circles' },
    { src: 'grid.jpg', type: 'grid' },
    { src: 'colored-pixels.jpg', type: 'colored-pixels' },
    { src: 'squares.jpg', type: 'squares' },
];
const isMaterialSupportColor = computed(() => {
    return (
        brushType.value === 'material' &&
        (selectedButtonIndex.value === 4 ||
            selectedButtonIndex.value === 5 ||
            selectedButtonIndex.value === 6 ||
            selectedButtonIndex.value === 9 ||
            selectedButtonIndex.value === 10 ||
            selectedButtonIndex.value === 11 ||
            selectedButtonIndex.value === 12 ||
            selectedButtonIndex.value === 13 ||
            selectedButtonIndex.value === 14)
    );
});

let options: BrushPotions = getOptions();

function getBrushOptions(): MaterialBrushOptions | InkBrushOptions | null {
    if (brushType.value === 'material') {
        return {
            ...materialBrushStyles[selectedButtonIndex.value],
            minRandomOffset: minRandomOffset.value,
            maxRandomOffset: maxRandomOffset.value,
            fixedOffset: fixedOffset.value,
            colorType: isMaterialSupportColor.value ? 'mask' : undefined,
            maskColor: isMaterialSupportColor.value ? fillColor.value : undefined,
        };
    } else if (brushType.value === 'ink') {
        return {
            fillType: inkBrushStyles[selectedButtonIndex.value].fillType,
            fillColor: fillColor.value,
            fillImg: inkBrushStyles[selectedButtonIndex.value].fillImg,
            blendMode: blendMode.value,
            fillSize: size.value,
            thinning: thinning.value,
            smoothing: smoothing.value,
            simplifyPoints: simplifyPoints.value,
            easing: easing.value,
            start: {
                cap: capStart.value,
                taper: taperStart.value === 100 ? true : taperStart.value,
                easing: easingStart.value,
            },
            end: {
                cap: capEnd.value,
                taper: taperEnd.value === 100 ? true : taperEnd.value,
                easing: easingEnd.value,
            },
        } as InkBrushOptions;
    }
    return null;
}

function getOptions() {
    const fillOptions = getBrushOptions();
    return {
        type:
            brushType.value === 'toy'
                ? toyBrushStyles[selectedButtonIndex.value].type
                : brushType.value,
        size: size.value,
        simplifyPoints: simplifyPoints.value,
        material: brushType.value === 'material' ? fillOptions : undefined,
        ink: brushType.value === 'ink' ? fillOptions : undefined,
    } as BrushPotions;
}

function startDrawing(event: MouseEvent | Touch) {
    if (event.pageX < 300 || isLoading.value) {
        return;
    }
    isDrawing.value = true;
    currentElement = {
        brush: new FreehandBrush(options),
        initLeft: event.pageX,
        initTop: event.pageY,
    };
    elements.push(currentElement);
    currentElement.brush.canvas.style.position = 'absolute';
    container.value!.appendChild(currentElement.brush.canvas);
    if (event instanceof MouseEvent) {
        event.preventDefault();
    }
}

const drawBrush = throttle((element: BrushElement, x: number, y: number) => {
    element.brush.addPoint({
        x,
        y,
    });
    const result = element!.brush.canvas;
    result.style.left = `${element.initLeft + element.brush.left}px`;
    result.style.top = `${element.initTop + element.brush.top}px`;
    element.brush.draw();
}, 10);
async function drawing(event: MouseEvent | Touch) {
    if (!isDrawing.value) {
        return;
    }
    drawBrush(
        currentElement!,
        event.pageX - currentElement!.initLeft,
        event.pageY - currentElement!.initTop
    );
    if (event instanceof MouseEvent) {
        event.preventDefault();
    }
}

function stopDrawing(event: MouseEvent | Touch) {
    currentElement = null;
    isDrawing.value = false;
    if (event instanceof MouseEvent) {
        event.preventDefault();
    }
}

function clear() {
    elements.forEach((element) => {
        container.value!.removeChild(element.brush.canvas);
    });
    elements = [];
}

watch(
    () => selectedButtonIndex.value,
    () => {
        if (
            brushType.value === 'toy' &&
            (selectedButtonIndex.value === 3 ||
                selectedButtonIndex.value === 5 ||
                selectedButtonIndex.value === 7)
        ) {
            size.value = 8;
        }
        if (brushType.value === 'toy' && selectedButtonIndex.value === 6) {
            size.value = 1;
        }
        options = getOptions();
    },
    { immediate: true }
);

watch(
    () => [
        simplifyPoints.value,
        size.value,
        thinning.value,
        fillColor.value,
        minRandomOffset.value,
        maxRandomOffset.value,
        blendMode.value,
        streamline.value,
        smoothing.value,
        fixedOffset.value,
        easing.value,
        taperStart.value,
        capStart.value,
        easingStart.value,
        taperEnd.value,
        capEnd.value,
        easingEnd.value,
    ],
    () => {
        options = getOptions();
    }
);

watch(
    () => [brushType.value],
    () => {
        selectedButtonIndex.value = 0;
        options = getOptions();
    }
);

let loadedIndex = 0;
let animationId = 0;
const totalLoadCount = materialBrushStyles.length + inkBrushStyles.length + toyBrushStyles.length;
function updateLoadingStatus() {
    loadingStatus.value = 'Loading...' + ((loadedIndex / totalLoadCount) * 100).toFixed(2) + '%';
    animationId = requestAnimationFrame(updateLoadingStatus);
}

onMounted(async () => {
    animationId = requestAnimationFrame(updateLoadingStatus);

    const loadImage = (src: string) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src;

            img.onload = () => resolve(img);
            img.onerror = reject;
        });
    };

    const loadMaterialPromises = materialBrushStyles.map(async (style) => {
        try {
            const result = await loadImage(style.src);
            if (result) {
                style.img = result as CanvasImageSource;
            }
        } catch (error) {
            console.error(`Failed to load image: ${style.src}`);
        } finally {
            loadedIndex++;
        }
    });
    const loadInkPromises = inkBrushStyles.map(async (style) => {
        try {
            const result = await loadImage(style.src);
            if (result) {
                style.fillImg = result as CanvasImageSource;
            }
        } catch (error) {
            console.error(`Failed to load image: ${style.src}`);
        } finally {
            loadedIndex++;
        }
    });
    const loadToyPromises = toyBrushStyles.map(async (style) => {
        try {
            await loadImage(style.src);
        } catch (error) {
            console.error(`Failed to load image: ${style.src}`);
        } finally {
            loadedIndex++;
        }
    });
    await Promise.all(loadMaterialPromises);
    await Promise.all(loadInkPromises);
    await Promise.all(loadToyPromises);

    cancelAnimationFrame(animationId);
    options = getOptions();
    isLoading.value = false;
});
</script>

<style>
#app {
    margin: 0;
    padding: 0;
    overflow: hidden;
    height: 100vh;
    width: 100vw;
    position: absolute;
}

.control-container {
    position: absolute;
    top: 16px;
    left: 16px;
    display: flex;
    flex-wrap: wrap;
    width: 300px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.3);
    background-color: white;
    opacity: 0.7;
}

.buttons {
    position: absolute;
    top: 16px;
    left: 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    width: 212px; /* 3 buttons * 60px + 2 gaps * 16px */
}

button {
    width: 60px;
    height: 60px;
    background-size: cover;
    background-position: center;
    border: 2px solid transparent;
    cursor: pointer;
    outline: none;
}

button.active {
    border-color: blue;
}

.adjustments {
    position: absolute;
    flex-direction: column;
    gap: 8px;
    width: 300px;
    margin-left: 16px;
    margin-top: 168px;
    pointer-events: none;
}

.adjustment-control {
    display: flex;
    align-items: center;
    padding-top: 8px;
    margin-right: 32px;
    pointer-events: auto;
}

.adjustment-control label {
    margin-right: 4px;
}

input[type='range'] {
    flex: 1;
    margin-right: 8px;
}

select {
    flex: 1;
}

.custom-checkbox {
    appearance: none;
    width: 20px;
    height: 20px;
    border: 2px solid #007bff;
    border-radius: 4px;
    position: relative;
    cursor: pointer;
    outline: none;
}

.custom-checkbox:checked {
    background-color: #007bff;
    border-color: #007bff;
}

.color-picker {
    display: flex;
    flex-direction: row;
    padding-left: 16px;
    margin-top: 10px;
    height: 70px;
}

.color-button {
    width: 50px;
    height: 50px;
    border: 2px solid transparent;
    cursor: pointer;
    transition: border-color 0.3s ease;
}

.color-button.selected {
    border-color: #000; /* 选中按钮的边框颜色 */
}
</style>
