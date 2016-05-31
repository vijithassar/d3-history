(function(d3) {
  'use strict';
  var new_history;
  if (!d3 || !history) {
    return;
  }
  // variadic factory to generate dispatchers with history support
  new_history = function(_) {
    var proxy,
        events,
        dispatcher,
        url_handler,
        action;
    // bare object to act as an API proxy to the internal dispatcher
    proxy = Object.create(null);
    // convert input arguments to an array of triggering events
    events = [];
    for (var i = 0, ilength = arguments.length; i < ilength; i++) {
      events.push(arguments[i]);
    }
    // create a dispatcher using the events as an argument list
    dispatcher = d3.dispatch.apply(this, events);
    // default url handler; note that the order of the arguments to d3.history
    // is inverted compared to the HTML5 history API in order to parallel
    // d3.dispatch
    url_handler = function(data, title, url) {
      history.pushState(data, title, url);
    };
    // variadic handler for all URL and event logic
    action = function(_) {
      var event,
          url,
          data,
          title;
      // event name is already curried
      event = arguments[0];
      // this parameter is unused, so no need for an API yet
      title = '';
      if (
        (!arguments[1]) || // url is required
        (typeof arguments[1] !== 'string') // url must be a string
      ) {
        console.error('first argument to d3.history object must be a URL fragment');
      }
      // first argument is always the new url
      url = arguments[1];
      // any additional arguments should be stored as an array
      // and then applied as data arguments to the dispatcher
      data = [];
      if (arguments[2]) {
        for (var i = 2, ilength = arguments.length; i < ilength; i++) {
          data.push(arguments[i]);
        }
      }
      url_handler(data, title, url);
      // fire dispatcher
      if (typeof dispatcher[event] === 'function') {
        dispatcher[event].apply(this, data);
      }
    };
    // add all events as proxy methods
    events.forEach(function(event) {
      // bind event name to wrapper function instance
      proxy[event] = action.bind(dispatcher, event);
    });
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
    // d3.history method returns a proxy for the dispatcher
    // with additional private url handling
    return proxy;
  };
  // attach to d3 object
  d3.history = new_history;

}).call(this, d3);
