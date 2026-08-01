
function DataSet(){
	this.json = null;
	
};


DataSet.prototype.loadFromJSON = function(json){
	if(json != null) {
		if(this.validate(json)) {
			this.json = json;
		}
	}
};


DataSet.prototype.toJSON = function(json){
	return this.json;
};


/** Abstract method to be override on childs classes **/
DataSet.prototype.validate = function(json){
	if (true){
		return true;
	}
	/*else{
		throw "Data validation failed";
	}*/
};



// -- ESM interop (Grunt -> Vite migration): re-expose module-scope
// declarations as globals, matching the semantics classic <script> tags
// provided (other files still reference these as bare identifiers). --
window.DataSet = DataSet;
