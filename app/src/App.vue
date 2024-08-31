<template>
    <div id="app">
        <canvas
            ref="canvas"
            @mousedown="startDrawing"
            @mousemove="drawing"
            @mouseup="stopDrawing"
        ></canvas>
        <div class="buttons">
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
import { onMounted, Ref, ref, watch } from 'vue';

let brush: FreehandBrush | null = null;
const options: BrushPotions = { type: 'color', color: '#666666', width: 16 };
const buttons = [
    { img: 'image1.png' },
    { img: 'image2.png' },
    { img: 'image3.png' },
    { img: 'image4.png' },
    { img: 'image5.png' },
    { img: 'image6.png' },
];
const selectedButtonIndex = ref(0);
const canvas: Ref<HTMLCanvasElement | null> = ref(null);

function startDrawing(event: MouseEvent) {
    brush = new FreehandBrush(options);
    brush.addPoint({ x: event.offsetX, y: event.offsetY });
}

function drawing(event: MouseEvent) {
    if (!brush) {
        return;
    }
    brush.addPoint({ x: event.offsetX, y: event.offsetY });
    brush.draw(canvas.value!);
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

onMounted(() => {
    canvas.value!.width = window.innerWidth;
    canvas.value!.height = window.innerHeight;
});
</script>

<style>
#app {
    margin: 0;
    padding: 0;
    overflow: hidden;
    height: 100vh;
    width: 100vw;
    position: relative;
}

canvas {
    width: 100%;
    height: 100%;
    display: block;
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
