export type Button = 'A' | 'B' | 'X' | 'Y' | 'Left Trigger' | 'Left Button' | 'Right Trigger' 
	| 'Right Button' | 'Back' | 'Start' | 'Left Stick X' | 'Left Stick Y' | 'Right Stick X' | 'Right Stick Y' | 'Left Stick Press' | 'Right Stick Press' 
	| 'D-Pad Left' | 'D-Pad Right' | 'D-Pad Up' | 'D-Pad Down'

export interface Mapping {
	action: string,
	trigger: Button,
	trigger2: Button
}

export interface Scheme {
	name: string,
	mappings: Mapping[]
}

export type Instance = Scheme[];