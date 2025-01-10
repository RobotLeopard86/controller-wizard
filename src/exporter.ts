import controllerImage from './export-controller-base.png';
import fileSaver from 'file-saver';
import type {Button, Instance, Mapping, Scheme} from './schema';

export const exportProject = (inst: Instance) => {
	inst.forEach(async (scheme: Scheme) => {
		let mappingsAsDict: Map<Button, string> = new Map();
		scheme.mappings.forEach((m: Mapping) => {
			mappingsAsDict.set(m.trigger, m.action);
		});

		const canvas = new OffscreenCanvas(644, 500);
		const ctx = canvas.getContext('2d')!;

		const distanceFromCenter = 165;
		const LEFT = canvas.width / 2 - distanceFromCenter;
		const RIGHT = canvas.width / 2 + distanceFromCenter - 6;

		const buttonPositions = {
			"Back": [LEFT, 17],
			"Start": [RIGHT, 17],
			"Left Button": [LEFT, 55],
			"Right Button": [RIGHT, 53],
			"Left Trigger": [LEFT, 89],
			"Right Trigger": [RIGHT, 80],
			"Left Stick Y": [LEFT, 128],
			"Left Stick X": [LEFT, 156],
			"Left Stick Press": [LEFT, 186],
			"Y": [RIGHT, 114],
			"B": [RIGHT, 160],
			"X": [RIGHT, 182],
			"A": [RIGHT, 273],
			"D-Pad Up": [LEFT, 292],
			"D-Pad Left": [LEFT, 320],
			"D-Pad Down": [LEFT, 347],
			"D-Pad Right": [LEFT, 378],
			"Right Stick Y": [RIGHT, 320],
			"Right Stick X": [RIGHT, 347],
			"Right Stick Press": [RIGHT, 376],
		};

		async function drawController() {
			let controller = new Image();
			controller.src = controllerImage;
			await new Promise((resolve) => controller.addEventListener('load', resolve));

			ctx.clearRect(0, 0, canvas.width, canvas.height);

			ctx.fillStyle = '#FFFFFF';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(controller, 0, 0, canvas.width - 6, 406);

			ctx.textBaseline = 'middle';
			ctx.direction = 'ltr';
			ctx.font = '32px Arial';
			ctx.fillStyle = '#000000';
			ctx.fillText(scheme.name, 5, canvas.height - 18);

			for(const [trigger, action] of mappingsAsDict) {
				const position = buttonPositions[trigger];
				if (position && action) {
					ctx.fillStyle = '#000';
					ctx.font = '16px Arial';
					ctx.direction = position[0] === LEFT ? 'rtl' : 'ltr';
					ctx.fillText(action, position[0], position[1] + 16 / 2.8);
				}
			}

			requestAnimationFrame(drawController);
		}
		drawController().then(async() => {
			const pngBlob = await canvas.convertToBlob();
			const filename = scheme.name + '.png';
			fileSaver.saveAs(pngBlob, filename);
		})
	});
};