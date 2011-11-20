Modernizr.load([
    {
        load: "http://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js",
        complete: function () {
            if ( !window.jQuery ) {
                Modernizr.load("asset/sjs/jquery-1.6.4.min.js");
            }
        }
    },
    "assets/js/init.js"
]);