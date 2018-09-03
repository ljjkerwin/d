
var exposure = (function () {

    var collectExposure = function (wrapOrClassName, callback) {
        var wrap = wrapOrClassName;
        typeof wrapOrClassName === 'string' && (wrap = document.getElementsByClassName(wrapOrClassName)[0]);
        wrap || (wrap = document.body);

        var items = Array.prototype.slice.call(wrap.getElementsByClassName('on-visible')),
            i,
            len = items.length,
            item,
            result = [];

        var wrapRect = wrap.getBoundingClientRect();
        
        if (wrapRect.top != wrapRect.bottom) {
            for (i = 0; i < len; i++) {
                item = items[i];
                if (item.hasAttribute('isVisible')) {
                    continue;
                }
                if (isElementInViewport(item, wrapRect)) {
                    result.push(item);
                    item.setAttribute('isVisible', 1);
                }
            }
        }

        typeof callback === 'function' || (callback = commonCollectVisible);
        callback(result);
    }

    var bindScrollExposure = function (className, callback) {
        var wrap;
        className && (wrap = document.getElementsByClassName(className)[0]);
        wrap || (wrap = document.body);

        collectExposure(className, callback);
        wrap.addEventListener('scroll', debounce(function () {
            collectExposure(wrap, callback);
        }));
    }

    var commonCollectVisible = function (items) {
        var logs = [];

        items.forEach(function (item) {
            var namedNodeMap = item.attributes,
                params = {};

            for (var i = 0, len = namedNodeMap.length; i < len; i++) {
                var attr = namedNodeMap[i],
                    key;

                if (attr.name.indexOf('log-') === 0 || attr.name.indexOf('data-log-') === 0) {
                    key = attr.name.substring(4);

                    if (attr.name.indexOf('data-log-') === 0) {
                        key = attr.name.substring(9);
                    }

                    if (key) {
                        params[key] = encodeURIComponent(encodeURIComponent(attr.value));
                    }
                }
            }

            logs.push(params);
        })

        if (!logs.length) return;
        typeof _qla === 'undefined' || _qla('visible', {
            logs: JSON.stringify(logs)
        })
    }

    var isElementInViewport = function (el, wrapRect) {
        var rect = el.getBoundingClientRect();
        if (rect.bottom < wrapRect.top
            || rect.top > wrapRect.bottom
            || rect.right < wrapRect.left
            || rect.left > wrapRect.right
        ) {
            return false;
        }
        return true;
    }

    var debounce = function (fn, delay) {
        var timer;
        return function () {
            var args = arguments;
            var context = this;
            clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(context, args);
            }, delay || 200);
        }
    }

    return {
        collect: collectExposure,
        bindScroll: bindScrollExposure,
    }
})();


module.exports = exposure;