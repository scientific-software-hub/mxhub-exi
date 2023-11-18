/**
* This class extends the SampleChangerWidget class for a RoboDiffHCDSC3Widget
*
* @class RoboDiffHCDSC3Widget
* @constructor
*/
function RoboDiffHCDSC3Widget (args) {
	
	SampleChangerWidget.call(this,args);
	
	this.name = 'RoboDiffHCDSC3';
	this.label = 'RoboDiffHCDSC3';
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
	this.createPucks("Spinepuck", this.data.cells, -7*Math.PI/8, this.data.radius/2, 0.5, {dAlpha : Math.PI/16, dist : 3*this.data.radius/4});
};

RoboDiffHCDSC3Widget.prototype.blink = SampleChangerWidget.prototype.blink;
RoboDiffHCDSC3Widget.prototype.getPuckIndexFromAngle = SampleChangerWidget.prototype.getPuckIndexFromAngle;
RoboDiffHCDSC3Widget.prototype.createPucks = SampleChangerWidget.prototype.createPucks;
RoboDiffHCDSC3Widget.prototype.getPanel = SampleChangerWidget.prototype.getPanel;
RoboDiffHCDSC3Widget.prototype.load = SampleChangerWidget.prototype.load;
RoboDiffHCDSC3Widget.prototype.getStructure = SampleChangerWidget.prototype.getStructure;
RoboDiffHCDSC3Widget.prototype.findPuckById = SampleChangerWidget.prototype.findPuckById;
RoboDiffHCDSC3Widget.prototype.getAllPucks = SampleChangerWidget.prototype.getAllPucks;
RoboDiffHCDSC3Widget.prototype.render = SampleChangerWidget.prototype.render;
RoboDiffHCDSC3Widget.prototype.setClickListeners = SampleChangerWidget.prototype.setClickListeners;
RoboDiffHCDSC3Widget.prototype.disablePucksOfDifferentCapacity = SampleChangerWidget.prototype.disablePucksOfDifferentCapacity;
RoboDiffHCDSC3Widget.prototype.allowAllPucks = SampleChangerWidget.prototype.allowAllPucks;
RoboDiffHCDSC3Widget.prototype.getPuckData = SampleChangerWidget.prototype.getPuckData;
RoboDiffHCDSC3Widget.prototype.getAllFilledPucks = SampleChangerWidget.prototype.getAllFilledPucks;
RoboDiffHCDSC3Widget.prototype.loadSamples = SampleChangerWidget.prototype.loadSamples;
RoboDiffHCDSC3Widget.prototype.emptyAllPucks = SampleChangerWidget.prototype.emptyAllPucks;
RoboDiffHCDSC3Widget.prototype.enableAllPucks = SampleChangerWidget.prototype.enableAllPucks;
RoboDiffHCDSC3Widget.prototype.disablePuck = SampleChangerWidget.prototype.disablePuck;
RoboDiffHCDSC3Widget.prototype.enablePuck = SampleChangerWidget.prototype.enablePuck;
RoboDiffHCDSC3Widget.prototype.removeClassToAllPucks = SampleChangerWidget.prototype.removeClassToAllPucks;
RoboDiffHCDSC3Widget.prototype.addClassToPuck = SampleChangerWidget.prototype.addClassToPuck;
RoboDiffHCDSC3Widget.prototype.createHCDStructure = SampleChangerWidget.prototype.createHCDStructure;
/**
* Creates the particular structure of the FlexHCD
*
* @method createStructure
*/
RoboDiffHCDSC3Widget.prototype.createStructure = function () {
	this.createHCDStructure();
};

/**
* Converts the idLocation to the corresponding location in the FlexHCD by convention
*
* @method convertIdToSampleChangerLocation
* @return The corresponding location in the FlexHCD by convention
*/
RoboDiffHCDSC3Widget.prototype.convertIdToSampleChangerLocation = function (idLocation) {
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
RoboDiffHCDSC3Widget.prototype.convertSampleChangerLocationToId = function (sampleChangerLocation) {
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