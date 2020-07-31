// helpers.js
/*
	A loose collection of small helper classes
*/

var _help = {};

//Any url methods
_help.url = {
	getParamByName: function (name) {
		/// <summary>
		/// Get url param value from url param name
		/// </summary>
		/// <param name="name">name of url param</param>
		/// <returns>Value of param</returns>

		var match = RegExp('[?&]' + name + '=([^&]*)')
			.exec(window.location.search);
		return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
	},

	getParams: function () {
		/// <summary>
		/// Get all url params
		/// </summary>
		/// <returns>An object made of params and vals</returns>

		var vars = {};
		var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
			vars[key] = value;
		});
		return vars;
	}
};

_help.findInObjArray = function (prop, obj, needle, position) {
	 /// <summary>
	 /// Find in Array, useful for searching an array of objects
	 /// </summary>
	 /// <param name="prop">Property searching for</param>
	 /// <param name="obj">Array of objects you want to search</param>
	 /// <param name="needle">What you're searching for</param>
	 /// <param name="position">Optional flag to find position of element</param>
	 /// <returns>An array of objects that match</returns>
	 var returnObj = [];
	 for (var i = 0; i < obj.length; i++) {
		if (!obj[i]) {
			return;
		}
		  if (obj[i].hasOwnProperty(prop)) {
				if (needle == obj[i][prop]) {
					 if (position) {
						  returnObj.push(i);
					 } else {
						  returnObj.push(obj[i]);
					 }
				}
		  }
	 }
	 return returnObj[0];
};

_help.removeFromObjArray = function (prop, obj, needle) {
	/// <summary>
	/// Remove object from Array, useful for searching an array of objects and removing a match
	/// </summary>
	/// <param name="prop">Property searching for</param>
	/// <param name="obj">Array of objects you want to search</param>
	/// <param name="needle">What you're searching for</param>
	/// <returns>Bool</returns>
	var removed = false;
	for (var i = 0; i < obj.length; i++) {
		if (obj[i].hasOwnProperty(prop)) {
			if (needle == obj[i][prop]) {
				obj.splice([i], 1);
				removed = true;
			}
		}
	}
	if (removed) { return removed; }
};