function PhasingGridMainView (args) {
    MainView.call(this);

    this.phasingGridView = new PhasingGridView({hasScroll : false});
}

PhasingGridMainView.prototype.getPanel = MainView.prototype.getPanel;

// PhasingGridMainView.prototype.getContainer = function() {

//     this.container = Ext.create('Ext.tab.Panel', {   
//     minHeight : 900,    
//     padding : "5 40 0 5",
//     items: [ {
//                     title: 'Data Collections',
//                     cls : 'border-grid',                      
//                     items:[
//                                 {
//                                     html : '',
//                                     id : this.id
//                                 }
//                     ]
//             }
//             ]
//     });
//     return this.container;
// };

PhasingGridMainView.prototype.getContainer = function() {
    var html = "";
    dust.render("phasing.grid.main.view.template",{id : this.id}, function (err,out) {
        html = out;
    });

    this.container = Ext.create('Ext.panel.Panel', {
        minHeight : 900,    
        padding : "5 40 0 5",
        items : [
                    {
                        html : html,
                        autoScroll : true,
                    }
        ]
    });
    return this.container;
}

PhasingGridMainView.prototype.load = function (dataCollectionGroupId, PhasingStep_method) {
    this.panel.setTitle(PhasingStep_method + " Results");
    this.phasingGridView.load(dataCollectionGroupId, PhasingStep_method);
    this.phasingGridView.printHTML("#" + this.id);
}