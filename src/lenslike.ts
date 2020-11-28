import * as Optics from "optics-ts"
import * as L from "./lens"

const opticsMissing = () => { throw Error("optics-ts not found") }
let O: typeof Optics = {
    get: opticsMissing,
    set: opticsMissing
} as any

async function importOptics() {
    try {
        O = await import("optics-ts")
    } catch (e) {
        
    }
}
importOptics()
const supportedOpticsTags = ["Lens", "Equivalence", "Iso"]


export type LensLike<A, B> = L.Lens<A, B> | Optics.Lens<A, any, B> | Optics.Equivalence<A, any, B> | Optics.Iso<A, any, B>

export function mkLens<A, B>(lens: LensLike<A, B>): L.Lens<A, B> {
    const tag: string | undefined = (lens as any)._tag
    if (tag) {
        // Optics.ts lens
        
        if (!supportedOpticsTags.includes(tag)) {
            throw Error(`Only ${supportedOpticsTags.join("/")} optics supported from optics-ts. Given optic is a ${tag}.`)
        }
        const opticsLens = lens as Optics.Lens<A, any, B>
        return {
            get: O.get(opticsLens),
            set: (current: A, data: B) => O.set(opticsLens)(data)(current)
        }
    }
    return lens as L.Lens<A, B>
}