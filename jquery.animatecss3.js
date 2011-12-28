/*
 * jQuery animatecss3 plugin
 * 
 * The MIT License
 * 
 * Copyright (c) 2011 Florent Requin
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * The software is provided "as is", without warranty of any kind, express or
 * implied, including but not limited to the warranties of merchantability,
 * fitness for a particular purpose and noninfringement. In no event shall the
 * authors or copyright holders be liable for any claim, damages or other
 * liability, whether in an action of contract, tort or otherwise, arising from,
 * out of or in connection with the software or the use or other dealings in
 * the software.
 */


/*
 * The jQuery animatecss3 plugin, like the jQuery animate method, performs a
 * custom animation of a set of css properties and extra parameters.
 * In addition to that, in case these properties wouldn't be supported, it is
 * possible to define a fallback set of css properties and parameters to pass
 * to the classical jQuery animate method.
 * 
 * animatecss3 takes up to 4 parameters (the last three parameters are optionals) :
 * - css3properties: this first map of css properties which have to be animatable
 *     (http://www.w3.org/TR/css3-transitions/#animatable-properties-)
 *
 * - options: a map of additionnal parameters :
 *   - duration: the animation duration in ms (default: 400)
 *   - easing: a kind of easing used for the transition (default: 'ease')
 *   - complete: a function to call once the animation is completed (default: none)
 *   - queue: a Boolean indicating whether to place the animation in the effects
 *       queue (default: true)
 *   - test: determines if the animation could be done with css3 transition
 *       (default: 'allProps'). It could be a string ('allProps' => test all the
 *       css properties of css3properties, 'allPropsAndValues' => test all the css
 *       properties of css3properties associated with their values) or a specified
 *       function which result should be a Boolean.
 *
 * - failProperties: a second map of css properties passed to the jQuery animate
 *     method in case the test fails.
 *
 * - failOptions: a map of additionnal parameters for the jQuery animate method if
 *     the test fails (see http://api.jquery.com/animate/).
 */
(function ($) {
	var animatecss3 = $.fn.animatecss3 = function (css3properties, options, failProperties, failOptions) {
		var tools = animatecss3.tools,
			o = $.extend({}, animatecss3.defaultOptions, options),
			transitionProp = tools.hasProp('transition'), // (vendor prefixed or not) name of the transition property or false
			transitionendEventName = transitionProp ? tools.transitionendEventNames[transitionProp] : "",
			pass = transitionProp, // browser has to support transitions
			properties = [];
		
		animatecss3.transitionProp = transitionProp; // store the value
		animatecss3.transitionendEventName = transitionendEventName; // store the value
		
		if (pass) { // browser do support transitions
			if (typeof o.test === "string") { // "allProps" or "allPropsAndValues"
				pass = tools.test(o.test, css3properties, o);
			} else if (typeof o.test === "function") {
				pass = o.test(css3properties, o); // get the result of a custom test function
			}
		}
		
		if (!pass) { // fail ! :(
			if (failProperties && failOptions) {
				return this.animate(failProperties, failOptions); // fallback with animate method
			}
			
			// doesn't pass the test and no animate fallback => sorry !
			return this;
		}
		
		// win ! :)
		
		// copy the keys of css3properties into properties
		$.each(css3properties, function (property, value) {
			properties.push(property);
		});
			
		return this.each(function () {
			var el = this,
				$el = $(el),
				// the animation function
				animation = function () {
					console.log("executed");
					
					// binding transitionend event for handling the end of the animation
					$el.bind(transitionendEventName, {options: o}, animatecss3.transitionendHandler);
					
					// set the transitions to the element
					tools.setTransitions.apply(el, [properties, o.duration, o.easing, o.delay]);
					// then set the properties and their values
					$.each(properties, function (index, property) {
						tools.setProperty.apply(el, [property, css3properties[property]]);
					});
					
					// force transitionend event to trigger if duration equals 0ms
					if (o.duration === 0) {
						$el.trigger(transitionendEventName);
					};
				};
			
			if (o.queue) { // store the animation in the fx queue
				$el.queue(animation);
			} else { // the animation is immediatly executed
				animation();
			}
		});
	};
	
	animatecss3.defaultOptions = {
		duration: 400, // in milliseconds
		easing: "ease", // transition timing function
		delay: 0, // delay in milliseconds
		complete: null, // a callback executed at the end of the animation
		queue: true, // queue the animation in the fx queue or immediately execute it
		test: "allProps" // "allProps" or "allPropsAndValues" or custom boolean returning function
	};
	
	// handling of the end of an animation
	animatecss3.transitionendHandler = function (event) {
		var $this = $(this),
			options = event.data.options;
		
		console.log("dequeued");
		
		// get rid of the animation end binding
		$this.unbind(animatecss3.transitionendEventName, animatecss3.transitionendHandler);
		
		// execute the complete callback if passed
		if (typeof options.complete === "function") {
			options.complete.apply(this);
		}
		
		// next !
		$this.dequeue();
	};
	
	/*
	 * animatecss3 tools namespace
	 */
	animatecss3.tools = {
		vendorPrefixes: 'Webkit Moz O ms Khtml'.split(' '),
		transitionendEventNames: {
			'WebkitTransition': 'webkitTransitionEnd',
			'MozTransition': 'transitionend',
			'OTransition': 'oTransitionEnd',
			'msTransition': 'msTransitionEnd',
			'KhtmlTransition': 'khtmlTransitionEnd',
			'transition': 'transitionend'
		},
		/*
		 * Ttest if the browser support a property
		 * return the (possibly vendor prefixed) property name if supported
		 * else return false.
		 * Take a property name string as argument
		 */
        hasProp: (function () {
            var contextStyle = document.createElement("div").style,
                cachedProps = {};
			
            return function (prop) {
                var hasProp = false,
                    upper = prop.charAt(0).toUpperCase() + prop.slice(1),
					prefixes = animatecss3.tools.vendorPrefixes;
					
                if (typeof cachedProps[prop] !== "undefined") {
                    return cachedProps[prop];
                }
				
                if (typeof contextStyle[prop] === "string") {
                    hasProp = prop;
                } else {
                    for (var i = 0, max = prefixes.length; i < max; i += 1) {
                        if (typeof contextStyle[prefixes[i] + upper] === "string") {
                            hasProp = prefixes[i] + upper;
                            break;
                        }
                    }
                }
				
                return cachedProps[prop] = hasProp;
            };
        }()),
		
		/*
		 * Test if the browser suuport a css property associated with a value
		 * return true if supported, false otherwise
		 */
        hasPropAndValue: (function () {
            var contextStyle = document.createElement("div").style,
                propsAndValues = {};
			
            return function (prop, value) {
                var hasProp,
					hasPropAndValue = false;
				
				propsAndValues[prop] = propsAndValues[prop] || {};
				
                if (typeof propsAndValues[prop][value] !== "undefined") {
                    return propsAndValues[prop][value];
                }
				
                hasProp = animatecss3.tools.hasProp(prop);
				
                if (hasProp) {
                    contextStyle[hasProp] = "";
                    contextStyle[hasProp] = value;
                    if (contextStyle[hasProp] !== "") {
                        hasPropAndValue = true;
                    }
                }
				
                return propsAndValues[prop][value] = hasPropAndValue;
            };
        }()),
		
		/*
		 * Apply transitions to an element
		 * Take a properties array, a duration number (in ms) and an easing string
		 */
		setTransitions: function (properties, duration, easing, delay) {
			var durationSec = (duration / 1000) + "s",
				delaySec = (delay / 1000) + "s",
				currentTransitions = this.style[animatecss3.transitionProp],
				newTransitions = currentTransitions === "" ? [] : [currentTransitions];
			
			$.each(properties, function (index, property) {
				newTransitions.push([property, durationSec, easing, delaySec].join(" "));
			});
			
			this.style[animatecss3.transitionProp] = newTransitions.join(", ");
		},
		
		// Apply a property and a value to an element
		setProperty: function (property, value) {
			this.style[animatecss3.tools.hasProp(property)] = value;
		},
		
		/*
		 * Determine wheter an animation function using css3 transitions
		 * can be used.
		 * If what equals "allProps", all passed properties (array or object map)
		 * are tested.
		 * If what equals "allPropsAndValues", all passed css properties and values
		 * in the properties object map are tested.
		 * Return true if the test pass, false otherwise.
		 */
		test: function (what, properties, options) {
			var pass = true;
			
			if (what === "allProps") {
				$.each(properties, function (property) {
					if (!animatecss3.tools.hasProp(property)) {
						return pass = false;
					}
				});
			} else if (what === "allPropsAndValues") {
				$.each(properties, function (property, value) {
					if (!animatecss3.tools.hasPropAndValue(property, value)) {
						return pass = false;
					}
				});
			}
			
			return pass;
		}
    };
}(jQuery));