import { dispatch } from 'd3-dispatch';

var history;

// variadic factory to generate dispatchers with history support
history = function(_) {
    var proxy,
        dispatcher,
        events,
        url_handler;
    // bare object to act as an API proxy to the internal dispatcher
    proxy = Object.create(null);
    // create a dispatcher using the input as a list of event names
    events = Array.prototype.slice.call(arguments);
    dispatcher = dispatch.apply(this, events);
    // default url handler; note that the order of the arguments to d3.history
    // is inverted compared to the HTML5 history API in order to parallel
    // d3.dispatch
    url_handler = function(data, title, url) {
        if (window && window.history) {
            window.history.pushState(data, title, url);
        }
    };
    // get or set the url processing function, useful for tapping in to insert
    // custom functionality
    proxy.url = function(new_url_handler) {
        if (new_url_handler && typeof new_url_handler !== 'function') {
            console.error('optional argument to the .url() method of d3.history object must be a function');
        }
        if (typeof new_url_handler === 'function') {
            url_handler = new_url_handler;
            return proxy;
        } else {
            return url_handler;
        }
    };
    // pass event handlers to internal dispatcher object
    proxy.on = function(event_name, event_handler) {
        if (typeof event_name !== 'string') {
            console.error('first argument to .on() method of d3.history object must be an event name');
        }
        if (typeof event_handler !== 'function') {
            console.error('second argument to .on() method of d3.history object must be a function');
        }
        dispatcher.on(event_name, event_handler);
        return proxy;
    };
    // proxy.call is itself just a redirect to proxy.apply
    proxy.call = function(_) {
        var event_name,
            context,
            url,
            rest;
        event_name = arguments[0];
        context = arguments[1] || null;
        url = arguments[2];
        rest = Array.prototype.slice.call(arguments, 3) || null;
        // always resolve to apply in order to keep proxy.call variadic
        proxy.apply(event_name, context, url, rest);
        return proxy;
    };
    proxy.apply = function(event_name, context, url, args) {
        var title;
        title = null;
        args = args || null;
        context = context || null;
        if (typeof url !== 'string') {
            console.error('third argument to history dispatcher must be a string with which to update the url bar');
        }
        // update HTML5 history API
        url_handler(args, title, url);
        // fire dispatcher
        dispatcher.apply(event_name, context, args);
        return proxy;
    };
    // return a proxy for the dispatcher
    // with additional private url handling
    return proxy;
};

export default history;