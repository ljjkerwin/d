(function() {
	var $fixed, top, headerH = null, hasFixed = false;
	//临时占位div
	var tmpEle = $(document.createElement('div'));
	$(window).scroll(handleScroll);
	handleScroll();
	function handleScroll() {
		//自动fix的元素
		$fixed || ($fixed = $('#view-tab'));
		top || (top = $fixed.offset().top);
		if (headerH === null) {
			headerH = $('#header').height() || 0;
			tmpEle.css({
				height: $fixed.height() + $fixed.offset().top - $('.insure-services').offset().height - $('.insure-services').offset().top,
				width: '100%',
				display: 'none',
			});
			tmpEle.insertAfter($fixed);
		}
		if (top - $(window).scrollTop() - headerH < 0) {
			if (hasFixed) {
				return;
			}
			$fixed.css({
				position: 'fixed',
				top: headerH,
				marginTop: '0!important',
				zIndex: 999
			});
			tmpEle.show();
			hasFixed = true;
		} else {
			$fixed.attr('style', '');
			tmpEle.hide();
			hasFixed = false;
		}
	}
})();