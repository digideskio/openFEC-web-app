'use strict';

var events = require('./events.js');

var entityMap = {
    'candidates': 'candidate',
    'committees': 'committee'
};

var entitiesArray = ['candidate', 'committee'];

var callAPI = function(url) {
    return $.ajax({
        url: url
    });
};

var buildURL = function(e) {
    var URL = 'rest/' + entityMap[e.category] + '?',
        field;

    if (typeof e.query !== 'undefined') {
        URL += 'q=' + e.query + '&';
    }

    for (field in e.filters) {
        if (e.filters.hasOwnProperty(field)) {
            URL += field + '=' + e.filters[field] + '&'
        }
    }

    return URL;
};

var filterLoadHandler = function(e) {
    var url = buildURL(e),
        promise = callAPI(url);

    promise.done(function(data) {
        e.data = data;
        events.emit('render:browse', e);
    });
};

module.exports = {
    init: function() {
        events.on('search:submitted', function(e) {
            var entities = [],
                promises = [],
                i, 
                len = entitiesArray.length;

            for (i = 0; i < len; i++) {
                promises.push(callAPI('rest/' + entitiesArray[i] + '?q=' + encodeURIComponent(e.query) + '&per_page=5'));
            }


            $.when.apply($, promises).done(function() {
                var i,
                    len = arguments.length;
                e.results = {};

                for (i = 0; i < len; i++) {
                    e.results[entitiesArray[i]] = arguments[i][0].results;   
                }

                events.emit('render:searchResultsList', e);
            }).fail(function() {
                events.emit('err:load:search');
            });
        });

        events.on('load:browse', function(e) {
            var promise = callAPI('rest/' + entityMap[e.category]);

            promise.done(function(data) {
                e.data = data;
                events.emit('render:browse', e);
            });
        });

        events.on('load:searchResults', function(e) {
            var promise = callAPI(buildURL(e));

            promise.done(function(data) {
                e.data = data;
                events.emit('render:searchResults', e);
            });
        });

        events.on('selected:filter', filterLoadHandler);
        events.on('deselected:filter', filterLoadHandler);
        events.on('nav:pagination', filterLoadHandler);
    },

    entitiesArray: entitiesArray,

    // for unit tests
    buildURL: buildURL
};
