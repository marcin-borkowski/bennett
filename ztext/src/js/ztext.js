/*!
 * ztext v0.0.1
 * Copyright 2020 Bennett Feely
 * https://bennettfeely.com/ztext
 */

z_default = {
	depth: "1rem",
	direction: "both",
	event: "none",
	eventRotation: "45deg",
	eventDirection: "default",
	fade: false,
	layers: 10,
	perspective: "500px",
	z: true,
};

// Get all elements with the data-z attribute
var zs = document.querySelectorAll("[data-z]");
zs.forEach((z) => {
	// Make uniform option keys
	options = {
		depth: z.dataset.zDepth || z_default.depth,
		direction: z.dataset.zDirection || z_default.direction,
		event: z.dataset.zEvent || z_default.event,
		eventRotation: z.dataset.zEventrotation || z_default.eventRotation,
		eventDirection: z.dataset.zEventdirection || z_default.eventDirection,
		fade: z.dataset.zFade || z_default.fade,
		layers: parseFloat(z.dataset.zLayers) || z_default.layers,
		perspective: z.dataset.zPerspective || z_default.perspective,
		zEngaged: z.dataset.z || z_default.z,
	};

	draw(z, options);
});

// JS constructor
function Ztextify(selector, options) {
	var zs = document.querySelectorAll(selector);

	zs.forEach((z) => {
		draw(z, options);
	});
}

function draw(z, options) {
	var z_engaged = options.zEngaged || z_default.zEngaged;

	if (z_engaged !== "false") {
		var depth = options.depth || z_default.depth;
		var depth_unit = depth.match(/[a-z]+/)[0];
		var depth_numeral = parseFloat(depth.replace(depth_unit, ""));

		var direction = options.direction || z_default.direction;

		var event = options.event || z_default.event;
		var event_rotation = options.eventRotation || z_default.eventRotation;
		var event_rotation_unit = event_rotation.match(/[a-z]+/)[0];
		var event_rotation_numeral = parseFloat(
			event_rotation.replace(event_rotation_unit, "")
		);
		var event_direction = options.eventDirection || z_default.eventDirection;

		var fade = options.fade || z_default.fade;
		var layers = options.layers || z_default.layers;
		var perspective = options.perspective || z_default.perspective;
		var transform = options.transform || z_default.transform;

		// Grab the text and replace it with a new structure
		var text = z.innerHTML;
		z.innerHTML = "";
		z.style.display = "inline-block";
		z.style.position = "relative";
		z.style.webkitPerspective = perspective;
		z.style.perspective = perspective;

		// Create a wrapper span that will hold all the layers
		var zText = document.createElement("span");
		zText.setAttribute("class", "z-text");
		zText.style.display = "inline-block";
		zText.style.webkitTransformStyle = "preserve-3d";
		zText.style.transformStyle = "preserve-3d";

		// Create a layer for transforms from JS to be applied
		// CSS is stupid that transforms cannot be applied individually
		var zLayers = document.createElement("span");
		zLayers.setAttribute("class", "z-layers");
		zLayers.style.display = "inline-block";
		zLayers.style.webkitTransformStyle = "preserve-3d";
		zLayers.style.transformStyle = "preserve-3d";

		zText.append(zLayers);

		for (i = 0; i < layers; i++) {
			let pct = i / layers;

			// Create a layer
			var zLayer = document.createElement("span");
			zLayer.setAttribute("class", "z-layer");
			zLayer.innerHTML = text;
			zLayer.style.display = "inline-block";

			// Shift the layer on the z axis
			if (direction === "backwards") {
				var zTranslation = -pct * depth_numeral;
			}
			if (direction === "both") {
				var zTranslation = -(pct * depth_numeral) + depth_numeral / 2;
			}
			if (direction === "forwards") {
				var zTranslation = -(pct * depth_numeral) + depth_numeral;
			}

			var transform = "translateZ(" + zTranslation + depth_unit + ")";
			zLayer.style.webkitTransform = transform;
			zLayer.style.transform = transform;

			// Manipulate duplicate layers
			if (i >= 1) {
				// Overlay duplicate layers on top of each other
				zLayer.style.position = "absolute";
				zLayer.style.top = 0;
				zLayer.style.left = 0;

				// Hide duplicate layres from screen readers and user interation
				zLayer.setAttribute("aria-hidden", "true");

				zLayer.style.pointerEvents = "none";

				zLayer.style.mozUserSelect = "none";
				zLayer.style.msUserSelect = "none";
				zLayer.style.webkitUserSelect = "none";
				zLayer.style.userSelect = "none";

				// Incrementally fade layers if option is enabled
				if (fade === true || fade === "true") {
					zLayer.style.opacity = (1 - pct) / 2;
				}
			}

			// Add layer to wrapper span
			zLayers.append(zLayer);
		}

		// Finish adding everything to the original element
		z.append(zText);

		// Rotate .z-text as a function of x and y coordinates
		function tilt(x_pct, y_pct) {
			if (event_direction == "reverse") {
				var event_direction_adj = -1;
			} else {
				var event_direction_adj = 1;
			}

			var x_tilt = x_pct * event_rotation_numeral * event_direction_adj;
			var y_tilt = -y_pct * event_rotation_numeral * event_direction_adj;
			var unit = event_rotation_unit;

			var transform =
				"rotateX(" + y_tilt + unit + ") rotateY(" + x_tilt + unit + ")";
			zLayers.style.webkitTransform = transform;
			zLayers.style.transform = transform;
		}

		// Capture mousemove and touchmove events and rotate .z-layers
		if (event === "pointer") {
			window.addEventListener(
				"mousemove",
				(e) => {
					var x_pct = e.clientX / window.innerWidth - 0.5;
					var y_pct = e.clientY / window.innerHeight - 0.5;

					tilt(x_pct, y_pct);
				},
				false
			);

			window.addEventListener(
				"touchmove",
				(e) => {
					var x_pct = e.touches[0].clientX / window.innerWidth - 0.5;
					var y_pct = e.touches[0].clientY / window.innerHeight - 0.5;

					tilt(x_pct, y_pct);
				},
				false
			);
		}
	}
}
