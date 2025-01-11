<script setup lang="ts">
import { FwbButton, FwbInput, FwbModal } from "flowbite-vue";
import { useFileDialog } from "@vueuse/core";
import router from "@/router";
import { useStore } from "vuex";
import type { Instance } from "@/schema";
import { ref, computed, type Ref, type ComputedRef } from "vue";

const { files, open, onChange } = useFileDialog({
    accept: 'text/json',
    directory: false
});

const store = useStore();

const showNewDialog: Ref<boolean> = ref(false);
const newProj: Ref<string> = ref("");
const cannotMakeProj: ComputedRef<boolean> = computed(() => newProj.value.length <= 0);

onChange(async (files) => {
    store.commit('manipulate', JSON.parse(await files?.item(0)?.text()!) as Instance);
    router.replace('/editor');
});

const newDiagram = () => {
    store.commit('manipulate', { name: newProj.value, real: true, schemes: [] } as Instance);
    router.replace('/editor');
}
</script>

<template>
    <!-- Creation dialog -->
    <FwbModal v-if="showNewDialog" @close="() => showNewDialog = false" size="sm">
        <template #header>
            <h1 class="text-white text-3xl font-bold">Create Project</h1>
        </template>
        <template #body>
            <span class="text-white">Name your project to continue.</span>
        </template>
        <template #footer>
            <div class="grid grid-cols-3 gap-4">
                <FwbInput v-model="newProj" class="col-span-2" placeholder="Enter new project name here">
                </FwbInput>
                <FwbButton color="blue" v-bind:disabled="cannotMakeProj" @click="newDiagram">Create</FwbButton>
            </div>
        </template>
    </FwbModal>

    <div class="rounded-md bg-slate-800 py-4 px-6 flex flex-col items-center justify-center w-1/3 z-40">
        <img src="/favicon.ico" alt="Logo" class="w-1/3" />
        <h1 class="font-black text-3xl text-white text-center">Controller Wizard</h1>
        <FwbButton color="yellow" class="mt-4" @click="() => showNewDialog = true">New Project</FwbButton>
        <FwbButton color="yellow" class="mt-4" @click="open">Open Project From File</FwbButton>
    </div>
    <span class="absolute left-0 bottom-0 text-white">Thanks to Michael Lesirge for assistance with controller
        exporting</span>
</template>
