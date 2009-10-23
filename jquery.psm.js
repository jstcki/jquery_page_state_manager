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

See README for instructions.

*/


(function($) {
    $.psm = {
        defaults: {
            state_transition: "none",
            page_transition: "fade",
            page_container: "page_container",
            page_directory: "pages",
            page_extension: ".html",
            initial_page: "0",
            initial_state: "0"
        },
        current: {},
        init: function(state_name, options) {
            this.set_defaults(options);
            this.goto_state(state_name, {force_transition: "none"});
            if ($("#"+this.defaults.page_container).length > 0) {
                $("#"+this.defaults.page_container).css({overflow: "hidden", margin: 0, padding: 0, position: "relative"});
            }
            this.goto_page(this.defaults.initial_page);
        },
        set_defaults: function(options) {
            $.extend(this.defaults, options);
        },
        goto_state: function(state_name, options) {
            var settings = {
                force_transition: false
            }
            $.extend(settings, options);
            
            var state_elements = $("[class*=' state_'], [class^=state_]");
            var elements_to_show = state_elements.filter(".state_"+state_name+", [class*=state_not_]:not(.state_not_"+state_name+")");
            var elements_to_hide = state_elements.not(elements_to_show);
            elements_to_show.each(function(i) {
                $(this).goto_state("show", settings);
            });
            elements_to_hide.each(function(i) {
                $(this).goto_state("hide", settings);
            });
            this.current.state_name = state_name;
            this.set_hash();
        },
        goto_page: function(page_name, options) {
            if ($("#"+this.defaults.page_container).length == 0) {
                alert("No #"+this.defaults.page_container);
                return;
            }
            console.log(options);
                        
            page_container = $("#"+this.defaults.page_container);
            var settings = {page_transition: this.defaults.page_transition};
            $.extend(settings, options);
            var old_page = page_container.find(".page");
            var new_page = $("<div class='page' id='page_" + page_name + "'></div>");
            new_page.load(this.defaults.page_directory + "/" + page_name + this.defaults.page_extension, function() {
                new_page.hide();
                page_container.append(new_page);
                new_page.width(page_container.width());
                new_page.height(page_container.height());
                new_page.css({position: "absolute"});
                switch (settings.page_transition) {
                    case "fade":
                        new_page.css({top: 0, left: 0});
                        new_page.fadeIn();
                        old_page.fadeOut("def", function() {old_page.remove()});
                    break;
                    case "slide_left":
                        new_page.css({top: 0, left: page_container.width()});
                        new_page.show();
                        new_page.animate({left: 0});
                        old_page.animate({left: -page_container.width()}, function() {old_page.remove()});
                    break;
                    case "slide_right":
                        new_page.css({top: 0, left: -page_container.width()});
                        new_page.show();
                        new_page.animate({left: 0});
                        old_page.animate({left: page_container.width()}, function() {old_page.remove()});
                    break;
                    case "slide_up":
                        new_page.css({top: page_container.height(), left: 0});
                        new_page.show();
                        new_page.animate({top: 0});
                        old_page.animate({top: -page_container.height()}, function() {old_page.remove()});
                    break;
                    case "slide_down":
                        new_page.css({top: -page_container.height(), left: 0});
                        new_page.show();
                        new_page.animate({top: 0});
                        old_page.animate({top: page_container.height()}, function() {old_page.remove()});
                    break;
                }
            });
            this.current.page_name = page_name;
            this.set_hash();
        },
        set_hash: function() {
            var hash = "";
            if (this.current.page_name && this.current.page_name != "") {
                hash += "page_" + this.current.page_name + "_";
            }
            hash += "state_" + this.current.state_name;
            window.location.hash = hash;
        }
    };
    
    $.fn.extend({
        goto_state: function(state_name, options) {
            var settings = {
                force_transition: false
            }
            $.extend(settings, options);
            return this.each(function() {
                var animation_options = {};
                var animation_options_set = false;
                switch(state_name) {
                    case "show":
                        if ($(this).hasClass("fade") || settings.force_transition == "fade") {
                            animation_options.opacity = "show";
                            animation_options_set = true;
                        }
                        if(settings.force_transition == "none" || !animation_options_set) {
                           $(this).show();
                        } else {
                            $(this).animate(animation_options);
                        }
                    break;
                    case "hide":
                        if ($(this).hasClass("fade") || settings.force_transition == "fade") {
                            animation_options.opacity = "hide";
                            animation_options_set = true;
                        }
                        if(settings.force_transition == "none" || !animation_options_set) {
                            $(this).hide();
                        } else {
                            $(this).animate(animation_options);
                        }
                    break;
                }
                $(this).data("psm_state_name", state_name);
            });          
        }
    });
    
    $("a[href^='#state_']").live("click", function(e) {
        var state_name = $(this).attr("href").match(/#state_(\w+)/)[1];
        var options = {};
        var force_transition = $(this).attr("class").match(/force_(\w+)/);
        if (force_transition) options.force_transition = force_transition[1];
        $.psm.goto_state(state_name, options);
        e.preventDefault();
    });
    
    $("a[href^='#page_']").live("click", function(e) {
        var page_name = $(this).attr("href").match(/#page_(\w+)/)[1];
        var options = {};
        var page_transition = $(this).attr("class").match(/(fade|slide_left|slide_right|slide_up|slide_down)/);
        if (page_transition) options.page_transition = page_transition[1];
        $.psm.goto_page(page_name, options);
        e.preventDefault();
    });
    
    $("[class*='show_'], [class*='hide_'], [class*='toggle_']").live("click", function(e) {
        var options = {};
        var force_transition = $(this).attr("class").match(/force_(\w+)/);
        if (force_transition) options.force_transition = force_transition[1];
        
        var results = $(this).attr("class").match(/(show|hide|toggle)_(\w+)/g);
        for (var i in results) {
            var result = results[i].match(/(show|hide|toggle)_(\w+)/);
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

jQuery(function() {
    jQuery.psm.init(0);
});