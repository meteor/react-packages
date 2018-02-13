let rootComponent

/**
 * Set root component used for server side render and client render
 * On server prop *location* with current location will be passed to your component
 */
export function setRootComponent(component) {
    rootComponent = component
}

/**
 * Get current root component
 */
export function getRootComponent() {
    if(!rootComponent) {
        throw new Error("No root component, please setRootComponent() first")
    }
    return rootComponent
}
