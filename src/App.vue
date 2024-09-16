<script setup lang="ts">
import { RouterView } from 'vue-router';
import type { ISourceOptions } from "@tsparticles/engine";

const options: ISourceOptions = {
    particles: {
        number: {
            value: 125,
        },
        links: {
            distance: 125,
            enable: true,
            triangles: {
                enable: true,
                opacity: 0,
            },
        },
        move: {
            enable: true,
            speed: 1.5,
        },
        size: {
            value: 1,
        },
        shape: {
            type: "circle",
        },
    },
};
</script>

<template>
    <vue-particles id="tsparticles" :options="options" />
    <div class="w-screen min-h-screen bg-black flex items-center justify-center -z-50" id="bg">
        <RouterView />
    </div>
</template>
