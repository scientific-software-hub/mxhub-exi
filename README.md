# 
# EXI

EXI is just another user interface for ISPyB and supports: MX, BioSAXS and EM. It connects to ISPyB via RESTful webservices.



## Overview
1. [Install EXI](#install-exi)
    * [Requirements](#requirements)
    * [Build](#build)
    * [Configure](#configure)
    
2. [Development](#development)  
    * [Run](#run)
    * [Update a JS dependency](#update-a-js-dependency)
    * [DUST](#dust)
    * [Demo Application](#demo-application)
         * [Controller](#controller)


## Install EXI
### Requirements

In order to build EXI, you need to have:
- The latest npm and git 1.7 or later. Earlier versions might work, but are not supported. 
- Bower (installable from npm)
- Grunt version v0.4.5 or later (http://gruntjs.com/)
- npm


### Build

Clone a copy of the main EXI git repo by running:

```bash
git clone git://github.com/ispyb/EXI.git
```

Enter into the installation directory and run the build script:

```bash
npm install
```

Download dependencies by running:

```bash
bower install
```

If you want to see which dependencies EXI needs run:
```bash
bower list
```

Build EXI by running Grunt, the javascript task runner

```bash
grunt
```


## Configure

In order to configure EXI some modifications should be done on config.js that it may be found on:
* /saxs/config.js 
* /mx/config.js
* /test/config.js
* /tracking/config.js

It allows to use different configuration for different techniques/beamlines.

The format of the file is JSON and it looks like this

```json
{
   "sites":[
      {
         "name":"ESRF",
         "url":"https://wwws.esrf.fr/ispyb/ispyb-ws/rest",
         "beamlines":{
            "SAXS":[
                { 
                   "name" : "BM29"                   
               }
            ],
            "EM" :[
                   { 
                      "name" : "CM01"
                   }
            ],
            "MX":[
              { 
                   "name" : "ID23-1",
                   "sampleChangerType" : 'FlexHCDDual'
               },
               { 
                   "name" : "ID23-2",
                   "sampleChangerType" : 'FlexHCDUnipuckPlate'
               },
               { 
                   "name" : "ID29",
                   "sampleChangerType" : 'FlexHCDDual'
               },
               { 
                   "name" : "ID30A-1",
                   "sampleChangerType" : 'RoboDiffHCDSC3'
               },
            ]
         }
      }
]
}
```

Detectors node defines the detectors used as a hash map "name of detector" : <Properties>

Sites node define to which sources EXI will be able to connect. These are the main parameters to be defined:
* name: this name is an ID for the site and will appear when you sign in
* url : a valid url pointing to the rest webservices from a ISPyB active instance
* exiurl : !ONTEST this is pointing to the offline data analysis server set of webservices
* Beamlines
* 

## Development
### Run
If you want to build a version where the javascript will be not minified for developing then use the profile dev

```bash
grunt dev
```
Globally install http-server in case you haven't done this before
```bash
npm i -g http-server
```

Start the http-server.  Http-server will display the URL to open EXI in your favourite browser.
```bash
http-server
```

See [http-server on Github](https://github.com/indexzero/http-server) for configuration options.

### Update a JS dependency


Using bower one can update a package by typing:
```
bower update ispyb-js-api
```


### DUST

EXI makes an intensive use of HTML templates. Dustjs has been chosen as engine because:
1. High integration with Grunt
2. Easy to use
3. Maintened by linkedin
4. Possibility to precompile the template in order to execute them faster


Use case:
- Template can be uses when we want to render HTML within a Ext component. For instance a column on a Ext.grid.Panel object

#### How to use dust on EXI?
1. Create a javascript file on  /templates
2. The name of the file will correspond with the name of the template that dust will give to the precompiled function
Example: templates/test.js
```
<table>
{#.}
<tr>
<td>
{.count}
</td>
<td>
{.step}
</td>
</tr>
{/.}
</table>
```

3. Run Grunt or Grunt dev. Because we need to precompile the templates we need to build the application before hand
4. Use the template
```javascript
dust.render("workflowstepsection_workflowstep", [{step:'test1', count:5},{step:'test2', count:4},], function(err, out){
		console.log(out);
     });

```

The expected output is:
```
<table><tr><td>5</td><td>test1</td></tr><tr><td>4</td><td>test2</td></tr></table>
```

#### Grunt and dustjs

There is a new task on Grunt. It takes all the javascript files on templates folder and it precompiles on the min folder
```
dustjs: {
	    compile: {
	      files: {
	        'min/precompiled.templates.min.js': ['templates/*js']
	      }
	    }
	  }
```

### Demo Application

EXI contains a demo application called test in order to understand how EXI is done. You can access by typing:
```
http://myserver:8082/EXI/test/dev.html#
```
This will open a website with a menu bar similar to:
![alt text](https://raw.githubusercontent.com/antolinos/EXI/issue_347/readme/example-menu.png "Test App")

Demo app is composed basically by few files under js/test folder:
- testcontroller.js
- exitest.js
- testmainview.js
- testlistview.js
- testlistview.template.js
- testmainmenu

#### Controller
 
EXI controllers uses PATHJS to make an action based on the url. Demo application user TestController class that is written in  [testcontroller.js](https://github.com/antolinos/EXI/blob/issue_347/js/test/controller/testcontroller.js).
This is an example how an action is defined:
```javascript
Path.map("#/:name/main").to(function() {
		var name = this.params['name'];
		var mainView = new TestMainView();
		EXI.addMainPanel(mainView);	
		mainView.load( name);
	}).enter(this.setPageBackground);
```



