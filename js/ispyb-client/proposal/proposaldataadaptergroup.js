function ProposalDataAdapterGroup(args){
	this.authentication = new AuthenticationDataAdapter(args);
	this.dewar = new DewarDataAdapter(args);
	this.proposal = new ProposalDataAdapter(args);
	this.shipping = new ShippingDataAdapter(args);
	this.session = new SessionDataAdapter(args);
	this.labcontacts = new LabcontactDataAdapter(args);
}

// -- ESM interop (Grunt -> Vite migration): re-expose module-scope
// declarations as globals, matching the semantics classic <script> tags
// provided (other files still reference these as bare identifiers). --
window.ProposalDataAdapterGroup = ProposalDataAdapterGroup;
