var app = new Vue({
	el: '#app',
	data: {
		hotel: null,
		lang: 'en-gb',
		editMode: false,
		editIndex: null,
		// add package data
		availableAdditions: [],
		selectedAdditions: [],
		// add package form
		pkgTitle_en_gb: null,
		pkgTitle_nl: null,
		pkgDescription_en_gb: null,
		pkgDescription_nl: null,
		pkgCurrentCost: null,
		pkgDiscount: null,
		pkgActualCost: null,
		pkgAvailable: null,
		// add hotel form
		hotelName: null,
		hotelTags: [],
		hotelSelectedTags: [],
		// force hotel list to reload
		hotelIndex: 0,
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
				// need to reload them as hotels isn't responsive
				Vue.nextTick(function () {
					app.hotelIndex++;
				});
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


		// code
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
			tag = parseFloat(tag);
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
			this.resetPackage();
			this.showScreen('vp-add-package');
			
			// build select
			var options = "";
			var additions = this.getHotelAdditions();
			this.availableAdditions = additions;

			$('#pkgAdditionSelect').append(options);
		},
		editPackage(index) {
			if (event) {
				event.preventDefault();
			}

			this.resetPackage();
			this.editMode = true;
			this.editIndex = index;
			this.showScreen('vp-add-package');

			// add data into fields
			var package = this.hotel.packages[index];

			this.pkgTitle_en_gb = package.title['en-gb'];
			this.pkgTitle_nl = package.title['nl'];
			this.pkgDescription_en_gb = package.description['en-gb'];
			this.pkgDescription_nl = package.description['nl'];
			this.pkgCurrentCost = package.current_cost;
			this.pkgDiscount = package.discount;
			this.pkgActualCost = package.actual_cost;
			this.pkgAvailable = package.available;

			// add additions
			var additions = package_info.additions;
			for (var i=0; i<additions.length; i++) {
				var addition = additions[i];

				if (package.additions.indexOf(addition.id) !== -1) {
					this.selectedAdditions.push(addition);
				} else {
					// check if this addition is viewable by this hotel
					var enabled = false;
					for (var j=0; j<addition.tags.length; j++) {
						var tag = addition.tags[j];
						if (tag == -1) {
							enabled = true;
						}
						if (this.hotel.tags.indexOf(tag) !== -1) {
							enabled = true;
						}
					}
					if (enabled) {
						this.availableAdditions.push(addition);
					}
				}
			}
		},
		createAddPackageDisplay() {
		},
		cancelPackage(event, confirm) {
			if (event) {
				event.preventDefault();
			}
			// get confirmation first
			if (!confirm) {
				var title = `
					<span class="text-danger">Danger!</span>
				`;
				var message = `
					Are you sure you want to cancel creating this package? You will lose any data entered.
				`;
				bootbox.confirm({
					title: title,
					message: message,
					callback: (r) => {
						if (r) {
							app.cancelPackage(event, true);
						}
					}
				});
				return;
			}

			this.showScreen('vp-main');
			
			// reset data
			this.resetPackage();
		},
		calculateDiscount() {
			if (!this.pkgCurrentCost) {
				return;
			}

			if (!$.isNumeric(this.pkgCurrentCost)) {
				this.pkgCurrentCost = null;
				return;
			}

			if (!$.isNumeric(this.pkgDiscount)) {
				this.pkgDiscount = null;
				return;
			}

			var currentCost = parseFloat(this.pkgCurrentCost);
			var discountPerc = parseFloat(this.pkgDiscount);

			var discount = ((currentCost / 100) * discountPerc);
			var actualCost = currentCost - discount;

			this.pkgActualCost = actualCost;
		},
		resetPackage() {
			this.editMode = false;
			this.editIndex = null;
			this.availableAdditions = [];
			this.selectedAdditions = [];
			this.pkgTitle_en_gb = null;
			this.pkgTitle_nl = null;
			this.pkgDescription_en_gb = null;
			this.pkgDescription_nl = null;
			this.pkgCurrentCost = null;
			this.pkgDiscount = null;
			this.pkgActualCost = null;
			this.pkgAvailable = null;
		},
		createPackageObj() {
			var package = {
				active: 1,
				date_start: null,
				date_end: null,
				title: {
					'en-gb': this.pkgTitle_en_gb,
					'nl': this.pkgTitle_nl
				},
				description: {
					'en-gb': this.pkgDescription_en_gb,
					'nl': this.pkgDescription_nl
				},
				additions: [],
				// assuming there's a site wide currency converter...
				current_cost: this.pkgCurrentCost,
				discount: this.pkgDiscount,
				actual_cost: this.pkgActualCost,
				available: this.pkgAvailable,
				sold: 0
			};

			// add additions
			for (var i=0; i<this.selectedAdditions.length; i++) {
				var addition = this.selectedAdditions[i];
				package.additions.push(addition.id);
			}

			return package;
		},
		validatePackage() {
			if (!this.pkgTitle_en_gb) {
				bootbox.alert(`
					<h4>There is an error with your Package</h4>
					Package Name (English) is required
				`);
				return false;
			}

			if (!this.pkgTitle_nl) {
				bootbox.alert(`
					<h4>There is an error with your Package</h4>
					Package Name (Nederlands) is required
				`);
				return false;
			}

			if (!this.pkgDescription_en_gb) {
				bootbox.alert(`
					<h4>There is an error with your Package</h4>
					Package Description (English) is required
				`);
				return false;
			}

			if (!this.pkgDescription_nl) {
				bootbox.alert(`
					<h4>There is an error with your Package</h4>
					Package Description (Nederlands) is required
				`);
				return false;
			}

			if (!this.pkgCurrentCost) {
				bootbox.alert(`
					<h4>There is an error with your Package</h4>
					Current Cost is required
				`);
				return false;
			}

			if (!typeof(parseFloat(this.pkgCurrentCost)) == "number") {
				bootbox.alert(`
					<h4>There is an error with your Package</h4>
					Current Cost must be a number
				`);
				return false;
			}

			if (!this.pkgDiscount) {
				bootbox.alert(`
					<h4>There is an error with your Package</h4>
					Discount Percentage is required
				`);
				return false;
			}

			if (!typeof(parseFloat(this.pkgDiscount)) == "number") {
				bootbox.alert(`
					<h4>There is an error with your Package</h4>
					Discount Percentage must be a number
				`);
				return false;
			}

			if (!this.pkgActualCost) {
				bootbox.alert(`
					<h4>There is an error with your Package</h4>
					Actual Cost is required
				`);
				return false;
			}

			if (!typeof(parseFloat(this.pkgActualCost)) == "number") {
				bootbox.alert(`
					<h4>There is an error with your Package</h4>
					Actual Cost must be a number
				`);
				return false;
			}

			if (!this.pkgAvailable) {
				bootbox.alert(`
					<h4>There is an error with your Package</h4>
					Quantity Available is required
				`);
				return false;
			}

			if (!typeof(parseFloat(this.pkgAvailable)) == "number") {
				bootbox.alert(`
					<h4>There is an error with your Package</h4>
					Quantity Available must be a number
				`);
				return false;
			}

			return true;
		},
		savePackage() {
			// quick, rough validation
			if (!this.validatePackage()) {
				return false;
			}

			var package = this.createPackageObj();

			if (this.editMode) {
				this.hotel.packages[this.editIndex] = package;
			} else {
				this.hotel.packages.push(package);
			}

			// save data
			this.saveData();

			var message = "Package added";
			if (this.editMode) {
				message = "Package updated";
			}

			bootbox.alert(message, function() {
				app.showScreen('vp-main');
				app.resetPackage();
			});
		},
		// additions
		getHotelAdditions() {
			var tags = this.hotel.tags;
			var additions = [];

			for (var i=0; i<package_info.additions.length; i++) {
				var addition = package_info.additions[i];
				var tagList = addition.tags;
				
				var enabled = false;

				for (var j=0; j<tagList.length; j++) {
					var currentTag = tagList[j];
					// enabled for all
					if (currentTag === -1) {
						enabled = true;
					}
					// is in this hotels list
					if (tags.indexOf(currentTag) !== -1) {
						enabled = true;
					}
				}
				if (enabled) {
					additions.push(addition);
				}
			}

			return additions;
		},
		addAddition() {
			var addition;
			var additionId = $('#pkgAdditionSelect option:selected').val();
			additionId = parseFloat(additionId);
			
			var additionPos = _help.findInObjArray('id', this.availableAdditions, additionId, true);

			if (additionPos !== null) {
				addition = this.availableAdditions.splice(additionPos, 1);
				this.selectedAdditions.push(addition[0]);
			}
		},
		removeAddition(i) {
			event.preventDefault();
			var additionPos = _help.findInObjArray('id', this.selectedAdditions, i, true);

			if (additionPos !== null) {
				var addition = this.selectedAdditions.splice(additionPos, 1);
				this.availableAdditions.push(addition[0])
			}
		},
		// hotel
		getHotelLink(id) {
			return '?id=' + id;
		},
		addNewHotel() {
			var stepperVars = {
				id: "setup-wizard",
				// disableForwardBtn: true,
				// array of functions to confirm each step
				stepConfirm: [
					// step 1
					function() {
						if (!app.hotelName) {
							bootbox.alert(`
								<h4>There is an error with your Hotel</h4>
								Hotel name is required
							`);
							return false;
						}
						return true;
					},
					// step 2
					function() {
					}
				],
				// array of functions to run on each step load
				stepInit: [
					// step 1
					function() {
					},
					// step 2
					function() {
					}
				],
				finish: function() {
					app.createHotel();
					app.showScreen('vp-main');
					$("#setup-wizard").hide();

					bootbox.confirm({
						title: 'Hotel Created',
						message: 'Would you like to add a package now?',
						callback(r) {
							if (r) {
								app.addPackage();
							}
						}
					});
				}
			};

			// clone available tags
			var tags = JSON.stringify(package_info.tags);
			this.hotelTags = JSON.parse(tags);
			this.hotelSelectedTags = [];
			this.hotelName = null;

			hotelStepper = new Stepper(stepperVars);
			hotelStepper.init();
			$("#setup-wizard").show();

			$('.vp-screen').hide();
		},
		addTagToNewHotel(id) {
			if (event) {
				event.preventDefault();
			}
			var tagPos = _help.findInObjArray('id', this.hotelTags, id, true);

			if (tagPos !== null) {
				var tag = this.hotelTags.splice(tagPos, 1);
				this.hotelSelectedTags.push(tag[0]);
			}
		},
		removeTagFromNewHotel(id) {
			if (event) {
				event.preventDefault();
			}
			var tagPos = _help.findInObjArray('id', this.hotelSelectedTags, id, true);

			if (tagPos !== null) {
				var tag = this.hotelSelectedTags.splice(tagPos, 1);
				this.hotelTags.push(tag[0]);
			}
		},
		createHotel: function() {
			// get last id
			var id = (hotels[hotels.length-1].id + 1)
			var tags = [];
			for (var i=0; i<this.hotelSelectedTags.length; i++) {
				var tag = this.hotelSelectedTags[i];
				tags.push(tag.id);
			}
			var hotel = {
				id: id,
				name: this.hotelName,
				tags: tags,
				packages: [] // an array of packages
			}
			hotels.push(hotel);
			this.saveData();

			// reload hotel data
			this.hotelIndex++;

			// go to page
			this.loadHotel(id);
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

// keep the stepper outside of vue
var hotelStepper;