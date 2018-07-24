export * from "./lib/rootComponent"

import React from "react"
import { render } from "react-dom"
import { getRootComponent } from "./lib/rootComponent"

const promises = []

/**
 * Patch original Meteor.subscribe function to track all subscription handles
 * Creates promise for each subscription and resolves it when subscription is ready
 */
const originalSubscribe = Meteor.subscribe
Meteor.subscribe = function (...args) {
    let resolveFunc
    const promise = new Promise((resolve, reject) => {
        resolveFunc = resolve
    })
    promises.push(promise)
    
    let onReady, onError, onStop
    
    const lastArg = args[args.length - 1]
    if (typeof lastArg === "function") {
        onReady = lastArg
        args.pop()
    }
    
    if (typeof lastArg === "object") {
        onReady = lastArg.onReady
        onError = lastArg.onError
        onStop = lastArg.onStop
        args.pop()
    }
    
    const originalOnReady = onReady
    onReady = function (...args) {
        resolveFunc()
        if (originalOnReady) {
            originalOnReady.call(this, ...args)
        }
    }
    
    return originalSubscribe.call(this, ...args, { onReady, onError, onStop })
}

/**
 * Patch original Module.prototype.dynamicImport function to track all imported modules
 * Creates promise for each import call and resolves it when module is ready
 */
const Module = module.constructor
const originalImport = Module.prototype.dynamicImport
Module.prototype.dynamicImport = function (...args) {
    const promise = originalImport.call(this, ...args)
    promises.push(promise)
    return promise
}

/**
 * Server side render
 */
async function renderApp() {
    // our root component
    const App = getRootComponent()
    
    // our root dom node
    const element = document.getElementById("app")
    if (!element) {
        throw new Error("There is no #app element")
    }
    
    // if we don't have any server side rendered markup
    // render immediately
    if (!element.innerHTML) {
        render(<App/>, element)
        return
    }
    
    // if we have server side rendered markup
    // display it and render react dom into temporary dom dode
    const temp = document.createElement("div")
    temp.id = "app"
    render(<App/>, temp)
    
    // wait until we loaded all the things
    await resolvePromises(promises)
    
    // swap dom node
    element.parentNode.replaceChild(temp, element)
}

Meteor.defer(renderApp)


async function resolvePromises(promises) {
    let list = []
    while (promises.length) {
        list.push(promises.pop())
    }
    
    await Promise.all(list)
    await deferWait()
    
    if (promises.length) {
        await resolvePromises(promises)
    }
}

function deferWait() {
    return new Promise(((resolve, reject) => {
        Meteor.defer(resolve)
    }))
}
