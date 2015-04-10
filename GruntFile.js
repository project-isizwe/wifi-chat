module.exports = function(grunt) {
  
    var version = require('./package.json').version
    var environment = process.env.NODE_ENV || 'production'
    
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
                    baseUrl: './public/scripts',
                    mainConfigFile: './public/scripts/app.js',
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
                    out: './public/css/app.min.css',
                    optimizeCss: 'standard'
                }
            }
        },
        svg_sprite: {
          options: {
            src: [ 'images/icons/**/*.svg' ],
            cwd: 'public'
          },
          spriteit: {
            src: [ 'images/icons/**/*.svg' ],
            dest: 'sprites',
            cwd: 'public',
            options: {}
          }
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
        },
        autoprefixer: {
          prefixit: {
            src: 'public/css/app.min.css',
            browsers: ['> 50%']
          }
        },
      watch: {
        scripts: {
          files: ['public/scripts/**/*.js', 'public/css/**/*.css', 'public/images/**/*' ],
          tasks: ['build-dev'],
          options: {
            spawn: false,
          },
        },
      }
    }

    if (process.env.GREP) {
        configuration.mochacli.options.grep = process.env.GREP
    }
    if ('development' === environment) {
      configuration.requirejs.css.options.optimizeCss = 'none'
    }

    grunt.initConfig(configuration)

    // Load the plugins
    grunt.loadNpmTasks('grunt-contrib-jshint')
    grunt.loadNpmTasks('grunt-mocha-cli')
    grunt.loadNpmTasks('grunt-contrib-requirejs')
    grunt.loadNpmTasks('grunt-contrib-clean')
    grunt.loadNpmTasks('grunt-nsp-package')
    // grunt.loadNpmTasks('grunt-svg-sprite')
    grunt.loadNpmTasks('grunt-autoprefixer')
    grunt.loadNpmTasks('grunt-contrib-watch')

    // Configure tasks
    grunt.registerTask('default', ['test'])
    grunt.registerTask('checkstyle', [ 'jshint' ])
    grunt.registerTask('test:development', ['mochacli'])
    grunt.registerTask('test:testing', ['test'])
    grunt.registerTask('test', ['clean', 'build', 'mochacli'/*, 'jshint'*/, 'validate-package'])
    grunt.registerTask('mocha', ['mochacli'])
    grunt.registerTask('dev-throttle', ['concurrent:devThrottle'])
    grunt.registerTask('build-dev', [ 'requirejs:css', 'autoprefixer:prefixit' /*, 'svg_sprite:spriteit' */ ])
    grunt.registerTask('build', ['build-dev', 'requirejs:javascript' ])
    grunt.registerTask('release', [ 'clean', 'build', 'compress', 'copy', 'clean:post-release' ])
}
