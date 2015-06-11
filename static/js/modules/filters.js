'use strict';

/* global require, module, window */

var $ = require('jquery');
var _ = require('underscore');
var URI = require('URIjs');

var events = require('./events.js');

// are the panels open?
var open = true;

var openFilterPanel = function() {
    $('body').addClass('panel-active--left');
    $('.side-panel--left').addClass('side-panel--open');
    $('#filter-toggle').addClass('active').html('<i class="ti-minus"></i> Hide Filters');
    open = true;
};

var closeFilterPanel = function() {
    $('body').removeClass('panel-active--left');
    $('.side-panel--left').removeClass('side-panel--open');
    $('#filter-toggle').removeClass('active').html('<i class="ti-plus"></i>Show Filters');
    open = false;
};

openFilterPanel();

$('#filter-toggle').click(function(){
    if ( open === true ) {
        closeFilterPanel();
    } else {
        openFilterPanel();
    }
});

var activateFilter = function(opts) {
    var $field = $('#category-filters [name=' + opts.name + ']');
    var $parent = $field.parent();
    if (opts.value) {
        $field.val(opts.value).change();
        $parent.addClass('active');
    } else {
        $field.val('').change();
        $parent.removeClass('active');
    }
};

var bindFilters = function() {
    var cycleSelect = $('#cycle').change(function() {
        var query = {cycle: cycleSelect.val()};
        var selected = cycleSelect.find('option:selected');
        window.location.href = URI(window.location.href).query(query).toString();
    });
};


// all of the filters we use on candidates and committees
var fieldMap = [
    'q',
    'cycle',
    'party',
    'state',
    'district',
    'office',
    'designation',
    'committee_type',
    'organization_type'
];

var activateInitialFilters = function() {
    // this activates dropdowns
    // name filter is activated in the template
    var open;
    var qs = URI.parseQuery(window.location.search);
    _.each(fieldMap, function(key) {
          activateFilter({
              name: key,
              value: qs[key]
          });
          open = open || qs[key];
    });

    if (open) {
        $('body').addClass('panel-active--left');
    }
};

// Clearing the selects
$('.button--remove').click(function(e){
    e.preventDefault();
    var removes = $(this).data('removes');
    $('[name="' + removes + '"]').val('');
    $(this).css('display', 'none');
});

$('.field input, .field select').change(function(){
    var $this = $(this);
    $('[data-removes="' + $this.attr('name') + '"]')
        .css('display', $this.val() ? 'block' : 'none');
});

module.exports = {
    init: function() {

        bindFilters();

        // if the page was loaded with filters set in the query string
        activateInitialFilters();
    },
    activateInitialFilters: activateInitialFilters
};
