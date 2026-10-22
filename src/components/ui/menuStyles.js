// Shared look for the grids' dropdown menus.

// Frosted "acrylic" trigger: translucent teal with a white sheen at the top,
// a blurred backdrop, a light rim and an inner top highlight. Text colour is
// left to each menu's TRIGGER_CLASS.
export const GLASS_TRIGGER = 'rounded-md bg-gradient-to-b from-white/70 to-[#63ECE1]/50 backdrop-blur-md border border-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(0,90,85,0.15),0_2px_8px_rgba(0,0,0,0.15)] hover:to-[#63ECE1]/70'

// Same acrylic finish for full-width strips (tile titles): no rounding, rim
// or drop shadow, so callers' corner classes apply and the height is unchanged.
export const GLASS_STRIP = 'bg-gradient-to-b from-white/70 to-[#63ECE1]/50 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(0,90,85,0.15)]'

// See-through dropdown panel, blurred so its text stays readable over the diagram.
export const GLASS_DROPDOWN = 'rounded shadow-lg border border-gray-200/60 dark:border-gray-700/60 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm'
