/**
* This class extends the SampleChangerWidget class for a FlexHCD
*
* @class FlexHCDUnipuckPlateWidget
* @constructor
*/
function FlexHCDUnipuckPlateWidget (args) {
	
	SampleChangerWidget.call(this,args);
	
	this.name = 'FlexHCDUnipuckPlate';
	this.label = 'FlexHCDUnipuckPlate';
	this.sampleChangerCapacity = 24;
	this.initAlpha = -7*2*Math.PI/16;
	this.data = {
        id : this.id,
		radius : this.radius,
		cells : 8,
		lines : [],
		text :[]
	};
	
	this.createStructure();
	this.createPucks("Unipuck", this.data.cells, -7*Math.PI/8, this.data.radius/2, 0.5, {dAlpha : Math.PI/16, dist : 3*this.data.radius/4});

	
};


FlexHCDUnipuckPlateWidget.prototype.blink = SampleChangerWidget.prototype.blink;
FlexHCDUnipuckPlateWidget.prototype.getPuckIndexFromAngle = SampleChangerWidget.prototype.getPuckIndexFromAngle;
FlexHCDUnipuckPlateWidget.prototype.createPucks = SampleChangerWidget.prototype.createPucks;
FlexHCDUnipuckPlateWidget.prototype.getPanel = SampleChangerWidget.prototype.getPanel;
FlexHCDUnipuckPlateWidget.prototype.load = SampleChangerWidget.prototype.load;
FlexHCDUnipuckPlateWidget.prototype.getStructure = SampleChangerWidget.prototype.getStructure;
FlexHCDUnipuckPlateWidget.prototype.findPuckById = SampleChangerWidget.prototype.findPuckById;
FlexHCDUnipuckPlateWidget.prototype.getAllPucks = SampleChangerWidget.prototype.getAllPucks;
FlexHCDUnipuckPlateWidget.prototype.render = SampleChangerWidget.prototype.render;
FlexHCDUnipuckPlateWidget.prototype.setClickListeners = SampleChangerWidget.prototype.setClickListeners;
FlexHCDUnipuckPlateWidget.prototype.disablePucksOfDifferentCapacity = SampleChangerWidget.prototype.disablePucksOfDifferentCapacity;
FlexHCDUnipuckPlateWidget.prototype.allowAllPucks = SampleChangerWidget.prototype.allowAllPucks;
FlexHCDUnipuckPlateWidget.prototype.getPuckData = SampleChangerWidget.prototype.getPuckData;
FlexHCDUnipuckPlateWidget.prototype.getAllFilledPucks = SampleChangerWidget.prototype.getAllFilledPucks;
FlexHCDUnipuckPlateWidget.prototype.loadSamples = SampleChangerWidget.prototype.loadSamples;
FlexHCDUnipuckPlateWidget.prototype.emptyAllPucks = SampleChangerWidget.prototype.emptyAllPucks;
FlexHCDUnipuckPlateWidget.prototype.enableAllPucks = SampleChangerWidget.prototype.enableAllPucks;
FlexHCDUnipuckPlateWidget.prototype.disablePuck = SampleChangerWidget.prototype.disablePuck;
FlexHCDUnipuckPlateWidget.prototype.enablePuck = SampleChangerWidget.prototype.enablePuck;
FlexHCDUnipuckPlateWidget.prototype.removeClassToAllPucks = SampleChangerWidget.prototype.removeClassToAllPucks;
FlexHCDUnipuckPlateWidget.prototype.addClassToPuck = SampleChangerWidget.prototype.addClassToPuck;
FlexHCDUnipuckPlateWidget.prototype.createHCDStructure = SampleChangerWidget.prototype.createHCDStructure;

/**
* Creates the particular structure of the FlexHCD
*
* @method createStructure
*/
FlexHCDUnipuckPlateWidget.prototype.createStructure = function () {
	this.createHCDStructure();
};

/**
* Converts the idLocation to the corresponding location in the FlexHCD by convention
*
* @method convertIdToSampleChangerLocation
* @return The corresponding location in the FlexHCD by convention
*/
FlexHCDUnipuckPlateWidget.prototype.convertIdToSampleChangerLocation = function (idLocation) {
	var n = Number(idLocation.split("-")[1]);
	var i = Number(idLocation.split("-")[2]);
	return (n-1)*3 + i;
};

/**
* Converts the sample changer location in a FlexHCD to the id of the puck
*
* @method convertSampleChangerLocationToId
* @return The corresponding id of the puck in the given location
*/
FlexHCDUnipuckPlateWidget.prototype.convertSampleChangerLocationToId = function (sampleChangerLocation) {
	if (sampleChangerLocation <= 24 && sampleChangerLocation > 0) {
		var n = Math.floor(sampleChangerLocation/3) + 1;
		var i = sampleChangerLocation % 3;
		if (i == 0){
			n--;
			i = 3;
		}
		return this.id + "-" + n + "-" + i;
	} else {
		return null;
	}
};

FlexHCDUnipuckPlateWidget.prototype.onRender = function () {
	//Disable the 24th puck
	var puck24 = this.findPuckById(this.id + "-8-3");
	this.addClassToPuck(puck24,"puck-recovery");
	puck24.addClassToCells("cell-always-disabled");
}