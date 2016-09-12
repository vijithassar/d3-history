var tape = require('tape'),
    jsdom = require('jsdom').jsdom,
    d3 = require('../');

global.document = jsdom('<html><body></body></html>');
global.window = document.parentWindow;

tape('d3.history() method exists', function(test) {
    test.equal(typeof d3.history, 'function');
    test.end();
});

tape('d3.history() creates a proxy', function(test) {
    var proxy;
    proxy = d3.history();
    test.equal(typeof proxy, 'object');
    test.end();
});

tape('proxy exposes url handling getter/setter', function(test) {
    var proxy;
    proxy = d3.history();
    test.equal(typeof proxy.url, 'function');
    test.end();
});

tape('proxy has call and apply methods', function(test) {
    var proxy;
    proxy = d3.history();
    test.equal(typeof proxy.call, 'function');
    test.equal(typeof proxy.apply, 'function');
    test.end();
});

tape('proxy call and apply methods are chainable', function(test) {
    var proxy;
    proxy = d3.history('action');
    test.equal(proxy, proxy.call('action', null, 'url'));
    test.equal(proxy, proxy.apply('action', null, 'url'));
    test.end();
});

tape('proxy url handling setter method stores functions in scope', function(test) {
    var proxy,
        noop;
    proxy = d3.history();
    noop = function() {
        return;
    };
    proxy.url(noop);
    test.equal(proxy.url(), noop);
    test.end();
});

tape('proxy url handling setter method rejects invalid handlers', function(test) {
    var proxy,
        default_handler;
    proxy = d3.history();
    default_handler = proxy.url();
    proxy.url(true);
    test.equal(default_handler, proxy.url());
    test.end();
});

tape('functions are dispatched', function(test) {
    var proxy,
        value,
        new_value,
        action;
    proxy = d3.history('action');
    action = function(new_value) {
        value = new_value;
    };
    proxy.on('action', action);
    new_value = true;
    proxy.call('action', this, 'url', new_value);
    test.equal(value, new_value);
    test.end();
});

tape('context objects are passed', function(test) {
    var proxy,
        new_value,
        action;
    proxy = d3.history('action');
    action = function() {
        test.equal(this + '', new_value + '');
        test.end();
    };
    proxy.on('action', action);
    new_value = '_';
    proxy.call('action', new_value, 'url');
});