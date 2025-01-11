<script setup lang="ts">
import { useStore } from "vuex";
import { computed, onMounted, ref, type ComputedRef, type Ref } from "vue";
import { FwbDropdown, FwbListGroup, FwbListGroupItem, FwbButton, FwbModal, FwbInput, FwbNavbar } from "flowbite-vue";
import type { Button, Instance, Mapping, Scheme } from "@/schema";
import router from "@/router";
import fileSaver from "file-saver";
import { exportProject } from "@/exporter";
import { validateLocaleAndSetLanguage } from "typescript";

const store = useStore();

const data: ComputedRef<Instance> = computed(() => store.state.value);

const showManageDialog: Ref<boolean> = ref(false);
const showExitDialog: Ref<boolean> = ref(false);
const showExportDialog: Ref<boolean> = ref(false);

const selectedTrigger: Ref<string> = ref("NONE");
const controller: ComputedRef<string> = computed(() => import.meta.env.BASE_URL + "controllers/" + selectedTrigger.value.replace(/\s+/g, '-').toLowerCase() + ".png");

const selectedScheme: Ref<Scheme> = ref({ name: 'NO SCHEME', mappings: [] });
const isNullScheme: ComputedRef<boolean> = computed(() => selectedScheme.value.name === 'NO SCHEME');

const kebabTrigger = (trigger: Button): string => {
	return trigger.replace(/\s+/g, '-').toLowerCase();
}

const getTriggerIndexInScheme = (trigger: Button, trigger2: Button): number => {
	return selectedScheme.value.mappings.findIndex((val) => {
		return val.trigger == trigger && val.trigger2 == trigger2;
	});
}

const hidemdiag = () => {
	if (data.value.schemes.length === 0) {
		selectedScheme.value = { name: 'NO SCHEME', mappings: [] };
	} else if (isNullScheme.value) {
		selectedScheme.value = data.value.schemes[0];
	}
	showManageDialog.value = false;
}

const newSchemeName: Ref<string> = ref("");

onMounted(() => {
	if (data.value == undefined || data.value == null || !data.value.real || !(data.value as Instance).schemes.forEach) {
		exit();
	}
	if (data.value.schemes.length > 0) {
		selectedScheme.value = data.value.schemes[0];
		setTimeout(() => {
			selectedTrigger.value = 'Kangaroo';
			setTimeout(() => {
				selectedTrigger.value = 'NONE';
			}, 5);
		}, 5);
	} else {
		showManageDialog.value = true;
	}
})

const canMakeNewScheme = () => {
	let foundExisting: boolean = false;
	const inst = data.value as Instance;
	inst.schemes.forEach(element => {
		foundExisting = newSchemeName.value === element.name;
	});
	return !foundExisting && newSchemeName.value !== "" && newSchemeName.value !== undefined
};
const makeSchemeOK: ComputedRef<boolean> = computed(() => !canMakeNewScheme());

const addScheme = () => {
	let s: Scheme = {
		name: newSchemeName.value,
		mappings: []
	};
	let mod = data.value;
	mod.schemes.push(s);
	store.commit('manipulate', mod);
	newSchemeName.value = "";
}

const rmScheme = (scheme: string) => {
	let mod = data.value.schemes.filter((val) => {
		return val.name !== scheme;
	});
	store.commit('manipulate', mod);
}

const rmMapping = (trigger: Button, trigger2: Button) => {
	let mod = selectedScheme.value.mappings.filter((val) => {
		return val.trigger !== trigger || (val.trigger === trigger && val.trigger2 != trigger2);
	});
	console.log(mod);
	selectedScheme.value.mappings = mod;
	data.value.schemes.forEach((val, i) => {
		if (val.name === selectedScheme.value.name) {
			data.value.schemes[i] = selectedScheme.value;
		}
	});
}

const saveToJson = () => {
	let b: Blob = new Blob([JSON.stringify(data.value)]);
	fileSaver.saveAs(b, "project.json");
	showExportDialog.value = false;
}

const getOkTriggers = () => {
	const vals = ['A', 'B', 'X', 'Y', 'Left Trigger', 'Left Button', 'Right Trigger',
		'Right Button', 'Back', 'Start', 'Left Stick X', 'Left Stick Y', 'Right Stick X', 'Right Stick Y', 'Left Stick Press', 'Right Stick Press',
		'D-Pad Left', 'D-Pad Right', 'D-Pad Up', 'D-Pad Down'] as Button[];
	return vals;
}

const getOkComboTriggers = (base: Button) => {
	let vals: Button[] = ['A', 'B', 'X', 'Y', 'Left Trigger', 'Left Button', 'Right Trigger',
		'Right Button', 'Back', 'Start', 'Left Stick X', 'Left Stick Y', 'Right Stick X', 'Right Stick Y', 'Left Stick Press', 'Right Stick Press',
		'D-Pad Left', 'D-Pad Right', 'D-Pad Up', 'D-Pad Down'].filter((val) => val != base) as Button[];
	return vals.filter((val) => {
		return selectedScheme.value.mappings.filter((val2) => {
			return val2.trigger == base && val2.trigger2 === val;
		}).length === 0;
	});
}

const newMapTrigger: Ref<Button> = ref('A');
const newMapTriggerDisplay: ComputedRef<string> = computed(() => {
	if (isNullScheme.value) return "<None>";
	if (getOkTriggers().includes(newMapTrigger.value)) return newMapTrigger.value;
	return "<None>";
});
const newMapTrigger2: Ref<Button> = ref('A');
const newMapTrigger2Display: ComputedRef<string> = computed(() => {
	if (isNullScheme.value) return "Nothing";
	if (getOkComboTriggers(newMapTrigger.value).includes(newMapTrigger2.value)) return newMapTrigger2.value;
	return "Nothing";
});
const newMapLabel: Ref<string> = ref('');

const addMapping = () => {
	const m: Mapping = {
		action: newMapLabel.value,
		trigger: newMapTrigger.value,
		trigger2: newMapTrigger2.value
	};
	let mod = selectedScheme.value.mappings;
	mod.push(m);
	selectedScheme.value.mappings = mod;
	data.value.schemes.forEach((val, i) => {
		if (val.name === selectedScheme.value.name) {
			data.value.schemes[i] = selectedScheme.value;
		}
	});
	newMapTrigger.value = getOkTriggers()[0];
	newMapTrigger2.value = newMapTrigger.value;
	newMapLabel.value = "";
}

const exit = async () => {
	store.commit('manipulate', { name: "", real: false, schemes: [] } as Instance);
	await router.replace('/');
	window.location.reload();
}

const onLeaveActionInput = (trigger: Button, trigger2: Button) => {
	selectedTrigger.value = 'NONE';
	console.log('Scanning for ' + "input_" + kebabTrigger(trigger) + "_" + kebabTrigger(trigger2));
	const e = document.querySelector("input.input_" + kebabTrigger(trigger) + "_" + kebabTrigger(trigger2))! as HTMLInputElement;
	console.log(e);
	selectedScheme.value.mappings[getTriggerIndexInScheme(trigger, trigger2)].action = e.value;
	console.log("Set to " + e.value);
}

const newMapOK = computed(() => getOkTriggers().length > 0 && getOkComboTriggers(newMapTrigger.value).length > 0);
const exportNotOK = computed(() => data.value.schemes.length < 1);
</script>

<template>
	<!-- Exit dialog -->
	<FwbModal v-if="showExitDialog" @close="() => showExitDialog = false">
		<template #header>
			<h1 class="text-white text-3xl font-bold">Exit Confirmation</h1>
		</template>
		<template #body>
			<span class="text-white">
				Are you sure you want to exit the editor?
				<br />
				Any unsaved changes will be lost.
			</span>
		</template>
		<template #footer>
			<div class="h-full grid grid-cols-3 gap-2">
				<div class="grid justify-items-start">
					<FwbButton color="red" @click="exit">Exit</FwbButton>
				</div>
				<div class="grid justify-items-end col-start-3">
					<FwbButton color="blue" @click="() => { showExitDialog = false; showExportDialog = true; }">Save
					</FwbButton>
				</div>
			</div>
		</template>
	</FwbModal>

	<!-- Save dialog -->
	<FwbModal v-if="showExportDialog" @close="() => showExportDialog = false" size="sm">
		<template #header>
			<h1 class="text-white text-3xl font-bold">Save Diagram</h1>
		</template>
		<template #body>
			<p class="text-white text-center">
				Choose how you want to save the diagram
			</p>
		</template>
		<template #footer>
			<div class="h-full grid grid-cols-2 gap-2">
				<div class="grid justify-items-start">
					<FwbButton color="blue" @click="saveToJson">Save Project File</FwbButton>
				</div>
				<div class="grid justify-items-end">
					<FwbButton color="blue" v-bind:disabled="exportNotOK"
						@click="() => { exportProject(data); showExportDialog = false; }">Export as PNG</FwbButton>
				</div>
			</div>
		</template>
	</FwbModal>

	<!-- Scheme manager dialog -->
	<FwbModal v-if="showManageDialog" @close="hidemdiag">
		<template #header>
			<h1 class="text-white text-3xl font-bold">Manage Schemes</h1>
		</template>
		<template #body>
			<FwbListGroup class="min-w-full">
				<FwbListGroupItem v-for="scheme in data.schemes" class="grid grid-cols-3 gap-3">
					<div><span>{{ scheme.name }}</span></div>
					<div class="col-span-2 flex items-center justify-end">
						<svg @click="() => rmScheme(scheme.name)" class="w-6 h-6 text-red-500" aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
							<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
								d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z" />
						</svg>
					</div>
				</FwbListGroupItem>
			</FwbListGroup>
		</template>
		<template #footer>
			<div class="grid grid-cols-4 gap-4">
				<FwbInput v-model="newSchemeName" class="col-span-3" placeholder="Enter new scheme name here">
				</FwbInput>
				<FwbButton color="blue" v-bind:disabled="makeSchemeOK" @click="addScheme">Add Scheme</FwbButton>
			</div>
		</template>
	</FwbModal>

	<!-- Main content -->
	<div class="flex flex-col min-h-screen min-w-full overflow-hidden">
		<FwbNavbar class="sticky max-w-full z-40 top-0 p-0 m-0 bg-slate-900">
			<template #logo>
				<div class="grid grid-cols-1 grid-rows-2">
					<span class="text-white">Selected: {{ selectedScheme.name }}</span>
					<FwbDropdown placement="bottom" text="Schemes">
						<FwbListGroup>
							<FwbListGroupItem v-for="scheme in data.schemes" @click="() => {
								data.schemes.forEach(s => {
									if (s.name === scheme.name) selectedScheme = s;
								});
							}">
								<span>{{ scheme.name }}</span>
							</FwbListGroupItem>
							<FwbListGroupItem>
								<span @click="() => showManageDialog = true">Manage Schemes</span>
							</FwbListGroupItem>
						</FwbListGroup>
					</FwbDropdown>
				</div>
			</template>
			<template #default>
				<span class="text-white font-extrabold text-3xl">{{ data.name }}</span>
			</template>
			<template #right-side>
				<FwbButton color="blue" @click="() => showExportDialog = true">Save Diagram</FwbButton>
				<span>&nbsp;&nbsp;&nbsp;</span>
				<FwbButton color="red" @click="() => showExitDialog = true">Exit Editor</FwbButton>
			</template>
		</FwbNavbar>
		<div class="grid h-[calc(100vh-72px)]" v-if="selectedScheme.name != 'NO SCHEME'">
			<main class="w-full flex flex-row overscroll-contain container box-border">
				<div class="overflow-hidden flex flex-col items-center w-1/2 place-items-center container aspect-auto">
					<img v-bind:src="controller" alt="Controller" class="fixed" />
				</div>
				<!-- Main UI section -->
				<div class="overflow-y-scroll h-[calc(100vh-72px)] w-1/2 items-center">
					<div v-for="mapping in selectedScheme.mappings">
						<div class="bg-slate-800 rounded-lg w-full">
							<div class="text-white grid grid-cols-2">
								<span>{{ mapping.trigger2 == mapping.trigger ? mapping.trigger : mapping.trigger + " + "
									+
									mapping.trigger2 }}</span>
								<div class="justify-items-end">
									<svg @click="() => rmMapping(mapping.trigger, mapping.trigger2)"
										class="w-6 h-6 text-red-500" aria-hidden="true"
										xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
										viewBox="0 0 24 24">
										<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
											stroke-width="2"
											d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z" />
									</svg>
								</div>
							</div>
							<FwbInput
								v-bind:class="'input_' + kebabTrigger(mapping.trigger) + '_' + kebabTrigger(mapping.trigger2)"
								class="inline" v-on:focus="() => selectedTrigger = mapping.trigger"
								v-on:focusout="() => onLeaveActionInput(mapping.trigger, mapping.trigger2)"
								placeholder="Enter an action..."
								v-bind:value="selectedScheme.mappings[getTriggerIndexInScheme(mapping.trigger, mapping.trigger2)].action" />
						</div>
						<br />
					</div>
					<div class="bg-slate-800 rounded-lg w-full" v-if="newMapOK">
						<div class="text-white grid grid-cols-2">
							<span>Add New Action</span>
							<div class="justify-items-end">
								<svg @click="addMapping" class="w-6 h-6 text-lime-600" aria-hidden="true"
									xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
									viewBox="0 0 24 24">
									<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
										stroke-width="2" d="M5 12h14m-7 7V5" />
								</svg>
							</div>
						</div>
						<FwbDropdown class="inline" v-bind:text="newMapTriggerDisplay" close-inside>
							<FwbListGroup class="overflow-y-scroll max-h-48">
								<FwbListGroupItem v-for="t in getOkTriggers()"
									@click="() => { newMapTrigger = t; newMapTrigger2 = t }"
									v-on:mouseover="() => selectedTrigger = t"
									v-on:mouseleave="() => selectedTrigger = 'NONE'">
									<span class="text-xs">{{ t }}</span>
								</FwbListGroupItem>
							</FwbListGroup>
						</FwbDropdown>
						<span
							class="text-white font-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
						<FwbDropdown class="inline" v-bind:text="newMapTrigger2Display" close-inside>
							<FwbListGroup class="overflow-y-scroll max-h-48">
								<FwbListGroupItem
									v-if="selectedScheme.mappings.filter((val) => val.trigger == newMapTrigger && val.trigger2 == val.trigger).length < 0"
									@click="() => newMapTrigger2 = newMapTrigger"
									v-on:mouseover="() => selectedTrigger = 'NONE'"
									v-on:mouseleave="() => selectedTrigger = 'NONE'">
									<span class="text-xs">Nothing</span>
								</FwbListGroupItem>
								<FwbListGroupItem v-for="t in getOkComboTriggers(newMapTrigger)"
									@click="() => newMapTrigger2 = t" v-on:mouseover="() => selectedTrigger = t"
									v-on:mouseleave="() => selectedTrigger = 'NONE'">
									<span class="text-xs">{{ t }}</span>
								</FwbListGroupItem>
							</FwbListGroup>
						</FwbDropdown>
					</div>
				</div>
			</main>
		</div>
	</div>
</template>