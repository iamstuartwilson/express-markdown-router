var setupApp = require('./app');
var exphbs = require('express-handlebars');

setupApp(function(app) {
    app.set('view engine', 'jade');

    // Templating with Handlebars
    app.engine('handlebars', exphbs({
        defaultLayout: null
    }));

    app.set('view engine', 'handlebars');
});
