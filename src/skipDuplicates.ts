import { Event, isValue, Observer, Scope } from "./abstractions";
import { applyScopeMaybe } from "./applyscope";
import { transform, Transformer, UnaryTransformOp, UnaryTransformOpScoped } from "./transform";

export type Predicate2<A> = (prev: A, next: A) => boolean

export function skipDuplicates<A>(fn: Predicate2<A>): UnaryTransformOp<A>
export function skipDuplicates<A>(fn: Predicate2<A>, scope: Scope): UnaryTransformOpScoped<A>
export function skipDuplicates<A>(fn: Predicate2<A>, scope?: Scope): any {
    return (s: any) => applyScopeMaybe(transform(s + `.skipDuplicates(fn)`, skipDuplicatesT(fn))(s), scope)
}

function skipDuplicatesT<A>(fn: Predicate2<A>): Transformer<A, A> {
    let current: A | typeof uninitialized = uninitialized
    return {
        changes: (event: Event<A>, observer: Observer<Event<A>>) => {
            if (isValue(event)) {
                if (current === uninitialized || fn(current, event.value)) {
                    current = event.value
                    observer(event)
                }
            } else {
                observer(event)
            }
        },
        init: (value: A) => {
            current = value
            return value
        }
    }
}

const uninitialized: unique symbol = Symbol()