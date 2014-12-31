express-markdown-router
====

Express middleware for generating pages dynamically using markdown files.  Say goodbye to explicitly bootstrapping routes in your Express app!


Installation
----

`npm install express-markdown-router`


Quick Start
---

*You must be using an Express template engine to use this middleware*

    var express = require('express');
    var markdownRouter = require('expres-markdown-router');

    var app = express();

    app.set('port', process.env.PORT || 3000);

    // Using the jade template engine
    app.set('view engine', 'jade');

    // Use the markdownRouter middleware and pass the directory of your .md files
    app.use(markdownRouter(__dirname + '/pages'));

    app.listen(app.get('port'), function() {
        console.log('Server started on port %d', app.get('port'));
    });

This will start a server and build an index of routes based on the .md files found in the `./pages` dir

It will then send the local var `markdown` from the parsed markdown file inside the `index[.ext]` view.


Routing
-----

Currently there is one special route: `index.md` will map to the root path `'/'`

All other routes will map `page.md` to `/page` and `page.subpage.md` to `/page/subpage` and so on...


Additional Params
-------

The view used to render the markdown files within will default to `index[.ext]`.  You can change this by passing a second param to the middleware:

    // Uses a view called 'markdown'
    app.use(markdownRouter(__dirname + '/pages', 'markdown'));

Caching
-----

All routes are cached on server start, but in development, the contents of the .md files will not be so you can freely update your pages on the fly before deploying them.
