var fs = require('fs');
var md = require('node-markdown').Markdown;

/**
 * Middleware for creating dynamic routes by reading a directory of md files
 *
 * @param filePath eg: __dirname for current directory
 *
 * @param template The template to render the markdown page within
 * @return Function
 */
var markdownRouter = function(filePath, template) {
    template = template || 'index';

    var extension = '.md',
        pages,
        pageRoutes = {},
        cache = {},
        configPrefix = '@',
        configRegex = new RegExp(configPrefix + '{(.*?)}');

    /**
     * Returns true if not a production NODE_ENV
     * @return Boolean
     */
    function isDev() {
        return process.env.NODE_ENV != 'production';
    }

    /**
     * Converts a filename to a route
     * @param  String filename
     * @return String
     */
    function filenameToRoute(filename) {
        filename = removeExtension(filename);

        var specialRoutes = {
            index: '/'
        };

        if (specialRoutes[filename]) {
            return specialRoutes[filename];
        }

        return '/' + filename.replace('.', '/');
    }

    /**
     * Removes file extentsion from a string
     * @param  String filename
     * @return String
     */
    function removeExtension(filename) {
        return filename.replace(extension, '');
    }

    /**
     * Checks that a file is a .md file
     * @param  String filename
     * @return Boolean
     */
    function isMarkdownFile(filename) {
        return filename !== removeExtension(filename);
    }

    /**
     * Gets the contents of a .md file
     * @param  String   filename
     * @param  Function callback
     */
    function getPage(filename, callback) {
        var file = filePath + '/' + filename,
            path = filenameToRoute(filename);

        if (cache[path] && ! isDev()) {
            callback(null, cache[path]);

            return;
        }

        fs.readFile(
            file,
            {encoding: 'utf8'},
            function(err, data) {
                cache[path] = data;
                callback(err, data);
            }
        );
    }

    /**
     * Separates config vars held in JSON object in .md file
     * @param  String content
     * @return Object
     */
    function getConfigVars(content) {
        var matches = content.match(configRegex);

        if (matches) {
            return JSON.parse(
                matches[0].replace(configPrefix, '')
            );
        }

        return {};
    }

    /**
     * Builds an array of routes and corresponding .md files
     */
    function buildPageIndex() {
        if (pages && ! isDev()) {
            return;
        }

        pages = fs.readdirSync(filePath);

        pages.forEach(function(filename) {
            if (isMarkdownFile(filename)) {
                pageRoutes[filenameToRoute(filename)] = filename;
            }
        });
    }

    buildPageIndex();

    /**
     * Returns a calback function for express to use
     * and applies route on request
     */
    return function(req, res, next) {
        var path = req.path,
            page;

        // Remove trailing slash from requested path
        if (path !== '/') {
            path = req.path.replace(/\/$/, '');
        }

        // Get page from indexed routes
        page = pageRoutes[path];

        // Continue if no matching route found
        if (! page) {
            return next();
        }

        // Pull out config vars and apply to res.locals
        getPage(page, function(err, markdown) {
            var pageVars = getConfigVars(markdown);
            for (var configVar in pageVars) {
                res.locals[configVar] = pageVars[configVar];
            }

            // Render defined output remplate with parsed markdown
            res.render(template, {
                markdown: md(markdown.replace(configRegex, ''))
            });
        });
    }
}

module.exports = markdownRouter;
