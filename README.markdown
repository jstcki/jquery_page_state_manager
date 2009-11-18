PSM - A jQuery Page State Manager
=================================

LICENSE
-------

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

WHAT IS PSM?
------------

PSM is a prototyping tool which allows you to define different states of
a HTML page. Each page element can be assigned to one or multiple states
in which it is visible. Additionally, you can define transitions for state
changes of each element.

USAGE
-----

Everything is handled by applying CSS classes to your elements.

Hello World Example:

    <div class="state_1 fade">Hello world!</div>

will fade in when you click on this link:
    
    <a href="#state_1">Say hello</a>

It will fade out when you switch to another state.

The initial state is "0", so everything with the class "state_0" will
appear when the page is loaded. Elements which do not have any "state_"
class assigned stay visible all the time.

States can have arbitrary names. If you assign a link the href "#state_foo",
clicking on it will switch to state "foo" and all elements with the class
"state_foo" will appear.

A more advanced example:
    
    <div class="state_foo state_bar fade">
        I will appear in states "foo" and "bar" and fade in and out
        smoothly.
    </div>
    
    <div class="state_not_bar">
        I won't appear in state "bar"
    </div>
    
    <a href="#state_foo" class="force_fade">
        I will switch to state "bar" and force all elements to fade in or
        out.
    </a>

Another thing you can do is show and hide elements independently
of the page state (they can also have transitions assigned). These 
elements have their own state. You address them by their ID.

    <div id="hey">Hey!</div>
    <div id="ho fade">Ho!</div>
    
    <a href="#show_hey">Show Hey</a>
    <a href="#hide_hey">Hide Hey</a>
    <a href="#toggle_ho">Show and hide Ho</a>

One last thing: you can initialize PSM to an arbitrary state
by calling

    jQuery.psm.init("your_state_name")
    
Actually it's the same as calling

    jQuery.psm.goto_state("your_state_name", {force_transition: "none"})

For more possibilities refer to psm_test.html

CHANGELOG
---------

2009-11-18 (v0.4):
    More state transitions (slide\_down, slide\_right), go to page and state

2009-10-27 (v0.3):
    Page history, element states depending on which page is loaded, syntax changes

2009-10-23 (v0.2):
    Page loading, transitions, defaults

2009-10-21 (v0.1):
    First public release
    
TODO
----

- ability to set states using javascript instead of CSS classes, so it 
  is unobstrusive?
- state conditionals (when in state 1 go to state 2 etc.)?
- add more transitions
- find a better name?
- save/load a page state with url hash
- state history?
- update documentation