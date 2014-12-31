var express = require('express');
var markdownRouter = require('../index');

var app = express();

module.exports = function(callback) {
    callback(app);

    // Set port, default to 3000 if not pre-set
    app.set('port', process.env.PORT || 3000);

    // Custom markdown file based routing
    app.use(markdownRouter(__dirname + '/pages'));

    app.listen(app.get('port'), function() {
        console.log('Server started on port %d', app.get('port'));
    });
}


