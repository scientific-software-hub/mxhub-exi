function ExiDataAdapterGroup(args){
	this.offline = new ExiDataAdapter(args);
}



// -- ESM interop (Grunt -> Vite migration): re-expose module-scope
// declarations as globals, matching the semantics classic <script> tags
// provided (other files still reference these as bare identifiers). --
window.ExiDataAdapterGroup = ExiDataAdapterGroup;
