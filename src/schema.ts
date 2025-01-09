export type Button = 'A' | 'B' | 'X' | 'Y' | 'Left Trigger' | 'Left Shoulder' | 'Right Trigger' 
	| 'Right Shoulder' | 'Back' | 'Start' | 'Left Stick X' | 'Left Stick Y' | 'Right Stick X' | 'Right Stick Y' | 'Left Stick Press' | 'Right Stick Press' 
	| 'D-Pad Left' | 'D-Pad Right' | 'D-Pad Up' | 'D-Pad Down'

export interface Mapping {
	action: string,
	trigger: Button
}

export interface Scheme {
	name: string,
	mappings: Mapping[]
}

export type Instance = Scheme[];