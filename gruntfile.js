module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
            options: {
                globals: {
                    jQuery: true
                }
            }
        },
        /*watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint']
        },*/
        watch: {            
            files: ['**/*.scss'],
            tasks: ['sass']
        },
        concat: {
            options: {
                separator: ';'
            },
            dist: {
            src: ['src/**/*.js'],
            dest: 'dist/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                mangle: false
            },
            dist: {
                files: {
                    '': ['']
                }
            }
        },
        sass: {
            dist: {
                options: {
                    style: 'compressed'
                },
                files: [
                    {
                        expand: true,
                        cwd: 'src/scss',
                        src: ['*.scss'],
                        dest: 'dist/assets/css',
                        ext: '.min.css'
                    }
                ]
            }
        },
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        src: [
                            'node_modules/angular/angular.min.js',
                            'node_modules/angular-route/angular-route.min.js',
                            'node_modules/angular-sanitize/angular-sanitize.min.js',
                            'node_modules/angular-touch/angular-touch.min.js',
                            'node_modules/angular-animate/angular-animate.min.js',
                            'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
                            'node_modules/ng-file-upload/dist/ng-file-upload.min.js',
                            'node_modules/angular-ui-grid/ui-grid.min.js',
                            'node_modules/firebase/firebase.js',
                            'node_modules/angularfire/dist/angularfire.min.js',
                            'src/ui-bootstrap/ui-bootstrap.min.js',
                            'node_modules/angular-scroll/angular-scroll.min.js'
                        ],
                        dest: 'dist/assets/js/',
                        flatten: true
                    },
                    { // Este es el tinymce original
                        expand: true,
                        src: 'node_modules/tinymce/tinymce.min.js',
                        dest: 'dist/assets/js/tinymce/',
                        flatten: true
                    },
                    {
                        expand: true,
                        cwd: 'node_modules/tinymce/skins',
                        src: '**',
                        dest: 'dist/assets/js/tinymce/skins/'
                    },
                    {
                        expand: true,
                        cwd: 'src/tinymce/langs',
                        src: '**',
                        dest: 'dist/assets/js/tinymce/langs/'
                    },
                    {
                        expand: true,
                        cwd: 'node_modules/tinymce/plugins',
                        src: ['code/**','paste/**'],
                        dest: 'dist/assets/js/tinymce/plugins/'
                    },
                    {
                        expand: true,
                        cwd: 'node_modules/tinymce/themes',
                        src: 'modern/**',
                        dest: 'dist/assets/js/tinymce/themes/'
                    },
                    {// Este es el angular-ui-tinymce
                        src: 'node_modules/angular-ui-tinymce/dist/tinymce.min.js',
                        dest: 'dist/assets/js/ui-tinymce.min.js'//,
                    },
                    {
                        expand: true,
                        src: [
                            'node_modules/angular-ui-grid/ui-grid.eot',
                            'node_modules/angular-ui-grid/ui-grid.min.css',
                            'node_modules/angular-ui-grid/ui-grid.svg',
                            'node_modules/angular-ui-grid/ui-grid.ttf',
                            'node_modules/angular-ui-grid/ui-grid.woff'
                        ],
                        dest: 'dist/assets/css/',
                        flatten: true
                    },
                    {
                        expand: true, cwd: 'node_modules/font-awesome/fonts/', src: '**', dest: 'dist/assets/fonts/'
                    },
                ],
            },
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-copy');
    
    grunt.registerTask('default', ['sass', 'copy', 'watch']);
    grunt.registerTask('actualizar', ['sass', 'copy']);
    grunt.registerTask('producir', ['jshint', 'concat', 'uglify', 'sass', 'copy']);
};