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
                :class="{ active: selectedButton === index }"
                @click="selectButton(index)"
                :style="{ backgroundImage: `url(${btn.img})` }"
            ></button>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            isDrawing: false,
            context: null,
            lastX: 0,
            lastY: 0,
            selectedButton: null,
            buttons: [
                { img: 'image1.png' },
                { img: 'image2.png' },
                { img: 'image3.png' },
                { img: 'image4.png' },
                { img: 'image5.png' },
                { img: 'image6.png' },
            ],
        };
    },
    mounted() {
        const canvas = this.$refs.canvas;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        this.context = canvas.getContext('2d');
    },
    methods: {
        startDrawing(event) {
            this.isDrawing = true;
            this.lastX = event.offsetX;
            this.lastY = event.offsetY;
        },
        drawing(event) {
            if (!this.isDrawing) return;
            this.context.beginPath();
            this.context.moveTo(this.lastX, this.lastY);
            this.context.lineTo(event.offsetX, event.offsetY);
            this.context.stroke();
            this.lastX = event.offsetX;
            this.lastY = event.offsetY;
        },
        stopDrawing() {
            this.isDrawing = false;
        },
        selectButton(index) {
            this.selectedButton = index;
        },
    },
};
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
