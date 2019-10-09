const http = require('http');
    url = require('url'),
    fs = require('fs'),
    jquery = require('jquery'),
    jsdom = require('jsdom'),
    jCanvas = require('jcanvas'),
    unique_ogp = require('./unique_ogp.js');

const { JSDOM } = jsdom;
const port = process.env.PORT || 8088;


const getArticon = function(title, brand) {
    const { window } = new JSDOM(`<!DOCTYPE html><canvas id="canvas" width="1200" height="630"></canvas>`, {runScripts: "outside-only"});
    const $ = jquery(window);
    jCanvas($, window);
    const canvas = $("#canvas");
    canvas = unique_ogp.draw(canvas, title, brand);
    return canvas[0];
};


function atob(a) {
    return Buffer.from(a, 'base64')
}

// create server
http.createServer(function(request, response) {
    let query = url.parse(request.url, true).query;
    let title = query["title"];
    let brand = query["brand"];
    if (!title) {
        response.write("Add Query to this page. '?title=$TITLE&brand=$BRAND'");
        return response.end();
    }
    let canvas = getArticon(title, brand);
    const image = atob(canvas.toDataURL('image/png').split(',')[1]);
    response.writeHead(200, {"Content-Type": "image/png"});
    response.write(image);
    response.end();

}).listen(port, '0.0.0.0');
