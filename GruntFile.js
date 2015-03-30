module.exports = function(grunt) {
  
    var version = require('./package.json').version
    
    var configuration = {
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            allFiles: [
                'Gruntfile.js',
                'src/**/*.js',
                'public/**/*.js',
                'tests/**/*.js',
                'index.js'
            ],
            options: {
                jshintrc: '.jshintrc',
            }
        },
        mochacli: {
            all: ['test/test.js'],
            options: {
                reporter: 'spec',
                ui: 'tdd',
                timeout: 60000,
                bail: false
            }
        },
        requirejs: {
            javascript: {
                options: {
                    baseUrl: './public/js',
                    mainConfigFile: './public/js/main.js',
                    name: 'main',
                    out: './public/app.min.js',
                    generateSourceMaps: true,
                    preserveLicenseComments: false,
                    paths: {
                        'primus': 'empty:',
                        'requireLib': 'require'
                    },
                    include: [
                        'requireLib'
                    ],
                    optimize: 'uglify2',
                    removeCombined: true,
                    findNestedDependencies: true
                }
            },
            css: {
                options: {
                    cssIn: './public/css/style.css',
                    out: './public/app.min.css',
                    optimizeCss: 'standard'
                }
            }
        },
        svg_sprite: {
          src: [ 'images/icons/*.svg' ],
          cwd: 'public',
          dest: 'sprites',
          options : {},
        },
        clean: {
            'post-release': [
                'npm-shrinkwrap.json'
            ],
            default: [
                './public/app.min.*',
                '!public/avatar/.gitkeep',
                'public/avatar/*',
                '!test/screenshots/.gitkeep',
                'test/screenshots/*'
            ]
        }
    }

    if (process.env.GREP)
        configuration.mochacli.options.grep = process.env.GREP

    grunt.initConfig(configuration)

    // Load the plugins
    grunt.loadNpmTasks('grunt-contrib-jshint')
    grunt.loadNpmTasks('grunt-mocha-cli')
    grunt.loadNpmTasks('grunt-contrib-requirejs')
    grunt.loadNpmTasks('grunt-contrib-clean')
    grunt.loadNpmTasks('grunt-nsp-package')
    grunt.loadNpmTasks('grunt-svg-sprite')

    // Configure tasks
    grunt.registerTask('default', ['test'])
    grunt.registerTask('checkstyle', [ 'jshint' ])
    grunt.registerTask('test:development', ['mochacli'])
    grunt.registerTask('test:testing', ['test'])
    grunt.registerTask('test', ['clean', 'build', 'mochacli'/*, 'jshint'*/, 'validate-package'])
    grunt.registerTask('mocha', ['mochacli'])
    grunt.registerTask('dev-throttle', ['concurrent:devThrottle'])
    grunt.registerTask('build', [ 'requirejs:javascript', 'requirejs:css' ])
    grunt.registerTask('release', [ 'clean', /*'shrinkwrap',*/ 'build', 'compress', 'copy', 'clean:post-release' ])
}
