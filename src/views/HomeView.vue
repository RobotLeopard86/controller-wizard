<script setup lang="ts">
import { FwbButton, FwbCheckbox } from "flowbite-vue";
import { useFileDialog } from "@vueuse/core";
import router from "@/router";
import { useStore } from "vuex";
import type { Instance } from "@/schema";

const { files, open, onChange } = useFileDialog({
    accept: 'text/json',
    directory: false
});

const store = useStore();

onChange(async (files) => {
    store.commit('manipulate', JSON.parse(await files?.item(0)?.text()!) as Instance);
    router.replace('/editor');
});

const newDiagram = () => {
    store.commit('manipulate', [] as Instance);
    router.replace('/editor');
}
</script>

<template>
    <div class="rounded-md bg-slate-800 py-4 px-6 flex flex-col items-center justify-center w-1/3 z-40">
        <img src="/favicon.ico" alt="Logo" class="w-1/3" />
        <h1 class="font-black text-3xl text-white text-center">Controller Wizard</h1>
        <FwbButton color="yellow" class="mt-4" @click="newDiagram">New Diagram</FwbButton>
        <FwbButton color="yellow" class="mt-4" @click="open">Open From File</FwbButton>
    </div>
    <span class="absolute left-0 bottom-0 text-white">Thanks to Michael Lesirge for assistance with controller
        exporting</span>
</template>
