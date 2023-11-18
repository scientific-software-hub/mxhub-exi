
/**
* This main class deals with the creation and edition of shipments
*
* @class ShippingMainViewTest
* @constructor
*/
function ShippingMainView() {
	MainView.call(this);
	var _this = this;

    /**
	* 
	* @property shipmentForm
	*/
    this.shipmentForm = new ShipmentForm({width : Ext.getBody().getWidth() - 200});
	this.shipmentForm.onSaved.attach(function(sender, shipment){		
		location.hash = "#/shipping/" + shipment.shippingId + "/main";
	});

	
	this.shipmentForm.refresh.attach(function(sender, shipmentId){		
		_this.load(shipmentId);
	});


    /**
	* 
	* @property parcelGrid
	*/
	this.parcelGrid = new ParcelGrid({height : 580, width : Ext.getBody().getWidth() - 200});
	
}

ShippingMainView.prototype.getPanel = MainView.prototype.getPanel;

ShippingMainView.prototype.getContainer = function() {
	return Ext.create('Ext.container.Container', {
	    layout: {
	        type: 'fit'
	    },
	    margin : 15,
	    border: 1,
	    defaults: {
	        labelWidth: 80,
	        flex: 1,
	    },
	    items : [
                    this.getShipmentPanel()
        ]
	});
};

ShippingMainView.prototype.getShipmentPanel = function() {
	var _this = this;

	return Ext.create("Ext.panel.Panel",{	
		items :	[
					this.shipmentForm.getPanel(),
                    this.parcelGrid.getPanel()
			]
	});
};




ShippingMainView.prototype.load = function(shippingId) {
	var _this = this;
	this.shippingId = shippingId;
	this.panel.setTitle("Shipment");
	if (shippingId != null){
		this.panel.setLoading();
		var onSuccess = function(sender, shipment){
			//Check if samples have exported data in order to know if the remove button should be enabled

			var containerIds = _.map(_.union(_.flatten(_.map(shipment.dewarVOs,"containerVOs"))),"containerId");
			if (containerIds.length > 0) {
				var onSuccessSamples = function(sender,samples) {
					var hasExportedData = false;
					if (samples) {
						var withoutCollection = _.filter(samples,{DataCollectionGroup_dataCollectionGroupId : null});
						hasExportedData = !(withoutCollection.length == samples.length);
					}

					_this.shipmentForm.load(shipment,hasExportedData);
					_this.parcelGrid.load(shipment,hasExportedData,samples,withoutCollection);
					_this.panel.setLoading(false);

				}
				EXI.getDataAdapter({onSuccess : onSuccessSamples}).mx.sample.getSamplesByContainerId(containerIds);
			} else {
				_this.shipmentForm.load(shipment,false);
				_this.parcelGrid.load(shipment,false);
				_this.panel.setLoading(false);
			}

		};
		EXI.getDataAdapter({onSuccess : onSuccess}).proposal.shipping.getShipment(shippingId);
    }	
    else{
        _this.shipmentForm.load();	
		_this.panel.setLoading(false);
    }
};