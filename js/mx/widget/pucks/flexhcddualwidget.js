/**
* This class extends the SampleChangerWidget class for a FlexHCD
*
* @class FlexHCDDualWidget
* @constructor
*/
function FlexHCDDualWidget (args) {
	
	SampleChangerWidget.call(this,args);
	
	this.name = 'FlexHCDDual';
	this.label = 'FlexHCDDual';
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
	this.createPucks("Spinepuck", this.data.cells/2, -7*Math.PI/8, this.data.radius/2, 0.5, {dAlpha : Math.PI/16, dist : 3*this.data.radius/4});
	this.createPucks("Unipuck", this.data.cells/2, -5*Math.PI/8, this.data.radius/2, 0.5, {dAlpha : Math.PI/16, dist : 3*this.data.radius/4});
};


FlexHCDDualWidget.prototype.blink = SampleChangerWidget.prototype.blink;
FlexHCDDualWidget.prototype.getPuckIndexFromAngle = SampleChangerWidget.prototype.getPuckIndexFromAngle;
FlexHCDDualWidget.prototype.createPucks = SampleChangerWidget.prototype.createPucks;
FlexHCDDualWidget.prototype.getPanel = SampleChangerWidget.prototype.getPanel;
FlexHCDDualWidget.prototype.load = SampleChangerWidget.prototype.load;
FlexHCDDualWidget.prototype.getStructure = SampleChangerWidget.prototype.getStructure;
FlexHCDDualWidget.prototype.findPuckById = SampleChangerWidget.prototype.findPuckById;
FlexHCDDualWidget.prototype.getAllPucks = SampleChangerWidget.prototype.getAllPucks;
FlexHCDDualWidget.prototype.render = SampleChangerWidget.prototype.render;
FlexHCDDualWidget.prototype.setClickListeners = SampleChangerWidget.prototype.setClickListeners;
FlexHCDDualWidget.prototype.disablePucksOfDifferentCapacity = SampleChangerWidget.prototype.disablePucksOfDifferentCapacity;
FlexHCDDualWidget.prototype.allowAllPucks = SampleChangerWidget.prototype.allowAllPucks;
FlexHCDDualWidget.prototype.getPuckData = SampleChangerWidget.prototype.getPuckData;
FlexHCDDualWidget.prototype.getAllFilledPucks = SampleChangerWidget.prototype.getAllFilledPucks;
FlexHCDDualWidget.prototype.loadSamples = SampleChangerWidget.prototype.loadSamples;
FlexHCDDualWidget.prototype.emptyAllPucks = SampleChangerWidget.prototype.emptyAllPucks;
FlexHCDDualWidget.prototype.enableAllPucks = SampleChangerWidget.prototype.enableAllPucks;
FlexHCDDualWidget.prototype.disablePuck = SampleChangerWidget.prototype.disablePuck;
FlexHCDDualWidget.prototype.enablePuck = SampleChangerWidget.prototype.enablePuck;
FlexHCDDualWidget.prototype.removeClassToAllPucks = SampleChangerWidget.prototype.removeClassToAllPucks;
FlexHCDDualWidget.prototype.addClassToPuck = SampleChangerWidget.prototype.addClassToPuck;
FlexHCDDualWidget.prototype.createHCDStructure = SampleChangerWidget.prototype.createHCDStructure;
/**
* Creates the particular structure of the FlexHCD
*
* @method createStructure
*/
FlexHCDDualWidget.prototype.createStructure = function () {
	this.createHCDStructure();
};

/**
* Converts the idLocation to the corresponding location in the FlexHCD by convention
*
* @method convertIdToSampleChangerLocation
* @return The corresponding location in the FlexHCD by convention
*/
FlexHCDDualWidget.prototype.convertIdToSampleChangerLocation = function (idLocation) {
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
FlexHCDDualWidget.prototype.convertSampleChangerLocationToId = function (sampleChangerLocation) {
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

FlexHCDDualWidget.prototype.onRender = function () {
	//Disable the 24th puck
	var puck24 = this.findPuckById(this.id + "-8-3");
	this.addClassToPuck(puck24,"puck-recovery");
	puck24.addClassToCells("cell-always-disabled");
}