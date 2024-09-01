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
                <div class="size-control">
                    <label for="size">Size: </label>
                    <input id="size" type="range" min="1" max="100" v-model="size" />
                    <span>{{ size }}</span>
                </div>
                <div class="easing-control">
                    <label for="easing">Easing: </label>
                    <select id="easing" v-model="easing">
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
import { Point } from 'magic-freehand';
import { onMounted, Ref, ref, watch } from 'vue';

const isDrawing = ref(false);
const initPoint: Point = { x: 0, y: 0 };
let brush: FreehandBrush | null = null;
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
const size = ref(10);
const easing = ref('linear');
const container: Ref<HTMLDivElement | null> = ref(null);

function startDrawing(event: MouseEvent) {
    if (event.offsetX < 270) {
        return;
    }
    isDrawing.value = true;
    brush = new FreehandBrush(options);
    initPoint.x = event.offsetX;
    initPoint.y = event.offsetY;
    brush.addPoint({ x: event.offsetX, y: event.offsetY });
    container.value!.appendChild(brush.canvas);
}

async function drawing(event: MouseEvent) {
    if (!brush) {
        return;
    }
    brush.addPoint({ x: event.offsetX - initPoint.x, y: event.offsetY - initPoint.y });
    const result = brush.canvas;
    result.style.left = `${brush.left}px`;
    result.style.top = `${brush.top}px`;
    await brush.draw();
}

function stopDrawing() {
    brush = null;
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

onMounted(() => {});
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
    width: 245px;
    height: 500px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.3);
    background-color: white;
    opacity: 0.8;
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
    width: 212px;
    margin-top: 200px;
}

.size-control,
.easing-control {
    display: flex;
    align-items: center;
}

.size-control label,
.easing-control label {
    margin-right: 8px;
}

input[type='range'] {
    flex: 1;
    margin-right: 8px;
}

select {
    flex: 1;
}
</style>
