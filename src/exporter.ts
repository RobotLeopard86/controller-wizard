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
			['D-Pad Up', "DPadUp"],
			['D-Pad Left', "DPadLeft"],
			['D-Pad Right', "DPadRight"],
			['D-Pad Down', "DPadDown"],
			['Left Stick X', "LS-X"],
			['Left Stick Y', "LS-Y"],
			['Left Stick Press', "LS-Press"],
			['Right Stick X', "RS-X"],
			['Right Stick Y', "RS-X"],
			['Right Stick Press', "RS-Press"]
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
		const COLUMN_PADDING = 10;
		const CELL_DIMS = {x: 670, y: 91};
		const TXT_SIZE = 28;
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
				let drawTextTracker: {x: number, y: number} = {x: initPos.x, y: initPos.y};

				let ordered = val.filter((value) => value.t != key);
				if(ordered.length < val.length) ordered.unshift(val.filter((value) => value.t == key)[0]);

				ordered.forEach((value) => {
					let text: string = "";
					if(value.t == key) {
						text = abbr.get(value.t)!;
					} else {
						text = "+" + abbr.get(value.t)!;
					}
					text += ":" + value.a;

					const advance = (ctx.measureText(text).width + COLUMN_PADDING);
					const advancePos = () => {
						drawTextTracker.x += advance;
						if(drawTextTracker.x > (initPos.x + CELL_DIMS.x)) {
							drawTextTracker.x = initPos.x;
							drawTextTracker.y += (TXT_HEIGHT + ROW_PADDING);
						}
					};

					console.log(`WILL BE ${drawTextTracker.x + advance}\nLEQUAL ${(initPos.x + CELL_DIMS.x)}\nFROM ${initPos.x} AND ${CELL_DIMS.x}`);
					if(drawTextTracker.x + advance > (initPos.x + CELL_DIMS.x)) advancePos();

					ctx.fillText(text, drawTextTracker.x, drawTextTracker.y);
					advancePos();
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