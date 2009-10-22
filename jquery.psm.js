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
        init: function(state_name) {
            this.goto_state(state_name, {force_transition: "none"});
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
            this.current_state = state_name;
        },
        current_state: ""
    };
    
    $.fn.extend({
        goto_state: function(state_name, options) {
            var settings = {
                force_transition: false
            }
            $.extend(settings, options);
            
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
                    if ($(this).hasClass("fade") || settings.transition == "fade") {
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
            return this;
        }
    });
    
    jQuery("[class*='goto_state_']").live("click", function(e) {
        var state_name = $(this).attr("class").match(/goto_state_(\w+)/)[1];
        var options = {};
        var force_transition = $(this).attr("class").match(/force_(\w+)/);
        if (force_transition) options.force_transition = force_transition[1];
        jQuery.psm.goto_state(state_name, options);
        e.preventDefault();
    });
    
    jQuery("[class*='show_'], [class*='hide_'], [class*='toggle_']").live("click", function(e) {
        var options = {};
        var force_transition = $(this).attr("class").match(/force_(\w+)/);
        if (force_transition) options.force_transition = force_transition[1];
        
        var results = $(this).attr("class").match(/(show|hide|toggle)_(\w+)/g);
        for (var i in results) {
            var result = results[i].match(/(show|hide|toggle)_(\w+)/);
            var state_name = result[1];
            var element_id = result[2];
            if (state_name == "toggle") {
                var current_state = jQuery("#"+element_id).data("psm_state_name");
                if (current_state == "hide" || jQuery("#"+element_id+":visible").length == 0) {
                    jQuery("#"+element_id).goto_state("show", options);
                } else {
                    jQuery("#"+element_id).goto_state("hide", options);
                }
            } else {
                jQuery("#"+element_id).goto_state(state_name, options);
            }
        }
        e.preventDefault();
    });
    
})(jQuery);

jQuery(function() {
    jQuery.psm.init(0);
});