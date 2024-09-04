<template>
    <div
        id="app"
        style="position: absolute; background-color: rgb(248, 249, 250)"
        @mousedown="startDrawing"
        @mousemove="drawing"
        @mouseup="stopDrawing"
    >
        <div ref="container" class="app"></div>
        <div
            class="control-container"
            :style="{
                pointerEvents: isDrawing ? 'none' : 'auto',
                userSelect: isDrawing ? 'none' : 'auto',
                height: brushType === 'material' ? '300px' : '550px',
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
                    :style="{ backgroundImage: `url(${btn.src})` }"
                ></button>
            </div>
            <div style="position: absolute; margin-top: 120px">
                <div class="adjustments">
                    <div
                        style="width: 90%; height: 1px; background-color: black; margin-top: 10px"
                    ></div>
                    <div class="adjustment-control">
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
    </div>
</template>

<script setup lang="ts">
import { throttle } from 'lodash';
import { BrushPotions, FreehandBrush, InkBrushOptions, MaterialBrushOptions } from 'magic-freehand';
import { onMounted, Ref, ref, watch } from 'vue';

declare type BrushElement = { brush: FreehandBrush; initLeft: number; initTop: number };

const elements: BrushElement[] = [];
let currentElement: BrushElement | null = null;
const brushType = ref('material');
const isLoading = ref(true);
const isDrawing = ref(false);
const selectedButtonIndex = ref(0);
const simplifyPoints = ref(0.5);
const size = ref(16);
const container: Ref<HTMLDivElement | null> = ref(null);

// Material Brush
const materialBrushStyles: (MaterialBrushOptions & { src: string })[] = [
    { src: 'mb_style1.png', img: null!, stackRepeat: true },
    { src: 'mb_style2.png', img: null!, stackRepeat: true },
    { src: 'mb_style3.png', img: null!, stackRepeat: false },
    { src: 'mb_style4.png', img: null!, stackRepeat: true },
    { src: 'mb_style5.png', img: null!, stackRepeat: false },
    { src: 'mb_style6.png', img: null!, stackRepeat: false },
    { src: 'mb_style7.png', img: null!, stackRepeat: false },
];

// Ink Brush
const inkBrushStyles: { src: string; fillImg: CanvasImageSource; fillType: 'image' | 'color' }[] = [
    { src: 'ib_style1.jpg', fillImg: null!, fillType: 'image' },
    { src: 'ib_style2.jpg', fillImg: null!, fillType: 'image' },
    { src: 'ib_style3.jpg', fillImg: null!, fillType: 'image' },
    { src: 'ib_style4.jpg', fillImg: null!, fillType: 'image' },
];
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

let options: BrushPotions = getOptions();

function getBrushOptions(): MaterialBrushOptions | InkBrushOptions {
    if (brushType.value === 'material') {
        return materialBrushStyles[selectedButtonIndex.value] as MaterialBrushOptions;
    } else {
        return {
            fillType: 'image',
            fillColor: '#000000',
            fillImage: inkBrushStyles[selectedButtonIndex.value].fillImg,
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
}

function getOptions() {
    const fillOptions = getBrushOptions();
    return {
        type: brushType.value,
        size: size.value,
        simplifyPoints: simplifyPoints.value,
        material: brushType.value === 'material' ? fillOptions : undefined,
        ink: brushType.value === 'ink' ? fillOptions : undefined,
    } as BrushPotions;
}

function startDrawing(event: MouseEvent) {
    if (event.offsetX < 300 || isLoading.value) {
        return;
    }
    isDrawing.value = true;
    currentElement = {
        brush: new FreehandBrush(options),
        initLeft: event.offsetX,
        initTop: event.offsetY,
    };
    elements.push(currentElement);
    currentElement.brush.canvas.style.position = 'absolute';
    container.value!.appendChild(currentElement.brush.canvas);
}

const drawBrush = throttle((element: BrushElement, x: number, y: number) => {
    element.brush.addPoint({
        x,
        y,
    });
    const result = element!.brush.canvas;
    result.style.left = `${element.initLeft + element.brush.left}px`;
    result.style.top = `${element.initTop + element.brush.top}px`;
    currentElement!.brush.draw();
}, 20);
async function drawing(event: MouseEvent) {
    if (!isDrawing.value) {
        return;
    }
    drawBrush(
        currentElement!,
        event.offsetX - currentElement!.initLeft,
        event.offsetY - currentElement!.initTop
    );
}

function stopDrawing() {
    currentElement = null;
    isDrawing.value = false;
}

watch(
    () => selectedButtonIndex.value,
    () => {
        options = getOptions();
    },
    { immediate: true }
);

watch(
    () => [
        simplifyPoints.value,
        size.value,
        thinning.value,
        streamline.value,
        smoothing.value,
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
        elements.forEach(async (element) => {
            element.brush.updateOptions(options);
            const result = element!.brush.canvas;
            result.style.left = `${element!.initLeft + element!.brush.left}px`;
            result.style.top = `${element!.initTop + element!.brush.top}px`;
            await element!.brush.draw();
        });
    }
);

watch(
    () => [brushType.value],
    () => {
        selectedButtonIndex.value = 0;
    }
);

onMounted(async () => {
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
        }
    });
    await Promise.all(loadMaterialPromises);
    await Promise.all(loadInkPromises);

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
}

.adjustment-control {
    display: flex;
    align-items: center;
    padding-top: 8px;
    margin-right: 32px;
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
</style>
