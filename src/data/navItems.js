import { createContext } from 'react'

// Hamburger-menu entry every grid lists. HamburgerMenu handles it itself:
// picking it calls the function from OpenCasesContext (ViewerPage switches
// to the Cases tab), so the grids don't need to wire it up.
export const CASE_STUDIES_ITEM = { id: 'cases', label: 'Case Studies' }

export const OpenCasesContext = createContext(null)
