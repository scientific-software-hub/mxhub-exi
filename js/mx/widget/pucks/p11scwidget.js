/**
* This class extends the SampleChangerWidget class for a P11SC
*
* @class P11SCWidget
* @constructor
*/
function P11SCWidget (args) {
	
	SampleChangerWidget.call(this,args);
	this.name = 'P11SC';
	this.label = 'Sample changer';
	this.sampleChangerCapacity = 23;
    this.initAlpha = -7*2*Math.PI/16;
    this.data = {
        id : this.id,
        radius : this.radius,
        cells : 1,
        lines : [],
        text :[]
    };
	
    this.createStructure(this.sampleChangerCapacity);
	this.createPucks("Unipuck", this.sampleChangerCapacity);
};


P11SCWidget.prototype.blink = SampleChangerWidget.prototype.blink;
P11SCWidget.prototype.getPuckIndexFromAngle = SampleChangerWidget.prototype.getPuckIndexFromAngle;
P11SCWidget.prototype.createPucks = SampleChangerWidget.prototype.createPucksP11SC;
P11SCWidget.prototype.getPanel = SampleChangerWidget.prototype.getPanel;
P11SCWidget.prototype.load = SampleChangerWidget.prototype.load;
P11SCWidget.prototype.getStructure = SampleChangerWidget.prototype.getStructure;
P11SCWidget.prototype.findPuckById = SampleChangerWidget.prototype.findPuckById;
P11SCWidget.prototype.getAllPucks = SampleChangerWidget.prototype.getAllPucks;
P11SCWidget.prototype.render = SampleChangerWidget.prototype.render;
P11SCWidget.prototype.setClickListeners = SampleChangerWidget.prototype.setClickListeners;
P11SCWidget.prototype.disablePucksOfDifferentCapacity = SampleChangerWidget.prototype.disablePucksOfDifferentCapacity;
P11SCWidget.prototype.allowAllPucks = SampleChangerWidget.prototype.allowAllPucks;
P11SCWidget.prototype.getPuckData = SampleChangerWidget.prototype.getPuckData;
P11SCWidget.prototype.getAllFilledPucks = SampleChangerWidget.prototype.getAllFilledPucks;
P11SCWidget.prototype.loadSamples = SampleChangerWidget.prototype.loadSamples;
P11SCWidget.prototype.emptyAllPucks = SampleChangerWidget.prototype.emptyAllPucks;
P11SCWidget.prototype.enableAllPucks = SampleChangerWidget.prototype.enableAllPucks;
P11SCWidget.prototype.disablePuck = SampleChangerWidget.prototype.disablePuck;
P11SCWidget.prototype.enablePuck = SampleChangerWidget.prototype.enablePuck;
P11SCWidget.prototype.removeClassToAllPucks = SampleChangerWidget.prototype.removeClassToAllPucks;
P11SCWidget.prototype.addClassToPuck = SampleChangerWidget.prototype.addClassToPuck;
P11SCWidget.prototype.rotateCirclePosition = SampleChangerWidget.prototype.rotateCirclePosition;


/**
* Converts the idLocation to the corresponding location in the P11SC by convention
*
* @method convertIdToSampleChangerLocation
* @return The corresponding location in the P11SC by convention
*/
P11SCWidget.prototype.convertIdToSampleChangerLocation = function (idLocation) {
	var n = Number(idLocation.split("-")[1]);
	return n;
};

/**
* Converts the sample changer location in a P11SC to the id of the puck
*
* @method convertSampleChangerLocationToId
* @return The corresponding id of the puck in the given location
*/
P11SCWidget.prototype.convertSampleChangerLocationToId = function (sampleChangerLocation) {
	if (sampleChangerLocation <= 23 && sampleChangerLocation > 0) {
		var n = sampleChangerLocation;
		return this.id + "-" + n + "-1";
	} else {
		return null;
	}
};

P11SCWidget.prototype.onRender = function () {
	var puckIds = [];
	for (i = 0; i < puckIds.length; i++) {
		var puck = this.findPuckById(this.id +"-" +puckIds[i] +"-1");
		this.addClassToPuck(puck,"puck-always-disabled");
		puck.addClassToCells("cell-always-disabled");
	}
}

/**
 * Creates the particular structure of the P11SC
 *
 * @method createStructure
 */
P11SCWidget.prototype.createStructure = function (n) {
    var textSize = Math.round((15-7)*(this.data.radius-100)/(200-100) + 7);
	var cx = 0;
	var cy = 0;
	var init_x = 170;
	var init_y = 170;
	var steps_out = 14;
	var radius_out = 140;
	var steps_inner = 8;
	var radius_inner = 80;
	var offset = 23;

	// Write label for central puck
	this.data.text.push({
		text: 1,
		x: init_x,
		y: init_y - offset,
		textSize: textSize - 3
	});

	// Write labels for inner circle pucks
	for (var z = 0; z < steps_inner; z++) {
		cx = (init_x + radius_inner * Math.cos(2 * Math.PI * z / steps_inner));
		cy = (init_y + radius_inner * Math.sin(2 * Math.PI * z / steps_inner));

		var rotated_points_inner = this.rotateCirclePosition(init_x, init_y, cx, cy, 90);

		this.data.text.push({
			text: z + 2,
			x: rotated_points_inner[0],
			y: rotated_points_inner[1] - offset,
			textSize: textSize - 3
		});
	}

	// Write labels for outer circle pucks
	for (var i = 0; i < steps_out; i++) {
		cx = (init_x + radius_out * Math.cos(2 * Math.PI * i / steps_out));
		cy = (init_y + radius_out * Math.sin(2 * Math.PI * i / steps_out));

		var rotated_points_outer = this.rotateCirclePosition(init_x, init_y, cx, cy, 90);

		this.data.text.push({
			text: i + 10,
			x: rotated_points_outer[0],
			y: rotated_points_outer[1] - offset,
			textSize: textSize - 3
		});
	}

};
