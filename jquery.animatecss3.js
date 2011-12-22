(function ($) {
	$.fn.animatecss3 = function (css3properties, defaultproperties, options) {
		var o = $.extend({
				duration: 0,
				easing: "ease",
				complete: null,
				queue: true
			}, options);
			
		return this.each(function () {
			
		});
	};
	
	$.fn.animatecss3.tools = {
		vendorPrefixes: 'Webkit Moz O ms Khtml'.split(' '),
        hasProp: (function () {
            var contextStyle = document.createElement("div").style,
                cachedProps = {};
			
            return function (prop) {
                var hasProp = false,
                    upper = prop.charAt(0).toUpperCase() + prop.slice(1),
					prefixes = $.fn.animatecss3.tools.vendorPrefixes;
					
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
				
                cachedProps[prop] = hasProp;
                return hasProp;
            };
        }()),
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
				
                hasProp = $.fn.animatecss3.tools.hasProp(prop);
				
                if (hasProp) {
                    contextStyle[hasProp] = "";
                    contextStyle[hasProp] = value;
                    if (contextStyle[hasProp] !== "") {
                        hasPropAndValue = true;
                    }
                }
				
                propsAndValues[prop][value] = hasPropAndValue;
                return hasPropAndValue;
            };
        }())
    };
}(jQuery));