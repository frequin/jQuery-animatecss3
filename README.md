jQuery animatecss3 plugin
=========================

The jQuery animatecss3 plugin, like the jQuery animate method, performs a
custom animation of a set of css properties and extra parameters.
In addition to that, in case these properties wouldn't be supported, it is
possible to define a fallback set of css properties and parameters to pass
to the classical jQuery animate method.

use
---

animatecss3 takes up to 4 parameters (the last three parameters are optionals) :
- css3properties: this first map of css properties which have to be animatable
    (http://www.w3.org/TR/css3-transitions/#animatable-properties-)

- options: a map of additionnal parameters :
  - duration: the animation duration in ms (default: 400)
  - easing: a kind of easing used for the transition (default: 'ease')
  - complete: a function to call once the animation is completed (default: none)
  - queue: a Boolean indicating whether to place the animation in the effects
      queue (default: true)
  - test: determines if the animation could be done with css3 transition
      (default: 'allProps'). It could be a string ('allProps' => test all the
      css properties of css3properties, 'allPropsAndValues' => test all the css
      properties of css3properties associated with their values) or a specified
      function which result should be a Boolean.

- failProperties: a second map of css properties passed to the jQuery animate
    method in case the test fails.

- failOptions: a map of additionnal parameters for the jQuery animate method if
    the test fails (see http://api.jquery.com/animate/).