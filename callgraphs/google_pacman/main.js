google.dom = {};
google.pacManSound = true;
google.browser = {};
google.browser.engine = {}

google.dom.remove = function (a) {
	return a && a.parentNode && a.parentNode.removeChild(a)
};

google.dom.append = function (a) {
	return document.body.appendChild(a)
};

google.browser.engine.IE = false
google.pml = function () {
	function d(a) {
		if (!google.pml_installed) {
			google.pml_installed = true;
			if (!a) {
				document.getElementById("logo").style.background = "black";
				window.setTimeout(function () {
					var b = document.getElementById("logo-l");
					if (b) b.style.display = "block"
				}, 400)
			}
			a = document.createElement("script");
			a.type = "text/javascript";
			a.src = "src/js/pacman10-hp.3.js";
			document.body.appendChild(a)
		}
	}
	function e() {
		if (document.forms.f && document.forms.f.btnI) 
			document.forms.f.btnI.onclick = function () {
			typeof google.pacman != "undefined" ? google.pacman.insertCoin() : d(false);
			return false
		}
	}
	if (!google.pml_loaded) {
		google.pml_loaded = true;
		window.setTimeout(function () {
			alert(">>>" + document.forms.f)
			document.forms.f && d(true)
		}, 1E4);
		e();
	}
};
