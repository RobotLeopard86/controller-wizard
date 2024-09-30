import type { Button, Instance, Mapping, Scheme } from "./schema";
import fileSaver from "file-saver";
import templateURL from "./diagram_template.svg";

export const exportProject = (inst: Instance) => {
	inst.forEach(async(scheme: Scheme) => {
		const template = await (await fetch(templateURL)).text();
		const templateDoc = new DOMParser().parseFromString(template, "image/svg+xml");

		templateDoc.querySelector("#title")!.innerHTML = scheme.name;
		
		let mappingsAsDict: Map<Button, string> = new Map();
		scheme.mappings.forEach((m: Mapping) => {
			mappingsAsDict.set(m.trigger, m.action);
		});

		templateDoc.querySelector("#a")!.innerHTML = mappingsAsDict.get('A') || "No Action";
		templateDoc.querySelector("#b")!.innerHTML = mappingsAsDict.get('B') || "No Action";
		templateDoc.querySelector("#x")!.innerHTML = mappingsAsDict.get('X') || "No Action";
		templateDoc.querySelector("#y")!.innerHTML = mappingsAsDict.get('Y') || "No Action";
		templateDoc.querySelector("#left-trigger")!.innerHTML = mappingsAsDict.get('Left Trigger') || "No Action";
		templateDoc.querySelector("#left-button")!.innerHTML = mappingsAsDict.get('Left Shoulder') || "No Action";
		templateDoc.querySelector("#right-trigger")!.innerHTML = mappingsAsDict.get('Right Trigger') || "No Action";
		templateDoc.querySelector("#right-button")!.innerHTML = mappingsAsDict.get('Right Shoulder') || "No Action";
		templateDoc.querySelector("#left-trigger")!.innerHTML = mappingsAsDict.get('Left Trigger') || "No Action";
		templateDoc.querySelector("#left-button")!.innerHTML = mappingsAsDict.get('Left Shoulder') || "No Action";
		templateDoc.querySelector("#start")!.innerHTML = mappingsAsDict.get('Start') || "No Action";
		templateDoc.querySelector("#back")!.innerHTML = mappingsAsDict.get('Back') || "No Action";
		templateDoc.querySelector("#dpad-r")!.innerHTML = mappingsAsDict.get('D-Pad Right') || "No Action";
		templateDoc.querySelector("#dpad-l")!.innerHTML = mappingsAsDict.get('D-Pad Left') || "No Action";
		templateDoc.querySelector("#dpad-u")!.innerHTML = mappingsAsDict.get('D-Pad Up') || "No Action";
		templateDoc.querySelector("#dpad-d")!.innerHTML = mappingsAsDict.get('D-Pad Down') || "No Action";
		templateDoc.querySelector("#lstick")!.innerHTML = mappingsAsDict.get('Left Stick') || "No Action";
		templateDoc.querySelector("#lstick-press")!.innerHTML = "Press: " + (mappingsAsDict.get('Left Stick Press') || "No Action");
		templateDoc.querySelector("#rstick")!.innerHTML = mappingsAsDict.get('Right Stick') || "No Action";
		templateDoc.querySelector("#rstick-press")!.innerHTML = "Press: " + (mappingsAsDict.get('Right Stick Press') || "No Action");

		let baseOut: string = templateDoc.documentElement.innerHTML;
		const out = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 800 500\">" + baseOut + "</svg>";

		let outFname: string = scheme.name.replace(" ", "_") + ".svg";
		fileSaver.saveAs(new Blob([out]), outFname);
	});
};