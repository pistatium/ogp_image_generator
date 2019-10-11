const http = require('http');
    url = require('url'),
    fs = require('fs'),
    jquery = require('jquery'),
    jsdom = require('jsdom'),
    jCanvas = require('jcanvas'),
    generator = require('./generator.js');

const { JSDOM } = jsdom;
const PORT = process.env.PORT || 8088;

const CANVAS_WIDTH = 1200
const CANVAS_HEIGHT = 630
const CANVAS = `<!DOCTYPE html><canvas id="canvas" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}"></canvas>`;

const generateImage = (title, description, site_name) => {
    const canvas = generateOgpCanvas(title, description, site_name);
    const image = canvas.toDataURL('image/png').split(',')[1];
    return Buffer.from(image, 'base64')
};

const generateOgpCanvas = (title, description, site_name) => {
    const { window } = new JSDOM(CANVAS, {runScripts: "outside-only", pretendToBeVisual: true});
    const $ = jquery(window);
    jCanvas($, window);

    let canvas = $("#canvas");
    canvas[0].width = CANVAS_WIDTH;
    canvas[0].height = CANVAS_HEIGHT;
    canvas = generator.draw(canvas, title, site_name);
    return canvas[0];
};


// create server
http.createServer(function(request, response) {
    let query = url.parse(request.url, true).query;
    let title = query["title"];
    let brand = query["brand"];
    if (!title) {
        response.write("Add Query to this page. '?title=$TITLE&brand=$BRAND'");
        return response.end();
    }
    let image = generateImage(title, '', brand);
    response.writeHead(200, {"Content-Type": "image/png"});
    response.write(image);
    response.end();

}).listen(PORT, '0.0.0.0');
