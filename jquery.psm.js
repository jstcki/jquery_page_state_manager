/*
-------------------------------------------------------------------------

PSM - A jQuery Page State Manager

-------------------------------------------------------------------------
LICENSE

Copyright (c) 2009 Jeremy Stucki, http://herrstucki.ch/

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

-------------------------------------------------------------------------

See README.markdown for instructions.

Version 0.4

*/


(function($) {
    $.psm = {
        
        // PSM Properties
        
        defaults: {
            state_transition: "none",
            page_transition: "fade",
            state_transition_duration: 500,
            page_transition_duration: 500,
            page_container: "page_container",
            page_directory: "pages/",
            page_extension: ".html",
            initial_page: "0",
            initial_state: "0",
            exclude_from_history: []
        },
        current: {},
        page_history: [],
        
        // Initialize
        
        init: function(options) {
            this.set_defaults(options);
            // this.goto_state(state_name, {state_transition: "none"});
            if ($("#"+this.defaults.page_container).length > 0) {
                $("#"+this.defaults.page_container).css({position: "relative"});
            }
            this.goto_page(this.defaults.initial_page, {page_transition: "none"});
            this.goto_state(this.defaults.initial_state, {state_transition: "none"});
        },
        
        // Change State of Current Page
        
        goto_state: function(state_name, options, context) {
            var settings = {
                state_transition: false
            }
            $.extend(settings, options);
            
            var state_elements = $("[class*=' state_'], [class^=state_]", context);
            var elements_to_show = state_elements.filter(".state_"+state_name+", [class*=state_not_]:not(.state_not_"+state_name+")");
            var elements_to_hide = state_elements.not(elements_to_show);
            elements_to_hide.each(function(i) {
                $(this).goto_state("hide", settings);
            });
            elements_to_show.each(function(i) {
                $(this).goto_state("show", settings);
            });
            
            this.current.state_name = state_name;
            this.set_hash();
        },
        
        // Change Page
        
        goto_page: function(page_name, options) {
            if ($("#"+this.defaults.page_container).length == 0) {
                alert("No #"+this.defaults.page_container);
                return;
            }
            
            if (this.current.page_name == page_name) return;
            
            page_container = $("#"+this.defaults.page_container);
            var settings = {
                page_transition: this.defaults.page_transition,
                page_transition_duration: this.defaults.page_transition_duration,
                initial_state: this.defaults.initial_state
            };
            $.extend(settings, options);
            
            var page_elements = $("[class*=' page_'], [class^=page_]");
            var elements_to_show = page_elements.filter(".page_"+page_name+", [class*=page_not_]:not(.page_not_"+page_name+")");
            var elements_to_hide = page_elements.not(elements_to_show);
            elements_to_show.each(function(i) {
                $(this).goto_state("show", settings);
            });
            elements_to_hide.each(function(i) {
                $(this).goto_state("hide", settings);
            });
            
            var old_page = page_container.find(".page");
            var new_page = $("<div class='page' id='page_" + page_name + "'></div>");
            new_page.load(this.defaults.page_directory + page_name + this.defaults.page_extension, function() {
                new_page.hide();
                page_container.css({overflow:"hidden"});
                page_container.append(new_page);
                new_page.width(page_container.width());
                new_page.height(page_container.height());
                new_page.css({position: "absolute"});
                // Open new page in initial (or target) state
                $.psm.goto_state(options.initial_state, $.psm.defaults, new_page);
                var end_animation = function() {
                    old_page.remove();
                    page_container.css({overflow:"visible"});
                }
                // Page transition
                switch (settings.page_transition) {
                    case "fade":
                        new_page.css({top: 0, left: 0});
                        new_page.fadeIn(settings.page_transition_duration);
                        old_page.fadeOut(settings.page_transition_duration, end_animation);
                    break;
                    case "slide_left":
                        new_page.css({top: 0, left: page_container.width()});
                        new_page.show();
                        new_page.animate({left: 0}, settings.page_transition_duration);
                        old_page.animate({left: -page_container.width()}, settings.page_transition_duration, end_animation);
                    break;
                    case "slide_right":
                        new_page.css({top: 0, left: -page_container.width()});
                        new_page.show();
                        new_page.animate({left: 0}, settings.page_transition_duration);
                        old_page.animate({left: page_container.width()}, settings.page_transition_duration, end_animation);
                    break;
                    case "slide_up":
                        new_page.css({top: page_container.height(), left: 0});
                        new_page.show();
                        new_page.animate({top: 0}, settings.page_transition_duration);
                        old_page.animate({top: -page_container.height()}, settings.page_transition_duration, end_animation);
                    break;
                    case "slide_down":
                        new_page.css({top: -page_container.height(), left: 0});
                        new_page.show();
                        new_page.animate({top: 0}, settings.page_transition_duration);
                        old_page.animate({top: page_container.height()}, settings.page_transition_duration, end_animation);
                    break;
                    default:
                        new_page.css({top: 0, left: 0});
                        new_page.show();
                        end_animation();
                    break;
                }
            });
            if (this.current.page_name && $.inArray(this.current.page_name, this.defaults.exclude_from_history) < 0) this.page_history_add(this.current.page_name, settings.page_transition);
            this.current.page_name = page_name;
            this.set_hash();
        },
        
        // Utility
        
        set_defaults: function(options) {
            $.extend(this.defaults, options);
        },
        set_hash: function() {
            var hash = "";
            if (this.current.page_name && this.current.page_name != "") {
                hash += "page_" + this.current.page_name;
            }
            if (this.current.state_name) hash += "_state_" + this.current.state_name;
            window.location.hash = hash;
        },
        get_reverse_transition: function(transition) {
            switch(transition) {
                case "slide_up": return "slide_down";
                case "slide_down": return "slide_up";
                case "slide_left": return "slide_right";
                case "slide_right": return "slide_left";
                default: return transition;
            }
        },
        
        // Page History
        
        page_history_add: function(page_name, page_transition) {
            this.page_history.push({name: page_name, transition: page_transition});
        },
        page_history_go_back: function() {
            var last_page = this.page_history.pop();
            this.goto_page(last_page.name, {page_transition: this.get_reverse_transition(last_page.transition)});
        }
    };
    
    // Method to change internal state of an element (show/hide)
    $.fn.extend({
        goto_state: function(state_name, options) {
            var settings = {
                state_transition: $.psm.defaults.state_transition,
                state_transition_duration: $.psm.defaults.state_transition_duration
            }
            $.extend(settings, options);
            return this.each(function() {
                if (state_name == $(this).data("psm_state_name")) return;
                var animation_options = {};
                var animation_options_set = false;
                if ($(this).hasClass("fade") || settings.state_transition == "fade") {
                    animation_options.opacity = state_name;
                    animation_options_set = true;
                }
                if ($(this).hasClass("slide_down") || settings.state_transition == "slide_down") {
                    animation_options.height = state_name;
                    animation_options.marginTop = state_name;
                    animation_options.marginBottom = state_name;
                    animation_options.paddingTop = state_name;
                    animation_options.paddingBottom = state_name;
                    animation_options_set = true;
                }
                if ($(this).hasClass("slide_right") || settings.state_transition == "slide_right") {
                    animation_options.width = state_name;
                    animation_options.marginLeft = state_name;
                    animation_options.marginRight = state_name;
                    animation_options.paddingLeft = state_name;
                    animation_options.paddingRight = state_name;
                    animation_options_set = true;
                }
                if(settings.state_transition == "none" || !animation_options_set) {
                   if (state_name == "show") $(this).show(); else $(this).hide();
                } else {
                    $(this).animate(animation_options, settings.state_transition_duration);
                }
                $(this).data("psm_state_name", state_name);
            });          
        }
    });
    
    // PSM Action Triggers
    // ===================
    // 
    // Global Actions
    // --------------
    // #page_x
    // #state_y
    // #page_x_state_y
    // #history_back
    // 
    // Element Actions
    // ---------------
    // #show_el
    // #hide_el
    // #toggle_el
    
    // Change page (and state)
    $("a[href*='#page_']").live("click", function(e) {
        var options = {};
        var page_and_state = $(this).attr("href").match(/#page_(\w+)_state_(\w+)/);
        if (page_and_state) {
            var page_name = page_and_state[1];
            var state_name = page_and_state[2];
        } else var page_name = $(this).attr("href").match(/#page_(\w+)/)[1];
        if (state_name) options.initial_state = state_name;
        var page_transition = $(this).attr("class").match(/(fade|slide_left|slide_right|slide_up|slide_down|none)/);
        if (page_transition) options.page_transition = page_transition[1];
        if ($(this).hasClass("no_history")) options.no_history = true;
        $.psm.goto_page(page_name, options);
        e.preventDefault();
    });
    
    // Go one step back in the page history
    $("a[href*=#history_back]").live("click", function(e) {
        $.psm.page_history_go_back();
        e.preventDefault();
    });
    
    // Change state of current page
    $("a[href*='#state_']").live("click", function(e) {
        var state_name = $(this).attr("href").match(/#state_(\w+)/)[1];
        var options = {};
        var state_transition = $(this).attr("class").match(/force_(\w+)/);
        if (state_transition) options.state_transition = state_transition[1];
        $.psm.goto_state(state_name, options);
        e.preventDefault();
    });
            
    // Change one particular element's internal state
    $("a[href*=#show_], a[href*=#hide_], a[href*=#toggle_]").live("click", function(e) {
        var options = {};
        var state_transition = $(this).attr("class").match(/force_(\w+)/);
        if (state_transition) options.state_transition = state_transition[1];
        
        var results = $(this).attr("href").match(/#(show|hide|toggle)_(\w+)/g);
        for (var i in results) {
            var result = results[i].match(/#(show|hide|toggle)_(\w+)/);
            var state_name = result[1];
            var element_id = result[2];
            if (state_name == "toggle") {
                var current_state = $("#"+element_id).data("psm_state_name");
                if (current_state == "hide" || $("#"+element_id+":visible").length == 0) {
                    $("#"+element_id).goto_state("show", options);
                } else {
                    $("#"+element_id).goto_state("hide", options);
                }
            } else {
                $("#"+element_id).goto_state(state_name, options);
            }
        }
        e.preventDefault();
    });    
})(jQuery);