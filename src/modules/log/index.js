
window.onerror = function (message, source, lineno, colno, error) {
	// 异域js需加crossorigin属性，及Access-Control-Allow-Origin: *返回头
	const errObj = {
		m: message,
		s: source,
		l: lineno,
		c: colno,
		e: error && error.stack || error,
	}
	errorLog(errObj);
}


function errorLog(err) {
	if (typeof _hmt === 'undefined') return;
	_hmt.push(['_trackEvent', 'error', '0', JSON.stringify(err)]);
}

