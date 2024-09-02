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
            }"
        >
            <div class="buttons">
                <button
                    v-for="(btn, index) in buttons"
                    :key="index"
                    :class="{ active: selectedButtonIndex === index }"
                    @click="selectedButtonIndex = index"
                    :style="{ backgroundImage: `url(${btn.img})` }"
                ></button>
            </div>
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
                    <input id="size" type="range" min="1" max="30" v-model.number="size" />
                    <span>{{ size }}</span>
                </div>
                <div class="adjustment-control">
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
                <div class="adjustment-control">
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
                <div class="adjustment-control">
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
                <div class="adjustment-control">
                    <label for="easing">Easing: </label>
                    <select id="easing" v-model="easing">
                        <option value="linear">Linear</option>
                        <option value="easeInQuad">EaseInQuad</option>
                    </select>
                </div>
                <div
                    style="width: 90%; height: 1px; background-color: black; margin-top: 10px"
                ></div>
                <div class="adjustment-control">
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
                <div class="adjustment-control" v-if="taperStart === 0">
                    <label for="capStart">Cap Start: </label>
                    <input
                        type="checkbox"
                        id="capStart"
                        class="custom-checkbox"
                        v-model="capStart"
                    />
                </div>
                <div class="adjustment-control" v-if="taperStart !== 0">
                    <label for="easingStart">Easing Start: </label>
                    <select id="easingStart" v-model="easingStart">
                        <option value="linear">Linear</option>
                        <option value="easeInQuad">EaseInQuad</option>
                    </select>
                </div>
                <div
                    style="width: 90%; height: 1px; background-color: black; margin-top: 10px"
                ></div>
                <div class="adjustment-control">
                    <label for="taperEnd">Taper End: </label>
                    <input id="taperEnd" type="range" min="0" max="100" v-model.number="taperEnd" />
                    <span>{{ taperEnd < 100 ? taperEnd : true }}</span>
                </div>
                <div class="adjustment-control" v-if="taperEnd === 0">
                    <label for="capEnd">Cap End: </label>
                    <input type="checkbox" id="capEnd" class="custom-checkbox" v-model="capEnd" />
                </div>
                <div class="adjustment-control" v-if="taperEnd !== 0">
                    <label for="easingEnd">Easing Start: </label>
                    <select id="easingEnd" v-model="easingEnd">
                        <option value="linear">Linear</option>
                        <option value="easeInQuad">EaseInQuad</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { BrushPotions, FreehandBrush } from 'magic-freehand';
import { Ref, ref, watch } from 'vue';

declare type BrushElement = { brush: FreehandBrush; initLeft: number; initTop: number };

const elements: BrushElement[] = [];
let currentElement: BrushElement | null = null;
const isDrawing = ref(false);
const options: BrushPotions = { type: 'color', color: '#000000', width: 16 };
const buttons = [
    { img: 'image1.png' },
    { img: 'image2.png' },
    { img: 'image3.png' },
    { img: 'image4.png' },
    { img: 'image5.png' },
    { img: 'image6.png' },
];
const selectedButtonIndex = ref(0);
const simplifyPoints = ref(1);
const size = ref(10);
const thinning = ref(0.7);
const streamline = ref(0.5);
const smoothing = ref(0.5);
const easing = ref('linear');
const taperStart = ref(0);
const easingStart = ref('linear');
const capStart = ref(false);
const taperEnd = ref(0);
const easingEnd = ref('linear');
const capEnd = ref(false);
const container: Ref<HTMLDivElement | null> = ref(null);

function startDrawing(event: MouseEvent) {
    if (event.offsetX < 300) {
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

async function drawing(event: MouseEvent) {
    if (!isDrawing.value) {
        return;
    }
    currentElement!.brush.addPoint({
        x: event.offsetX - currentElement!.initLeft,
        y: event.offsetY - currentElement!.initTop,
    });
    const result = currentElement!.brush.canvas;
    result.style.left = `${currentElement!.initLeft + currentElement!.brush.left}px`;
    result.style.top = `${currentElement!.initTop + currentElement!.brush.top}px`;
    await currentElement!.brush.draw();
}

function stopDrawing() {
    currentElement = null;
    isDrawing.value = false;
}

watch(
    () => selectedButtonIndex.value,
    () => {
        if (selectedButtonIndex.value === 0) {
            const img = new Image();
            img.src = buttons[selectedButtonIndex.value].img;
            img.onload = () => {
                options.type = 'image';
                options.image = img;
            };
        }
    },
    { immediate: true }
);

function refreshElements() {}
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
    height: 500px;
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
