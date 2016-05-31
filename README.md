# d3-history

simple URL support for D3.js user interfaces

# Overview

d3.history is a plugin for [D3.js](http://d3js.org/) which adds simple support for deep-linking and URLs based on the user interface state. It automatically updates the URL bar through the [HTML5 History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API) as you use the [d3.dispatch](https://github.com/d3/d3/wiki/Internals#d3_dispatch) event listening utility.

[live demonstration](https://bl.ocks.org/vijithassar/raw/3518ea727b10e03d02a6c3fdd97d3b69/?active=0,10,18,19,20,21,29,39)

# Instructions

D3.js provides [d3.dispatch](https://github.com/d3/d3/wiki/Internals#d3_dispatch), an event listening utility which can be used to cleanly decouple project components from the user interaction events used by the [d3.on](https://github.com/d3/d3/wiki/Selections#on) method. d3.history is largely a drop-in replacement for d3.dispatch, so the API methods intentionally match, with one important exception: with d3.history, the first argument to the event method must always be the new URL fragment you'd like to update the URL bar with.

```js
var dispatcher,
    history_dispatcher,
    index,
    datum;

// which data item will be passed to the dispatcher as an argument?
index = 12;
datum = data[datum];

// perform the action without giving a URL to the new state
dispatcher = d3.dispatch('action');
selection.on('action', function() {
  dispatcher.action(datum);  
});

// perform the action and give the new state a URL -- much better!
history_dispatcher = d3.history('action');
selection.on('click', function() {
  history_dispatcher.action('displaying-item-' + index, datum);
});
```

Just as with d3.dispatch, you can optionally provide additional arguments to a d3.history object which will be passed to the event methods. These arguments are also combined into an array which is then stored in the state object provided by the HTML5 History API.

```js
var dispatcher;
// create a d3.history dispatcher object with an "action" method
dispatcher = d3.history('action');
// fire action method listener on click
selection.on('click', function() {
  // pass arguments to the event handler function
  dispatcher.action(url, datum, additional_information);
});
// arguments are available in the event handler function
dispatcher.on('action', function(datum, additional_information) {
  console.log(datum, additional_information);
});
```

d3.history handles the URL bar, but it doesn't try to manage your application state. If two items are clicked in quick succession, should the URL bar mention them both, or should the second replace the first? You'll need to handle that decision yourself when compiling your new URL, before using d3.history. URLs are important, so d3.history will never try to decide them for you.

In the vast majority of cases, it should be sufficient to track key-value pairs using a hashmap, and then flatten that hashmap to a URL fragment string immediately before updating the user interface with d3.history.

```js
var dispatcher,
    state;    
// create a d3.history dispatcher object with an "action" method
dispatcher = d3.history('action');
// keep track of project state
state = {
  country: 'Spain',
  zoom: false
};
// perform the action on click
selection.on('click', function() {
  // compile project state to URL
  url_fragment = '';
  Object.keys(state).forEach(function(key) {
    var value;
    value = state[key];
    url_fragment += key + '=' + value + '&';
  });
  // convert to query parameters and remove trailing ampersand
  url_fragment = '?' + url.slice(0, -1);
  // fire action event handler and update url bar accordingly
  dispatcher.action(url_fragment);  
});
```

d3.history will automatically handle storing state and history of data and URLs, but it can't make the project respond to the URL bar entirely on its own, because it doesn't know how to render everything else. To fully enable deep linking, you'll need to make sure your project includes an [initialization function](https://bl.ocks.org/vijithassar/3518ea727b10e03d02a6c3fdd97d3b69) which can read the URL bar and set the project state accordingly on load. (Using d3.history or d3.dispatch inside that initialization function can make this a lot easier.)

To support the browser's "forward" and "back" buttons, run the initialization function in response to the popstate event.

```js
  window.addEventListener('popstate', function() {
    initialize();
  });
```

d3.history uses d3.dispatch internally, creating a closure around it which also contains the logic for handling the HTML5 History API.

# Custom URL Handling

By default, URLs are simply updated with pushState. However, you can override this to insert your own custom URL handling function if you'd like to do something unusual. Your custom function must accept three arguments, which should match those used for pushState:

1. the data item, if any, which is to be stored as the page state object
2. the page title (although currently this is unused in all major browsers)
3. the new URL fragment

```js
  var history_dispatcher,
      url_handler;
  // create a d3.history object
  history_dispatcher = d3.history();
  // do whatever you want with the URL and state data
  url_handler = function(data, title, url) {
    console.log("Let's do something unusual with the URL.");
  });
  // attach custom URL handling function
  history_dispatcher.url(url_handler);
```
