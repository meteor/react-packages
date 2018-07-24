export * from "./lib/rootComponent"

import { onPageLoad } from "meteor/server-render"
import React from "react"
import { renderToString } from "react-dom/server"
import Loadable from "react-loadable"

import { getRootComponent } from "./lib/rootComponent"

/**
 * Fake Meteor.subscribe function just in case you want to use it on server
 */
Meteor.subscribe = function () {
    return {
        ready: () => true,
        stop: () => {},
    }
}

/**
 * Client side render
 */
onPageLoad(async sink => {
    // root dom node open tag
    sink.appendToBody("<div id=\"app\">")
    
    // our root component
    const App = getRootComponent()
    
    // pass current location
    const app = (
        <App location={sink.request.url}/>
    )
    
    // load all the things
    await Loadable.preloadAll()
    
    // render app to body
    sink.appendToBody(renderToString(app))
    
    // root dom node close tag
    sink.appendToBody("</div>")
})
