var isLive = true;
var apiUrl = '';
if (isLive) {
	apiUrl = 'http://127.0.0.1:3000/';	
}


// hotel structure - used for tags
var hotels;
var package_info = {};

// base data if local
if (!isLive) {
	hotels = [
		{
			id: 1,
			name: "Richard's Luxury B&B",
			tags: [1],
			packages: [] // an array of packages
		},
		{
			id: 2,
			name: "Jan's Luxury B&B",
			tags: [1, 2],
			packages: [] // an array of packages
		},
		{
			id: 3,
			name: "Martin's Luxury B&B",
			tags: [3],
			packages: [] // an array of packages
		}
	];

	package_info = {
		tags: [
			{
				id: 1,
				name: {
					'en-gb': "Sports",
					'nl': "Sportief"
				},
				description: {
					'en-gb': "A sporty hotel",
					'nl': "En sportief hotel"
				}
			},
			{
				id: 2,
				name: {
					'en-gb': "Wellness",
					'nl': "Welzijn"
				},
				description: {
					'en-gb': "A hotel with a health focus",
					'nl': "En hotel met een gezondheid focus"
				}
			},
			{
				id: 3,
				name: {
					'en-gb': "City Location",
					'nl': "Gezellige Stad"
				},
				description: {
					'en-gb': "Hotel in a great location",
					'nl': "Hotel met een leuke locatie"
				}
			}
		],
		additions: [
			{
				id: 1,
				tags: [1], // which tags does this addition show for (-1 for all)
				name: {
					'en-gb': "Golf - Nine Holes",
					'nl': "Golf - Negen Holes"
				}
			},
			{
				id: 2,
				tags: [-1], // which tags does this addition show for (-1 for all)
				name: {
					'en-gb': "Breakfast",
					'nl': "Ontbijt"
				}
			},
			{
				id: 3,
				tags: [-1], // which tags does this addition show for (-1 for all)
				name: {
					'en-gb': "Free Parking",
					'nl': "Vrij Parkeren"
				}
			},
			{
				id: 4,
				tags: [2], // which tags does this addition show for (-1 for all)
				name: {
					'en-gb': "Spa day",
					'nl': "Spa Dag"
				}
			},
		]
	};

	// example of final output (gets added to hotel.packages)
	var package = {
		active: 1,
		date_start: null,
		date_end: null,
		title: {
			'en-gb': "Breakfast and Golf",
			'nl': "Ontbijt en Golf"
		},
		description: {
			'en-gb': "Enjoy a English Breakfast, followed by 9 holes on our incredible course",
			'nl': "Ontbijt en Golf - heel lekker toch"
		},
		additions: [1],
		// assuming there's a site wide currency converter...
		current_cost: 400,
		discount: 10,
		actual_cost: 360,
		available: 100,
		sold: 0
	};

	var package2 = {
		active: 1,
		date_start: null,
		date_end: null,
		title: {
			'en-gb': "Free Parking and Breakfast",
			'nl': "Vrij Parkeren en Ontbijt"
		},
		description: {
			'en-gb': "Park your car and fill up on a delicious breakfast, at no additional cost",
			'nl': "Vrij Parkeren en Ontbijt - yum yum"
		},
		additions: [3, 2],
		// assuming there's a site wide currency converter...
		current_cost: 300,
		discount: 20,
		actual_cost: 240,
		available: 3,
		sold: 47
	};

	hotels[0].packages.push(package);
	hotels[0].packages.push(package2);
}

// get from server
var server_data = {
	clean: function(data) {
		/*
			Shouldn't have to do this, should parse on the api side
		*/
		// hotels
		for (var i=0; i<data.hotels.length; i++) {
			var hotel = data.hotels[i];
			hotel.tags = JSON.parse(hotel.tags);
			hotel.packages = JSON.parse(hotel.packages);
		}
		hotels = data.hotels;
		// tags
		for (var i=0; i<data.package_info.tags.length; i++) {
			var tag = data.package_info.tags[i];
			tag.description = JSON.parse(tag.description);
			tag.name = JSON.parse(tag.name);
		}
		package_info.tags = data.package_info.tags;
		// additions
		for (var i=0; i<data.package_info.additions.length; i++) {
			var addition = data.package_info.additions[i];
			addition.tags = JSON.parse(addition.tags);
			addition.name = JSON.parse(addition.name);
		}
		package_info.additions = data.package_info.additions;
		server_data.finished();
	},
	finished: function() {
		console.log('Data fetched and cleaned');
	}
}