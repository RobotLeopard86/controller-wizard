<script setup lang="ts">
	import { useStore } from "vuex";
	import { computed, onBeforeMount, ref, type ComputedRef, type Ref } from "vue";
	import { FwbDropdown, FwbListGroup, FwbListGroupItem, FwbButton, FwbModal, FwbInput } from "flowbite-vue";
	import type { Button, Instance, Mapping, Scheme } from "@/schema";
	import router from "@/router";
	import fileSaver from "file-saver";
	import { exportProject } from "@/exporter";

	const store = useStore();

	const data: ComputedRef<Instance> = computed(() => store.state.value);

	const showManageDialog: Ref<boolean> = ref(false);
	const selectedScheme: Ref<Scheme> = ref({ name: 'NO SCHEME', mappings: [] });
	const isNullScheme: ComputedRef<boolean> = computed(() => selectedScheme.value.name === 'NO SCHEME');

	const showmdiag = () => { showManageDialog.value = true; }
	const hidemdiag = () => {
		if(data.value.length === 0) {
			selectedScheme.value = { name: 'NO SCHEME', mappings: [] };
		} else if(isNullScheme.value) {
			selectedScheme.value = data.value[0];
		}
		showManageDialog.value = false;
	}

	const newSchemeName: Ref<string> = ref("");

	onBeforeMount(() => {
		if(data.value == undefined || data.value == null || !(data.value as Instance).forEach) {
			router.replace('/');
		}
		if(data.value.length > 0) {
			selectedScheme.value = data.value[0];
		}
	})

	const canMakeNewScheme = () => {
		let foundExisting: boolean = false;
		const inst = data.value as Instance;
		inst.forEach(element => {
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
		mod.push(s);
		store.commit('manipulate', mod);
		newSchemeName.value = "";
	}

	const rmScheme = (scheme: string) => {
		let mod = data.value.filter((val) => {
			return val.name !== scheme;
		});
		store.commit('manipulate', mod);
	}

	const rmMapping = (trigger: Button) => {
		let mod = selectedScheme.value.mappings.filter((val) => {
			return val.trigger !== trigger;
		});
		selectedScheme.value.mappings = mod;
		data.value.forEach((val, i) => {
			if(val.name === selectedScheme.value.name) {
				data.value[i] = selectedScheme.value;
			}
		});
	}

	const saveToJson = () => {
		let b: Blob = new Blob([JSON.stringify(data.value)]);
		fileSaver.saveAs(b, "project.json");
	}

	const getOkTriggers = () => {
		const vals: Button[] = ['A', 'B', 'X', 'Y', 'Left Trigger', 'Left Shoulder', 'Right Trigger', 
	  	'Right Shoulder', 'Back', 'Start', 'Left Stick', 'Right Stick', 'Left Stick Press', 'Right Stick Press',
 		'D-Pad Left', 'D-Pad Right', 'D-Pad Up', 'D-Pad Down'];
		return vals.filter((val) => {
			return selectedScheme.value.mappings.filter((val2) => {
				return val2.trigger === val;
			}).length === 0;
		});
	}

	const newMapTrigger: Ref<Button> = ref('A');
	const newMapTriggerDisplay: ComputedRef<string> = computed(() => {
		if(isNullScheme.value) return "<Input>";
		if(getOkTriggers().includes(newMapTrigger.value)) return newMapTrigger.value;
		return "<Input>";
	});
	const newMapLabel: Ref<string> = ref('');
	const makeMappingOK: ComputedRef<boolean> = computed(() => newMapLabel.value === undefined || newMapLabel.value === "" || newMapTriggerDisplay.value === "<Input>");

	const addMapping = () => {
		const m: Mapping = {
			action: newMapLabel.value,
			trigger: newMapTrigger.value
		};
		let mod = selectedScheme.value.mappings;
		mod.push(m);
		selectedScheme.value.mappings = mod;
		data.value.forEach((val, i) => {
			if(val.name === selectedScheme.value.name) {
				data.value[i] = selectedScheme.value;
			}
		});
		newMapTrigger.value = getOkTriggers()[0];
		newMapLabel.value = "";
	}

	const exit = () => {
		if(confirm("Are you sure you want to exit?\nWarning: If you have not saved this diagram, it will be lost by exiting the editor!")) {
			store.commit('manipulate', [] as Instance);
       		router.push('/');
		}
	}

	const newMapOK = computed(() => getOkTriggers().length > 0);
</script>

<template>
	<FwbModal v-if="showManageDialog" @close="hidemdiag">
		<template #header>
			<h1 class="text-white text-3xl font-bold">Manage Schemes</h1>
		</template>
		<template #body>
			<FwbListGroup class="min-w-full">
				<FwbListGroupItem v-for="scheme in data" class="grid grid-cols-3 gap-3">
					<div><span>{{ scheme.name }}</span></div>
					<div class="col-span-2 flex items-center justify-end">
						<svg @click="() => rmScheme(scheme.name)" class="w-6 h-6 text-red-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
							<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"/>
						</svg>
					</div>
				</FwbListGroupItem>
			</FwbListGroup>
		</template>
		<template #footer>
			<div class="grid grid-cols-4 gap-4">
				<FwbInput v-model="newSchemeName" class="col-span-3" placeholder="Enter new scheme name here"></FwbInput>
				<FwbButton color="yellow" v-bind:disabled="makeSchemeOK" @click="addScheme">Add Scheme</FwbButton>
			</div>
		</template>
	</FwbModal>

	<div class="grid grid-cols-3 min-h-screen w-screen gap-8">
		<div class="bg-slate-900 rounded-xl backdrop-opacity-100 h-full my-auto grid grid-cols-1 grid-rows-5">
			<div class="row-span-4">
				<h1 class="font-extrabold text-3xl text-white text-center">{{  selectedScheme.name }}</h1>
				<FwbListGroup class="min-w-full min-h-full overflow-y-scroll" v-if="!isNullScheme">
					<FwbListGroupItem v-for="mapping in selectedScheme.mappings" class="grid grid-cols-3 gap-3">
						<div><span>{{ mapping.trigger }} -> {{ mapping.action }}</span></div>
						<div class="col-span-2 flex items-center justify-end">
							<svg @click="() => rmMapping(mapping.trigger)" class="w-6 h-6 text-red-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
								<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"/>
							</svg>
						</div>
					</FwbListGroupItem>
					<FwbListGroupItem class="grid grid-cols-3 gap-3" v-if="newMapOK">
						<FwbDropdown placement="bottom" v-bind:text="newMapTriggerDisplay" close-inside color="yellow">
							<FwbListGroup class="overflow-y-scroll max-h-48">
								<FwbListGroupItem v-for="t in getOkTriggers()" @click="() => newMapTrigger = t">
									<span class="text-xs">{{ t }}</span>
								</FwbListGroupItem>
							</FwbListGroup>
						</FwbDropdown>
						<FwbInput v-model="newMapLabel" />
						<FwbButton color="yellow" @click="addMapping" v-bind:disabled="makeMappingOK">+</FwbButton>
					</FwbListGroupItem>
				</FwbListGroup>
			</div>
			<div class="row-span-1 justify-center items-center grid grid-cols-2 gap-56">
				<FwbDropdown placement="right" text="Schemes" align-to-end color="yellow">
					<FwbListGroup>
						<FwbListGroupItem v-for="scheme in data">
							<span @click="() => {
								data.forEach(s => {
									if(s.name === scheme.name) selectedScheme = s;
								});
							}">{{ scheme.name }}</span>
						</FwbListGroupItem>
						<FwbListGroupItem>
							<span @click="showmdiag">Manage Schemes</span>
						</FwbListGroupItem>
					</FwbListGroup>
				</FwbDropdown>
				<FwbDropdown placement="left" text="Save" align-to-end color="yellow">
					<FwbListGroup>
						<FwbListGroupItem>
							<span @click="saveToJson">Save as Project File</span>
						</FwbListGroupItem>
						<FwbListGroupItem>
							<span @click="() => exportProject(data)">Export</span>
						</FwbListGroupItem>
					</FwbListGroup>
				</FwbDropdown>
			</div>
		</div>
		<div class="col-span-2 rounded-xl h-5/6 my-auto flex flex-col items-center justify-center">
			<img src="/controller.png" alt="Controller" class="w-2/3 h-5/6"/>
		</div>
		<FwbButton color="red" class="absolute right-0" @click="exit">X</FwbButton>
	</div>
</template>