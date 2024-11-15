<script setup lang="ts">
	import { useStore } from "vuex";
	import { computed, onBeforeMount, ref, type ComputedRef, type Ref } from "vue";
	import { FwbDropdown, FwbListGroup, FwbListGroupItem, FwbButton, FwbModal, FwbInput, FwbNavbar } from "flowbite-vue";
	import type { Button, Instance, Mapping, Scheme } from "@/schema";
	import router from "@/router";
	import fileSaver from "file-saver";
	import { exportProject } from "@/exporter";

	const store = useStore();

	const data: ComputedRef<Instance> = computed(() => store.state.value);

	const showManageDialog: Ref<boolean> = ref(false);
	const showExitDialog: Ref<boolean> = ref(false);
	const showExportDialog: Ref<boolean> = ref(false);

	const selectedTrigger: Ref<string> = ref("NONE");
	const controller: ComputedRef<string> = computed(() => import.meta.env.BASE_URL + "controllers/" + selectedTrigger.value.replace(' ', '-').toLowerCase() + ".png");
	
	const selectedScheme: Ref<Scheme> = ref({ name: 'NO SCHEME', mappings: [] });
	const isNullScheme: ComputedRef<boolean> = computed(() => selectedScheme.value.name === 'NO SCHEME');

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
		store.commit('manipulate', [] as Instance);
		router.push('/');
	}

	const newMapOK = computed(() => getOkTriggers().length > 0);

	const exportNotOK = computed(() => data.value.length < 1);
</script>

<!-- <template>
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
</template>-->

<template>
	<!-- Exit dialog -->
	<FwbModal v-if="showExitDialog" @close="() => showExitDialog = false">
		<template #header>
			<h1 class="text-white text-3xl font-bold">Exit Confirmation</h1>
		</template>
		<template #body>
			<span class="text-white">
				Are you sure you want to exit the editor?
				<br/>
				Any unsaved changes will be lost.
			</span>
		</template>
		<template #footer>
			<div class="h-full grid grid-cols-3 gap-2">
				<div class="grid justify-items-start">
					<FwbButton color="red" @click="exit">Exit</FwbButton>
				</div>
				<div class="grid justify-items-end col-start-3">
					<FwbButton color="blue" @click="() => {showExitDialog = false; showExportDialog = true;}">Save</FwbButton>
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
					<FwbButton color="blue" v-bind:disabled="exportNotOK" @click="() => exportProject(data)">Export to SVG</FwbButton>
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
				<FwbButton color="blue" v-bind:disabled="makeSchemeOK" @click="addScheme">Add Scheme</FwbButton>
			</div>
		</template>
	</FwbModal>

	<!-- Main content -->
	<div class="flex flex-col min-h-screen max-w-full overflow-hidden">
		<FwbNavbar class="sticky max-w-full z-50 top-0 p-0 m-0 bg-slate-900 h-1/12">
			<template #logo>
				<div class="grid grid-cols-1 grid-rows-2">
					<span class="text-white">Selected: {{selectedScheme.name}}</span>
					<FwbDropdown placement="bottom" text="Schemes">
						<FwbListGroup>
							<FwbListGroupItem v-for="scheme in data">
								<span @click="() => {
									data.forEach(s => {
										if(s.name === scheme.name) selectedScheme = s;
									});
								}">{{ scheme.name }}</span>
							</FwbListGroupItem>
							<FwbListGroupItem>
								<span @click="() => showManageDialog = true">Manage Schemes</span>
							</FwbListGroupItem>
						</FwbListGroup>
					</FwbDropdown>
				</div>
			</template>
			<template #default>
				<span class="text-white font-extrabold text-3xl">Controller Wizard Editor</span>
			</template>
			<template #right-side>
				<FwbButton color="blue" @click="() => showExportDialog = true">Save Diagram</FwbButton>
				<FwbButton color="red" @click="() => showExitDialog = true">Exit Editor</FwbButton>
			</template>
		</FwbNavbar>
		<div class="grid h-11/12">
			<main class="w-full flex flex-row overscroll-contain container box-border">
				<div class="overflow-hidden rounded-xl my-auto flex flex-col items-center justify-center w-1/2 h-screen">
					<img v-bind:src="controller" alt="Controller" class="fixed"/>
				</div>
				<div class="overflow-y-auto text-white w-1/2">
					Giraffe tongues are fascinating marvels of the natural world, a true testament to evolutionary adaptation. Measuring up to an impressive 18 to 20 inches (45 to 50 centimeters) in length, these prehensile tongues are perfectly suited for the giraffe's browsing lifestyle. Their dexterity allows them to strip leaves, especially from thorny acacia trees, which would be a risky endeavor for less-equipped creatures. Remarkably, a giraffe's tongue is coated in a thick layer of mucus that provides additional protection against potential injuries from the sharp thorns. If you've ever wondered why giraffe tongues are such a distinctive dark color—ranging from purplish-black to bluish-gray—it's believed to be an adaptation against sunburn. Giraffes spend long hours foraging under the sun, and this pigmentation may act like natural sunscreen, safeguarding their tongues from UV damage.
The giraffe tongue is also extraordinarily strong and muscular. Imagine having to use your tongue to grasp and manipulate food for hours each day! These muscles are capable of twisting, curling, and reaching in ways that allow giraffes to delicately pluck leaves from even the trickiest of spots. Interestingly, the saliva of a giraffe is said to have antiseptic properties, which is an important feature when you consider how frequently their tongues come into contact with potentially harmful surfaces. After all, no one wants an infection from thorn-induced nicks! The tongue's flexibility and resilience mean giraffes are able to maintain their voracious appetites; they can consume up to 75 pounds of leaves daily, all without the help of hands or other tools.
But let's not forget how adorable and quirky giraffe tongues are when observed up close! If you've ever visited a wildlife reserve or a zoo, you might have seen a giraffe wrapping its tongue around a treat handed to it by a lucky visitor. Their dexterity isn't just functional—it's charming and somewhat mesmerizing to watch. Giraffes use their tongues for grooming as well, often licking their own faces or even their noses. This multitasking appendage is essentially a giraffe's Swiss Army knife, useful for a variety of daily tasks.
Fun fact: giraffe tongues are one of the strongest examples of convergent evolution, sharing similarities with other long-tongued animals like okapis and even anteaters, though for entirely different reasons. Unlike the sticky tongues of anteaters designed to snag insects, the giraffe tongue is a highly controlled appendage, engineered to interact with rough vegetation without causing harm. Over thousands of years, these elegant creatures have perfected the art of tongue-driven dining, showcasing just how beautifully specialized nature can be.
And what about baby giraffes? From birth, giraffes must develop strong tongues to learn the art of browsing alongside their mothers. In the early months, a calf's tongue grows rapidly to prepare for a lifetime of leaf-plucking precision. These little learners observe their elders closely, mimicking their techniques to master the delicate balance of grasping leaves without injury. It's fascinating to think that something as simple as eating can require such skill and adaptation!
The next time you see a giraffe lazily stretching its tongue toward a leafy branch or curiously licking its own nose, take a moment to appreciate the evolution and elegance of this often-overlooked feature. Giraffe tongues are more than just tools for eating—they're symbols of resilience, adaptability, and the surprising wonders of the animal kingdom.
				</div>
			</main>
		</div>
	</div>
</template>