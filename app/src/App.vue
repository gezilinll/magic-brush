<template>
    <div
        id="app"
        ref="container"
        style="position: absolute"
        @mousedown="startDrawing"
        @mousemove="drawing"
        @mouseup="stopDrawing"
    >
        <div class="buttons" style="position: absolute">
            <button
                v-for="(btn, index) in buttons"
                :key="index"
                :class="{ active: selectedButtonIndex === index }"
                @click="selectedButtonIndex = index"
                :style="{ backgroundImage: `url(${btn.img})` }"
            ></button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { BrushPotions, FreehandBrush } from 'magic-freehand';
import { Point } from 'magic-freehand/src/common/point';
import { onMounted, Ref, ref, watch } from 'vue';

const initPoint: Point = { x: 0, y: 0 };
let brush: FreehandBrush | null = null;
const options: BrushPotions = { type: 'color', color: '#666666', width: 8 };
const buttons = [
    { img: 'image1.png' },
    { img: 'image2.png' },
    { img: 'image3.png' },
    { img: 'image4.png' },
    { img: 'image5.png' },
    { img: 'image6.png' },
];
const selectedButtonIndex = ref(0);
const container: Ref<HTMLDivElement | null> = ref(null);

function startDrawing(event: MouseEvent) {
    brush = new FreehandBrush(options);
    initPoint.x = event.offsetX;
    initPoint.y = event.offsetY;
    brush.addPoint({ x: event.offsetX, y: event.offsetY });
    container.value!.appendChild(brush.canvas);
}

function drawing(event: MouseEvent) {
    if (!brush) {
        return;
    }
    brush.addPoint({ x: event.offsetX - initPoint.x, y: event.offsetY - initPoint.y });
    const result = brush.canvas;
    result.style.left = `${brush.left}px`;
    result.style.top = `${brush.top}px`;
    brush.draw();
}

function stopDrawing() {
    brush = null;
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
</style>
