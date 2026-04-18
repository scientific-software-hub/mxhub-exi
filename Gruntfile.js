/*jshint strict:false */
"use strict";

module.exports = function(grunt) {
    var config = {
        dustjs : {},
    };
    grunt
            .initConfig({
                pkg : grunt.file.readJSON('package.json'),
                yuidoc : {
                    compile : {
                        name : '<%= pkg.name %>',
                        description : '<%= pkg.description %>',
                        version : '<%= pkg.version %>',
                        url : '<%= pkg.homepage %>',
                        options : {
                            paths : 'js/',
                            outdir : 'docs'
                        }
                    }
                },

                concat : {
                    options:{
                        sourceMap: true,
                        sourceMapIncludeSources: true,
                    },
                    prod : {
                        files : {
                            'min/ispyb-client.js' : [ "js/ispyb-client/**/*js" ],
                            'min/exi.js' : [ "js/dust/**/*js", "js/core/**/*js" ],
                            'min/exi.mx.js' : [ "js/mx/**/*js" ],
                            'min/exi.saxs.js' : [ "js/saxs/**/*js" ],
                            'min/exi.em.js' : [ "js/em/**/*js" ],
                            'min/exi.test.js' : [ "js/test/**/*js" ],
                            'min/exi.tracking.js' : [ "js/tracking/**/*js" ],
                            'min/exi.tools.js' : [ "js/tools/**/*js" ],
                            'min/vendor.min.js' : [
                                    "node_modules/jquery/dist/jquery.min.js",
                                    "node_modules/lightbox2/dist/js/lightbox.min.js",
                                    "node_modules/jquery-lazy/jquery.lazy.min.js",
                                    "node_modules/dustjs-linkedin/dist/dust-full.min.js",
                                    "node_modules/dustjs-helpers/dist/dust-helpers.min.js",
                                    "node_modules/lodash/lodash.js",
                                    "node_modules/snapsvg/dist/snap.svg-min.js",
                                    "node_modules/vis/dist/vis.min.js",
                                    "node_modules/dygraphs/dygraph-combined.js",
                                    "node_modules/handsontable/dist/handsontable.full.min.js",
                                    "node_modules/bootstrap/dist/js/bootstrap.js",
                                    "node_modules/bootstrap-year-calendar/js/bootstrap-year-calendar.min.js",
                                    "node_modules/moment/min/moment.min.js",
                                    "node_modules/pathjs-amd/dist/path.min.js",
                                    "node_modules/notifyjs-browser/dist/notify.js",
                                    "node_modules/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js",
                                    "node_modules/bootstrap-multiselect/dist/js/bootstrap-multiselect.js",
                                    "node_modules/file-saver/FileSaver.min.js",
                                    "node_modules/linkifyjs/dist/linkify.min.js",
                                    "node_modules/linkifyjs/dist/linkify-jquery.min.js"
                                    ]
                        }
                    }
                },
                terser: {
                    prod: {
                        options: {
                            sourceMap: {
                                // Enable source maps and include the sources automatically
                                includeSources: true
                            },
                            ecma: 2020, // supports ?. and ??
                            compress: true,
                            mangle: true,
                            format: {
                                beautify: true
                            }
                        },
                        files: {
                            'min/exi.min.js': [
                                'min/exi.tools.js',
                                'min/ispyb-client.js',
                                'min/exi.js',
                                'min/exi.mx.js',
                                'min/exi.saxs.js',
                                'min/exi.em.js',
                                'min/exi.test.js',
                                'min/precompiled.templates.min.js'
                            ],
                            'min/exi.saxs.min.js' : ['min/ispyb-client.js', 'min/exi.tools.js', 'min/exi.js',
                                'min/exi.saxs.js', 'min/exi.test.js',
                                'min/precompiled.templates.min.js' ],
                            'min/exi.tracking.min.js' : [ 'min/exi.js',
                                'min/exi.tracking.js', 'min/exi.test.js',
                                'min/precompiled.templates.min.js' ],
                            'min/lightbox.js' : [ 'node_modules/lightbox2/dist/js/lightbox.js']
                        }
                    }
                },
                cssmin : {
                    prod : {
                        options : {
                            shorthandCompacting : true,
                            roundingPrecision : -1,
                            sourceMap: true
                        },
                        files : {
                            'min/exi.min.css' : [
                                    'node_modules/bootstrap/dist/css/bootstrap.min.css',
                                    'css/templatelist.css',
                                    'css/beamlinesessionbox.css',
                                    'node_modules/vis/dist/vis.css',
                                    'node_modules/handsontable/dist/handsontable.full.css',
                                    'css/dygraph-custom.css',
                                    'css/exi.css',
                                    'css/calendar.css',
                                    'css/menu/mainmenu.css',
                                    'css/override.css',
                                    'css/grid.css',
                                    'node_modules/lightbox2/dist/css/lightbox.css',
                                    'node_modules/bootstrap-year-calendar/css/bootstrap-year-calendar.min.css',
                                    'node_modules/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css',
                                    'node_modules/bootstrap-multiselect/dist/css/bootstrap-multiselect.css',
                                    'node_modules/handsontable/dist/handsontable.css']
                        }
                    }
                },
                // jshint : {
                //     options : {
                //         reporter : require('jshint-stylish'),
                //         jshintrc : '.jshintrc'
                //     },
                //     prod : [ 'js/core/**/*.js', 'js/mx/**/*.js',
                //             'js/saxs/**/*.js', 'js/tracking/**/*.js',
                //             'js/viewer/**/*.js' ]
                // },
                plato : {
                    all : {
                        options : {
                            complexity : {
                                logicalor : true,
                                switchcase : true,
                                forin : true,
                                trycatch : true
                            }
                        },
                        files : {
                            'reports/all' : [ 'js/**/*.js' ],
                        }
                    },
                    mx : {
                        options : {
                            complexity : {
                                logicalor : true,
                                switchcase : true,
                                forin : true,
                                trycatch : true
                            }
                        },
                        files : {
                            'reports/mx' : [ 'js/mx/**/*.js' ],
                        }
                    },
                    tracking : {
                        options : {
                            complexity : {
                                logicalor : true,
                                switchcase : true,
                                forin : true,
                                trycatch : true
                            }
                        },
                        files : {
                            'reports/tracking' : [ 'js/tracking/**/*.js' ],
                        }
                    },
                    saxs : {
                        options : {
                            complexity : {
                                logicalor : true,
                                switchcase : true,
                                forin : true,
                                trycatch : true
                            }
                        },
                        files : {
                            'reports/saxs' : [ 'js/saxs/**/*.js' ],
                        }
                    },
                    files : {
                        'reports/viewer' : [ 'js/viewer/**/*.js' ],
                    }
                },
                core : {
                    options : {
                        complexity : {
                            logicalor : true,
                            switchcase : true,
                            forin : true,
                            trycatch : true
                        }
                    },
                    files : {
                        'reports/core' : [ 'js/core/**/*.js' ],
                    }
                },
                includeSource : {
                    options : {
                        basePath : '',
                        baseUrl : '../'
                    },
                    dev : {
                        files : [ {
                            'saxs/dev.html' : 'saxs/index.tpl.html'
                        }, {
                            'mx/dev.html' : 'mx/index.tpl.html'
                        }, {
                            'tracking/dev.html' : 'tracking/index.tpl.html'
                        },
                        {
                            'test/dev.html' : 'test/index.tpl.html'
                        } ]
                    }
                },
                watch : {
                    scripts : {
                        files : [ 'css/**/*css', 'templates/**/*js' ],
                        tasks : [ 'dev' ],
                        options : {
                            interrupt : true,
                        },
                    },
                },
                dustjs : {
                    compile : {
                        files : {
                            'min/precompiled.templates.min.js' : [ 'templates/**/*js' ]
                        }
                    }
                },
                asset_cachebuster: {
                    options: {
                      buster: Date.now(),
                      ignore: [
                          '../dependency/ext/build/bootstrap.js',
                          '../dependency/ext/build',
                          '../node_modules',
                          '../js/dust/helpers.js'
                      ],
                      htmlExtension: 'html'
                    },
                    build: {
                      files: {
                        'mx/index.html': ['mx/index.html'],
                        'mx/dev.html': ['mx/dev.html'],
                        'saxs/index.html': ['saxs/index.html'],
                        'saxs/dev.html': ['saxs/dev.html'],
                        'test/index.html': ['test/index.html'],
                        'test/dev.html': ['test/dev.html'],
                        'tracking/index.html': ['tracking/index.html'],
                        'tracking/dev.html': ['tracking/dev.html']
                      }
                    }
                }
            });

    grunt.loadNpmTasks('grunt-include-source');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    // grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-plato');
    grunt.loadNpmTasks('grunt-terser');
    grunt.loadNpmTasks('grunt-dustjs');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-asset-cachebuster');

    /** TASKS */
    grunt.task.registerTask('doc', [ 'yuidoc:compile' ]);
    grunt.task
            .registerTask('report', [ 'plato:all', 'plato:saxs', 'plato:mx' ]);
    grunt.task.registerTask('default', [ 'dustjs', // 'jshint:prod',
            'concat:prod', 'terser:prod', 'cssmin:prod', 'yuidoc:compile', 'asset_cachebuster' ]);
    grunt.task.registerTask('dev', [ 'dustjs', 'includeSource:dev',
            'cssmin:prod', 'asset_cachebuster' ]);

};
