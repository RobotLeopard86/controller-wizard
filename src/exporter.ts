import controllerImage from './export-controller-base.png';
import fileSaver from 'file-saver';
import type {Button, Instance, Mapping, Scheme} from './schema';

export const exportProject = (inst: Instance) => {
	inst.schemes.forEach(async (scheme: Scheme) => {
		const abbr: Map<Button, string> = new Map([
			['A', "A"],
			['B', "B"],
			['X', "X"],
			['Y', "Y"],
			['Left Button', "LB"],
			['Right Button', "RB"],
			['Left Trigger', "LT"],
			["Right Trigger", "RT"],
			['Back', "Back"],
			['Start', "Start"],
			['D-Pad Up', "DPadU"],
			['D-Pad Left', "DPadL"],
			['D-Pad Right', "DPadR"],
			['D-Pad Down', "DPadD"],
			['Left Stick X', "LStk-X"],
			['Left Stick Y', "LStk-X"],
			['Left Stick Press', "LStkClk"],
			['Right Stick X', "RStk-X"],
			['Right Stick Y', "RStk-X"],
			['Right Stick Press', "RStkClk"]
		]);

		const initialPos: Map<Button, {x: number, y: number}> = new Map([
			['Left Trigger', {x: 10, y: 11}],
			['Left Button', {x: 10, y: 119}],
			['Left Stick X', {x: 10, y: 227}],
			['Left Stick Y', {x: 10, y: 335}],
			['Left Stick Press', {x: 10, y: 443}],
			['Back', {x: 10, y: 551}],
			['D-Pad Up', {x: 10, y: 659}],
			['D-Pad Down', {x: 10, y: 767}],
			['D-Pad Left', {x: 10, y: 875}],
			['D-Pad Right', {x: 10, y: 983}],
			['Right Trigger', {x: 1240, y: 11}],
			['Right Button', {x: 1240, y: 119}],
			['Y', {x: 1240, y: 227}],
			['X', {x: 1240, y: 335}],
			['B', {x: 1240, y: 443}],
			['A', {x: 1240, y: 551}],
			['Start', {x: 1240, y: 659}],
			['Right Stick X', {x: 1240, y: 767}],
			['Right Stick Y', {x: 1240, y: 875}],
			['Right Stick Press', {x: 1240, y: 983}],
		]);

		let mappingsByInitTrigger: Map<Button, {t: Button, a: string}[]> = new Map();
		scheme.mappings.forEach((val: Mapping) => {
			if(mappingsByInitTrigger.has(val.trigger)) {
				mappingsByInitTrigger.get(val.trigger)!.push({t: val.trigger2, a: val.action});
			} else {
				mappingsByInitTrigger.set(val.trigger, [{t: val.trigger2, a: val.action}]);
			}
		});

		const canvas = new OffscreenCanvas(1920, 1080);
		const ctx = canvas.getContext('2d')!;

		const ROW_PADDING = 7;
		const COLUMN_PADDING = 7;
		const CELL_DIMS = {x: 670, y: 91};
		const TXT_SIZE = 16;
		const TXT_HEIGHT = 42;

		const drawController = async() => {
			let controller = new Image();
			controller.src = controllerImage;
			await new Promise((resolve) => controller.addEventListener('load', resolve));

			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.fillStyle = '#FFFFFF';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(controller, 0, 0, canvas.width, canvas.height);

			ctx.fillStyle = "#000000";
			ctx.font = TXT_SIZE.toString() + "px monospace";
			ctx.textAlign = "left";
			ctx.direction = "ltr";
			ctx.textBaseline = "top";

			mappingsByInitTrigger.forEach((val, key) => {
				const initPos = initialPos.get(key)!;
				let drawTextTracker: {x: number, y: number} = initPos;

				let TXT_WIDTH: number = CELL_DIMS.x;
				console.log("=== GO  " + key + " ===");
				while((TXT_WIDTH + COLUMN_PADDING) * (val.length) > CELL_DIMS.x) {
					TXT_WIDTH -= 2;
					console.log(TXT_WIDTH);
				}
				console.log("=== END " + key + " ===");

				val.forEach((value) => {
					let text: string = "";
					if(value.t == key) {
						text = "ON PRESS";
					} else {
						text = "+" + abbr.get(value.t);
					}
					text += ": " + value.a;

					ctx.fillText(text, drawTextTracker.x, drawTextTracker.y, TXT_WIDTH);

					drawTextTracker.x += (TXT_WIDTH + COLUMN_PADDING);
					if(drawTextTracker.x > (initPos.x + CELL_DIMS.x)) {
						drawTextTracker.x = initPos.x;
						drawTextTracker.y += (TXT_HEIGHT + ROW_PADDING);
					}
				});
			});

			ctx.textAlign = "start";
			ctx.font = "28px monospace"
			ctx.fillText(scheme.name, 710, 1050, 500);
		}
		drawController().then(async() => {
			const pngBlob = await canvas.convertToBlob();
			const filename = inst.name + ' - ' + scheme.name + '.png';
			fileSaver.saveAs(pngBlob, filename);
		})
	});
};