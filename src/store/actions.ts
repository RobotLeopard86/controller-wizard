import type { Instance } from "@/schema";

export default {
	manipulate({ commit }: any, newValue: Instance) {
		commit('manipulate', {
			newValue
		})
	}
}