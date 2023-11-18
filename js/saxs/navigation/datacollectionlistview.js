function DataCollectionListView(){
	ListView.call(this);
}

DataCollectionListView.prototype.getPanel = ListView.prototype.getPanel;
DataCollectionListView.prototype.load = ListView.prototype.load;

DataCollectionListView.prototype.getRow = function(record){
	var html = "<table class='listView'>";
	html = html + "<tr><td>Macromolecule:</td><td >" + record.data.macromoleculeAcronym+ "</td></tr>";
		html = html + "<tr><td>Buffer:</td><td style='color:#207a7a;font-weight:bold;'>" + record.data.bufferAcronym+ "</td></tr>";
		html = html + "<tr><td>Count:</td><td>" + record.data.dataCollections+ "</td></tr>";
	return html + "</table>";
};

DataCollectionListView.prototype.getFilter = function(value){
	return [{property : "bufferAcronym", value : value, anyMacth : true}];
};

DataCollectionListView.prototype.getColumns = function(){
	var _this = this;
	return  [
		        { text: 'Data Collections',  flex: 1, dataIndex: 'bufferAcronym', 
		        	renderer : function(list, token, record){
		        		return _this.getRow(record);
		        } }
		    ];
};

DataCollectionListView.prototype.getFields = function(){
	return  ['macromoleculeAcronym', 'bufferAcronym', 'macromoleculeId', 'dataCollections'];
};

//DataCollectionListView.prototype.groupBy = function(array , f ){
//  var groups = {};
//  array.forEach( function( o )
//  {
//    var group = JSON.stringify( f(o) );
//    groups[group] = groups[group] || [];
//    groups[group].push( o );  
//  });
//  return Object.keys(groups).map( function( group ){
//	  return groups[group]; 
//  });
//};


/** This groups all the data by bufferId **/
DataCollectionListView.prototype.formatData = function(data){
	data =  BUI.groupBy(data, function(item){
		  return [item.bufferAcronym];
	});
	/** Data is now an array of arrays **/
	
	var results = [];
	for (var i = 0; i < data.length; i++) {
		var item = data[i];
		results.push({
			macromoleculeAcronym : item[0].macromoleculeAcronym,
			macromoleculeId: item[0].macromoleculeId,
			bufferAcronym : item[0].bufferAcronym,
			dataCollections : item.length
		});
	}
	
	return results;
	
};


