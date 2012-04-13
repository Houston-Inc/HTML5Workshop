$(document).ready(function onDocumentReady() {
    var elementsToColor = ['ul', 'nav', 'article', 'header', 'footer', 'aside', '.row-fluid', '#main'],
        getRandomColor = function() {
            var colors = [];
            for(var a = 0; a < 3; a++) { colors.push(parseInt(Math.random()*155, 10)); }
            return "rgba(" + colors.join(",") + ", 0.1)";
        };

    for(var a = 0, element; element = elementsToColor[a]; a++) {
        $(element).css('background-color', getRandomColor());
    }
});