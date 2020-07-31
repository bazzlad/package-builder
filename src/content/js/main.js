var app = new Vue({
	el: '#app',
	data: {
		hotel: null,
		lang: 'en-gb'
	},
	computed: {
		hotelLoaded () {
			return this.hotel !== null;
		},
		hotelHasPackages () {
			return this.hotel.packages.length;
		}
	},
	mounted() {
		// get data
		if (localStorage.getItem('hotels')) {
			try {
				hotels = JSON.parse(localStorage.getItem('hotels'));
			} catch(e) {
				localStorage.removeItem('hotels');
			}
		}

		var hotelId = _help.url.getParamByName('id');
		if (hotelId) {
			hotelId = parseFloat(hotelId);
		}
		this.loadHotel(hotelId);

		// show main view
		$('#vp-main').show();
	},
	methods: {
		loadHotel(id) {
			var hotel = _help.findInObjArray('id', hotels, id);
			if (hotel) {
				this.hotel = hotel;
			}
		},
		switchLang() {
			switch (this.lang) {
				case 'en-gb':
					this.lang = 'nl';
				break;
				case 'nl':
					this.lang = 'en-gb';
				break;
			}
		},
		// tags
		getTagName(tag) {
			var tagObj = _help.findInObjArray('id', package_info.tags, tag);

			if (tagObj) {
				return tagObj.name[this.lang];
			} else {
				return null;
			}
		},
		removeTag(index) {
			if (event) {
				event.preventDefault();
			}
			this.hotel.tags.splice(index, 1);
			this.saveData();
		},
		addTag() {
			var content = "";
			var tags = package_info.tags;
			var newTags = [];

			// remove any tag the hotel already has
			for (var i=0; i<tags.length; i++) {
				var tag = tags[i];
				var tagId = tag.id;
				var isUsed = false;
				for (var j=0; j<this.hotel.tags.length; j++) {
					var hotelTag = this.hotel.tags[j];
					if (hotelTag == tagId) {
						isUsed = true;
					}
				}
				if (!isUsed) {
					newTags.push(tag);
				}
			}

			// build select
			if (newTags.length) {
				content += `
					<div class="form-group">
					<label for="addTagSelect">Select a theme</label>
						<select class="form-control" id="addTagSelect">
				`;

				for (i=0; i<newTags.length; i++) {
					var newTag = newTags[i];
					content += `
						<option value="${newTag.id}">
							${newTag.name[this.lang]}
						</option>
					`;
				}

				content += `
						</select>
					</div>
					<div id="addTagDescription">
					</div>

					<button type="button" class="btn btn-outline-dark" onclick="app.doAddTag()">Add Theme</button>
				`;

			} else {
				content += `
					<p>You have already selected all available themes</p>
				`;
			}

			bootbox.dialog({
				title: 'Add a theme to your hotel',
				message: content
			});
		},
		doAddTag() {
			var tag = $('#addTagSelect option:selected').val();
			this.hotel.tags.push(tag);

			this.saveData();
			bootbox.hideAll();
		},
		// packages
		getAdditionName(index) {
			var additionObj = _help.findInObjArray('id', package_info.additions, index);

			if (additionObj) {
				return additionObj.name[this.lang];
			} else {
				return null;
			}
		},
		deletePackage(index, confirm) {
			if (event) {
				event.preventDefault();
			}
			// get confirmation first
			if (!confirm) {
				var title = `
					<span class="text-danger">Danger!</span>
				`;
				var message = `
					Are you sure you want to delete this package? This cannot be undone.
				`;
				bootbox.confirm({
					title: title,
					message: message,
					callback: (r) => {
						if (r) {
							app.deletePackage(index, true);
						}
					}
				});
				return;
			}

			this.hotel.packages.splice(index, 1);
			this.saveData();
		},
		addPackage() {
			this.showScreen('vp-add-package');
		},
		createAddPackageDisplay() {
		},
 		// global functions
		saveData() {
			// save changes to local storage
			const parsed = JSON.stringify(hotels);
			localStorage.setItem('hotels', parsed);
		},
		showScreen(screenName) {
			if (!$('#' + screenName).length) {
				return;
			}
			$('.vp-screen').hide();
			$('#' + screenName).show();
			window.scrollTo(0, 0);
		}
	}
});