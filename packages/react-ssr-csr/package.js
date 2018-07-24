Package.describe({
    version: "0.0.0",
    name: "react-ssr-csr",
    summary: "React server side render and client side render with react-loadable and Meteor.subscriptions in mind",
})

Package.onUse(function (api) {
    api.use("ecmascript@0.10.3")
    api.mainModule("client.js", "client")
    api.mainModule("server.js", "server")
})
