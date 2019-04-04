/* Hello there */
var dark_sky_api_key = 'e6c964e768708278b2dd1e5393296b2e',
	google_places_api_key = 'AIzaSyBwmxzDlhMqLhObyOGd8ai-hnxmQO8k1Bs';
function init() {
	var e = _getUrlParameter('units-toggle');
	if ('us' == e || 'si' == e)
		document.querySelector('[value="' + e + '"]').checked = !0;
	else {
		var t = store.get('antiweather-units');
		null !== t &&
			(document.querySelector('[value="' + t + '"]').checked = !0);
	}
	setupMap('home', 40.4406, -79.9959),
		setupMap('away', -40.4406, 100.0041),
		getLocation(),
		document
			.querySelector('#c_toggle')
			.addEventListener('change', changeUnits),
		document
			.querySelector('#f_toggle')
			.addEventListener('change', changeUnits);
}
function changeUnits() {
	var e = document.querySelector('[name="units-toggle"]:checked').value;
	store('antiweather-units', e);
	var t = document.querySelector('.home').getAttribute('data-lng'),
		r = document.querySelector('.home').getAttribute('data-lat'),
		a = document.querySelector('.away').getAttribute('data-lng'),
		n = document.querySelector('.away').getAttribute('data-lat');
	null !== t &&
		null !== r &&
		null !== a &&
		null !== n &&
		(getWeather('home', parseInt(r), parseInt(t)),
		getWeather('away', parseInt(n), parseInt(a)));
}
function getLocation() {
	var e = document.getElementById('search'),
		t = new google.maps.places.Autocomplete(e, {
			types: ['(cities)'],
			placeIdOnly: !0
		}),
		a = new google.maps.Geocoder();
	t.addListener('place_changed', function() {
		var r = t.getPlace();
		a.geocode({ placeId: r.place_id }, function(e, t) {
			(console.log(e), console.log(t), 'OK' !== t)
				? console.log('Geocoder failed due to: ' + t)
				: (initSearch(
						e[0].geometry.location.lat(),
						e[0].geometry.location.lng()
				  ),
				  setLocation('home', r.name));
		});
	});
}
function initSearch(e, t) {
	document.querySelector('#search').click();
	var r = -1 * e;
	if (0 < (a = -1 * t)) var a = -(a - 180);
	else a = -(a + 180);
	getWeather('home', e, t), getWeather('away', r, a);
}
function getPlacename(a, e, t) {
	var r = { lat: e, lng: t };
	new google.maps.Geocoder().geocode({ location: r }, function(e, t) {
		if ('OK' === t)
			if (e[0]) {
				var r = e.length - 3;
				setLocation(a, e[r].formatted_address);
			} else setLocation(a, 'Middle of Nowhere');
		else
			'ZERO_RESULTS' == t
				? setLocation(a, 'Middle of Nowhere')
				: (setLocation(a, 'Somewhere'),
				  console.log('Geocoder failed due to: ' + t));
	});
}
function setLocation(e, t) {
	fill(e, 'location', t),
		fill('quick-' + e, 'quick-location', t),
		fill(
			e,
			'forecast-heading',
			'Middle of Nowhere' == t || 'North Pole' == t || 'South Pole' == t
				? 'Forecast for the ' + t
				: 'Pittsburgh' == t
					? 'Forecast for the City of Champions'
					: 'Forecast for ' + t
		);
}
function getWeather(t, r, a, n) {
	document.querySelector('.' + t).classList.remove('has-weather'),
		document.querySelector('.quick-wrapper').classList.remove('has-weather'),
		document.querySelector('html').classList.add('is-loading'),
		document.querySelector('.' + t).classList.add('is-loading-' + t),
		document.querySelector('.' + t).setAttribute('data-lat', r),
		document.querySelector('.' + t).setAttribute('data-lng', a);
	var e = document.querySelector('[name="units-toggle"]:checked').value;
	JSONP({
		url:
			'https://api.darksky.net/forecast/' +
			dark_sky_api_key +
			'/' +
			r +
			',' +
			a +
			'?units=' +
			e +
			'&exclude=alerts,hourly,minutely',
		success: function(e) {
			extractWeather(t, r, a, n, e);
		},
		error: function(e) {
			setTimeout(function() {
				document.querySelector('html').classList.remove('is-loading'),
					document
						.querySelector('.home')
						.classList.remove('is-loading-home'),
					document
						.querySelector('.away')
						.classList.remove('is-loading-away'),
					document.querySelector('.home').classList.remove('has-weather'),
					document.querySelector('.away').classList.remove('has-weather'),
					document
						.querySelector('.quick-wrapper')
						.classList.remove('has-weather');
			}, 600);
		}
	});
}
function getElevation(a, e, t, n) {
	new google.maps.ElevationService().getElevationForLocations(
		{ locations: [{ lat: e, lng: t }] },
		function(e, t) {
			if ('OK' === t)
				if (e[0]) {
					var r = formatElevation(e[0].elevation, n);
					fill(a, 'elevation', r);
				} else fill(a, 'elevation', 'N/A');
			else fill(a, 'elevation', 'N/A');
		}
	);
}
function extractWeather(e, t, r, a, n) {
	fillCurrentlyCard({
		apparentTemperature: n.currently.apparentTemperature,
		cloudCover: n.currently.cloudCover,
		currentlySummary: n.currently.summary,
		currentTime: n.currently.time,
		dailySummary: n.daily.summary,
		dewPoint: n.currently.dewPoint,
		humidity: n.currently.humidity,
		icon: n.currently.icon,
		lat: t,
		lng: r,
		location: e,
		ozone: n.currently.ozone,
		pre_placename: a,
		pressure: n.currently.pressure,
		sunriseTime: n.daily.data[0].sunriseTime,
		sunsetTime: n.daily.data[0].sunsetTime,
		temperature: n.currently.temperature,
		timezone: n.timezone,
		units: n.flags.units,
		uv: n.currently.uvIndex,
		visibility: n.currently.visibility,
		windBearing: n.currently.windBearing,
		windGust: n.currently.windGust,
		windSpeed: n.currently.windSpeed
	}),
		makeForecastCard({
			forecast: n.daily,
			location: e,
			timezone: n.timezone,
			units: n.flags.units
		});
}
function fillCurrentlyCard(e) {
	var t = e.location;
	if (
		(void 0 !== e.temperature && cardColor(t, e.units, e.temperature),
		setupMap(t, e.lat, e.lng),
		void 0 !== e.lat && void 0 !== e.lng)
	) {
		var r =
			'<span class="prefix">Coordinates: </span>' +
			formatCoords(e.lat, e.lng);
		fill(t, 'coordinates', r);
	} else fill(t, 'coordinates', 'Coordinates not available');
	if (
		(getElevation(t, e.lat, e.lng, e.units),
		void 0 !== e.pre_placename
			? setLocation(t, e.pre_placename)
			: 'away' == t && getPlacename('away', e.lat, e.lng),
		void 0 !== e.temperature)
	) {
		var a = '<svg><use xlink:href="#' + e.icon + '"></use></svg>',
			n = formatTemp(e.temperature);
		fill(t, 'temperature', a + n), fill('quick-' + t, 'quick-temperature', n);
	} else
		fill(t, 'temperature', a + '--&deg;'),
			fill('quick-' + t, 'quick-temperature', '--&deg;');
	var o = formatSummary(e);
	fill(t, 'summary', o),
		fill('quick-' + t, 'quick-summary', e.currentlySummary);
	var i = moment
		.unix(e.currentTime)
		.tz(e.timezone)
		.format('h:mm a');
	fill(t, 'time', i);
	var l = moment
		.unix(e.currentTime)
		.tz(e.timezone)
		.format('dddd, MMMM Do');
	fill(t, 'date', l);
	var s = formatTemp(e.apparentTemperature);
	if ((fill(t, 'apparenttemperature', s), void 0 !== e.cloudCover)) {
		var u = formatPct(e.cloudCover);
		fill(t, 'cloudcover', u);
	} else fill(t, 'cloudcover', '<span class="not-available">N/A</span>');
	if (void 0 !== e.windSpeed) {
		var c = formatSpeed(e.windSpeed, e.units);
		if (void 0 !== e.windBearing)
			var d = c + ' ' + formatBearing(e.windBearing);
		else d = c;
		fill(t, 'wind', d);
	} else fill(t, 'wind', '<span class="not-available">N/A</span>');
	if (void 0 !== e.windGust) {
		var m = formatSpeed(e.windGust, e.units);
		fill(t, 'windgust', m);
	} else fill(t, 'windgust', '<span class="not-available">N/A</span>');
	if (void 0 !== e.humidity) {
		var f = formatPct(e.humidity);
		fill(t, 'humidity', f);
	} else fill(t, 'humidity', '<span class="not-available">N/A</span>');
	if (void 0 !== e.dewPoint) {
		var p = formatTemp(e.dewPoint);
		fill(t, 'dewpoint', p);
	} else fill(t, 'dewpoint', '<span class="not-available">N/A</span>');
	if (void 0 !== e.pressure) {
		var v = formatPressure(e.pressure, e.units);
		fill(t, 'pressure', v);
	} else fill(t, 'pressure', '<span class="not-available">N/A</span>');
	if (void 0 !== e.uv) {
		var y = formatUv(e.uv);
		fill(t, 'uv', y);
	} else fill(t, 'uv', '<span class="not-available">N/A</span>');
	if (void 0 !== e.ozone) {
		var g = formatOzone(e.ozone);
		fill(t, 'ozone', g);
	} else fill(t, 'ozone', '<span class="not-available">N/A</span>');
	if (void 0 !== e.visibility) {
		var h = formatDistance(e.visibility, e.units);
		fill(t, 'visibility', h);
	} else fill(t, 'visibility', '<span class="not-available">N/A</span>');
	if (void 0 !== e.sunriseTime) {
		var w = moment
			.unix(e.sunriseTime)
			.tz(e.timezone)
			.format('h:mm a');
		fill(t, 'sunrise', w);
	} else fill(t, 'sunrise', '<span class="not-available">N/A</span>');
	if (void 0 !== e.sunsetTime) {
		var S = moment
			.unix(e.sunsetTime)
			.tz(e.timezone)
			.format('h:mm a');
		fill(t, 'sunset', S);
	} else fill(t, 'sunset', '<span class="not-available">N/A</span>');
	setTimeout(function() {
		document.querySelector('html').classList.remove('is-loading'),
			document.querySelector('.' + t).classList.remove('is-loading-' + t),
			document.querySelector('.' + t).classList.add('has-weather'),
			document.querySelector('.quick-wrapper').classList.add('has-weather');
	}, 400);
}
function cardColor(e, t, r) {
	document
		.querySelector('.' + e)
		.classList.remove(
			'temp-0',
			'temp-1',
			'temp-2',
			'temp-3',
			'temp-4',
			'temp-5',
			'temp-6',
			'temp-7',
			'temp-8',
			'temp-9',
			'temp-10'
		),
		document
			.querySelector('.quick-' + e)
			.classList.remove(
				'temp-0',
				'temp-1',
				'temp-2',
				'temp-3',
				'temp-4',
				'temp-5',
				'temp-6',
				'temp-7',
				'temp-8',
				'temp-9',
				'temp-10'
			);
	var a = cardColorScale(t, r);
	document.querySelector('.' + e).classList.add(a),
		document.querySelector('.quick-' + e).classList.add(a);
}
function cardColorScale(e, t) {
	if ('us' == e) {
		if (100 <= t) var r = 10;
		else if (90 <= t) r = 9;
		else if (80 <= t) r = 8;
		else if (70 <= t) r = 7;
		else if (60 <= t) r = 6;
		else if (50 <= t) r = 5;
		else if (40 <= t) r = 4;
		else if (30 <= t) r = 3;
		else if (20 <= t) r = 2;
		else if (10 <= t) r = 1;
		else if (t < 10) r = 0;
	} else if ('si' == e)
		if (37.7 <= t) r = 10;
		else if (32.2 <= t) r = 9;
		else if (26.7 <= t) r = 8;
		else if (21.1 <= t) r = 7;
		else if (15.6 <= t) r = 6;
		else if (10 <= t) r = 5;
		else if (4.4 <= t) r = 4;
		else if (-1.1 <= t) r = 3;
		else if (-6.7 <= t) r = 2;
		else if (-12.2 <= t) r = 1;
		else if (t < -17.8) r = 0;
	return 'temp-' + r;
}
function setupMap(e, n, o) {
	document.querySelector('.' + e + ' .map').innerHTML = '';
	var i = 1e3,
		l = d3.geo
			.orthographic()
			.scale(i / 2.1)
			.clipAngle(90)
			.translate([500, 500]),
		s = d3.geo.graticule(),
		u = d3
			.select('.' + e + ' .map')
			.append('canvas')
			.attr('width', i)
			.attr('height', i)
			.node()
			.getContext('2d'),
		c = d3.geo
			.path()
			.projection(l)
			.context(u);
	d3.scale
		.linear()
		.domain([0, i])
		.range([-180, 180]),
		d3.scale
			.linear()
			.domain([0, i])
			.range([90, -90]);
	d3.json('src/world-110m.json', function(e, t) {
		if (e) throw e;
		var r = topojson.feature(t, t.objects.land),
			a = s();
		u.clearRect(0, 0, i, i),
			u.beginPath(),
			c({ type: 'Sphere' }),
			(u.fillStyle = 'rgba(0,0,0,.3)'),
			u.fill(),
			l.rotate([-o, -n]),
			u.beginPath(),
			c(r),
			(u.fillStyle = 'rgba(255,255,255,.9)'),
			u.fill(),
			u.beginPath(),
			c(a),
			(u.lineWidth = 2),
			(u.strokeStyle = 'rgba(128,128,128,.2)'),
			u.stroke();
	}),
		d3.select(self.frameElement).style('height', i + 'px');
}
function makeForecastCard(e) {
	var t = e.location;
	for (
		document.querySelector('.' + t + ' .forecast-wrapper').innerHTML = '',
			i = 0;
		i < e.forecast.data.length;
		i++
	) {
		var r = e.forecast.data[i],
			a = moment
				.unix(r.time)
				.tz(e.timezone)
				.format('dddd');
		moment
			.unix(r.time)
			.tz(e.timezone)
			.format('MMM Do');
		if (void 0 !== r.summary) r.summary;
		else;
		if (void 0 !== r.icon)
			var n =
				'<svg class="forecast-icon"><use xlink:href="#' +
				r.icon +
				'"></use></svg>';
		else n = '<svg><use xlink:href="#clear"></use></svg>';
		if (void 0 !== r.temperatureHigh)
			var o = formatTemp(r.temperatureHigh),
				l = ' ' + cardColorScale(e.units, r.temperatureHigh);
		else (o = '--&deg;'), (l = '');
		if (void 0 !== r.temperatureLow) var s = formatTemp(r.temperatureLow);
		else s = '--&deg;';
		append(
			t,
			'forecast-wrapper',
			'<div class="forecast-item-wrapper full' +
				l +
				'" tabindex="1"><div class="forecast-item"><div class="forecast-day-wrapper"><div class="forecast-day">' +
				a +
				'</div></div><div class="forecast-temperature-wrapper">' +
				n +
				'<div class="forecast-temperature high">' +
				o +
				'</div><div class="forecast-temperature low">' +
				s +
				'</div></div></div></div>'
		);
	}
}
function _getUrlParameter(e) {
	e = e.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
	var t = new RegExp('[\\?&]' + e + '=([^&#]*)').exec(location.search);
	return null === t ? void 0 : decodeURIComponent(t[1].replace(/\+/g, ' '));
}
function fill(e, t, r) {
	document.querySelector('.' + e + ' .' + t).innerHTML = r;
}
function append(e, t, r) {
	document.querySelector('.' + e + ' .' + t).innerHTML += r;
}
function formatCoords(e, t) {
	return e.toFixed(4) + ', ' + t.toFixed(4);
}
function formatTemp(e) {
	return Math.round(e) + '&deg;';
}
function formatSummary(e) {
	if (void 0 !== e.currentlySummary)
		var t = formatCurrentlySummary(e.currentlySummary);
	else t = '';
	if (void 0 !== e.dailySummary) var r = e.dailySummary;
	else r = '';
	return null == e.currentlySummary && null == e.dailySummary
		? 'Weekly forecast summary not available.'
		: t + r;
}
function formatCurrentlySummary(e) {
	return (e = e.toLowerCase()).charAt(0).toUpperCase() + e.slice(1) + '. ';
}
function formatPct(e) {
	return Math.round(100 * e) + '%';
}
function formatSpeed(e, t) {
	if ('us' == t) var r = 'mph';
	if ('si' == t) r = 'km/h';
	return Math.round(e) + ' ' + r;
}
function formatPressure(e, t) {
	if ('us' == t) var r = 'mb';
	if ('si' == t) r = 'hPa';
	return Math.round(e) + ' ' + r;
}
function formatDistance(e, t) {
	if ('us' == t) var r = 'mi';
	if ('si' == t) r = 'km';
	return Math.round(e) + ' ' + r;
}
function formatElevation(e, t) {
	if (0 <= e) var r = '<span class="prefix">Elevation: </span>';
	else r = '<span class="prefix">Ground Elevation: </span>';
	return 'us' == t
		? r + Math.round(3.28084 * e).toLocaleString() + ' ft'
		: 'si' == t
			? e < -10 || 10 < e
				? r + Math.round(e).toLocaleString() + ' m'
				: r + (Math.round(10 * e) / 10).toLocaleString() + ' m'
			: void 0;
}
function formatBearing(e) {
	return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][
		Math.floor(e / 22.5 + 0.5) % 8
	];
}
function formatUv(e) {
	if (11 < e) var t = 'Extreme';
	else if (8 < e) t = 'Very high';
	else if (6 < e) t = 'High';
	else if (3 < e) t = 'Moderate';
	else t = 'Low';
	return e + ' (' + t + ')';
}
function formatOzone(e) {
	return Math.round(e) + ' DU';
}
document.addEventListener('DOMContentLoaded', init, !1),
	function() {
		var e, s, u, n, c, r, a, d;
		(u = function(e) {
			return window.document.createElement(e);
		}),
			(n = window.encodeURIComponent),
			(a = Math.random),
			(e = function(e) {
				var t, r, a, n, o, i, l;
				if (
					(null == e && (e = {}),
					((i = {
						data: e.data || {},
						error: e.error || c,
						success: e.success || c,
						beforeSend: e.beforeSend || c,
						complete: e.complete || c,
						url: e.url || ''
					}).computedUrl = s(i)),
					0 === i.url.length)
				)
					throw new Error('MissingUrl');
				return (
					(n = !1) !== i.beforeSend({}, i) &&
						((a = e.callbackName || 'callback'),
						(r = e.callbackFunc || 'jsonp_' + d(15)),
						(t = i.data[a] = r),
						(window[t] = function(e) {
							return (
								(window[t] = null), i.success(e, i), i.complete(e, i)
							);
						}),
						((l = u('script')).src = s(i)),
						(l.async = !0),
						(l.onerror = function(e) {
							return (
								i.error({ url: l.src, event: e }),
								i.complete({ url: l.src, event: e }, i)
							);
						}),
						(l.onload = l.onreadystatechange = function() {
							var e, t;
							if (
								!(
									n ||
									('loaded' !== (e = this.readyState) &&
										'complete' !== e)
								)
							)
								return (
									(n = !0),
									l
										? ((l.onload = l.onreadystatechange = null),
										  null != (t = l.parentNode) && t.removeChild(l),
										  (l = null))
										: void 0
								);
						}),
						(o =
							window.document.getElementsByTagName('head')[0] ||
							window.document.documentElement).insertBefore(
							l,
							o.firstChild
						)),
					{
						abort: function() {
							return (
								(window[t] = function() {
									return (window[t] = null);
								}),
								(n = !0),
								(null != l
								? l.parentNode
								: void 0)
									? ((l.onload = l.onreadystatechange = null),
									  l.parentNode.removeChild(l),
									  (l = null))
									: void 0
							);
						}
					}
				);
			}),
			(c = function() {}),
			(s = function(e) {
				var t;
				return (
					(t = e.url),
					(t += e.url.indexOf('?') < 0 ? '?' : '&') + r(e.data)
				);
			}),
			(d = function(e) {
				var t;
				for (t = ''; t.length < e; )
					t += a()
						.toString(36)
						.slice(2, 3);
				return t;
			}),
			(r = function(t) {
				var r, a;
				return (function() {
					var e;
					for (r in ((e = []), t)) (a = t[r]), e.push(n(r) + '=' + n(a));
					return e;
				})().join('&');
			}),
			('undefined' != typeof define && null !== define
			? define.amd
			: void 0)
				? define(function() {
						return e;
				  })
				: ('undefined' != typeof module && null !== module
					? module.exports
					: void 0)
					? (module.exports = e)
					: (this.JSONP = e);
	}.call(this);