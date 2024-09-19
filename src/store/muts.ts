import type { Instance } from "@/schema";

export const mutations = {
	manipulate(state: any, newVal: Instance) {
		state.value = newVal;
	}
}