const md5 = require("./md5.js"),
    color = require("onecolor");
const { createCanvas, loadImage } = require('canvas')

const hsv2rgb = (h, s, v) => (new color.HSV(h / 255, s / 255, v / 255)).hex();

const getFrontColor = (h, i) => {
    i = i % 10;
    return hsv2rgb(h, 100 - i * 10, 190 + i);
};

const getBackColor = h => hsv2rgb(h, 10, 220);

const getAccentColor = (h, i) => {
    i = i % 5;
    return hsv2rgb(h, (i + 2) * 1, i * 5 + 220);
};

const generateSeeds = str => {
    // String をキーに 0~255のシードを複数生成する
    var hash = md5.md5(str);
    var p1 = str.length % 256;
    var p2 = parseInt(hash.slice(0, 2), 16);
    var p3 = parseInt(hash.slice(2, 4), 16);
    var p4 = parseInt(hash.slice(4, 6), 16);
    var p5 = parseInt(hash.slice(6, 8), 16);
    var p6 = parseInt(hash.slice(8, 10), 16);
    return [p1, p2, p3, p4, p5, p6];
};

const charcount = str => {
    let len = 0;
    str = escape(str);
    for (i = 0; i < str.length; i++, len++) {
        if (str.charAt(i) === "%") {
            if (str.charAt(++i) === "u") {
                i += 3;
                len++;
            }
            i++;
        }
    }
    return len;
};

exports.draw = (canvas, title, brand) => {
    title = title || "";
    brand = brand || "";
    const [p1, p2, p3, p4, p5, p6] = generateSeeds(title);
    const base_hue = p1;
    const context = createCanvas(200, 200).getContext('2d')
    context.font = "100px 'Noto Sans CJK JP Black', 'Noto Sans Japanese'"

    console.log(p1,p2, p3, p4, p5, p6);

    // 光沢
    const bright_layer = canvas.createGradient({
        x1: 0, y1: 0,
        x2: 1200 / 2, y2: 630 / 3 * 2,
        c1: "rgba(255, 255, 255, 0.1)", s1: 0.43,
        c2: "rgba(255, 255, 255, 0.2)", s2: 0.97
    });

    canvas.clearCanvas();

    var h = (p3 + (p1 + p2) * 7) % 256;

    // Background
    canvas.drawRect({
        fillStyle: getBackColor(h),
        x: 1200 / 2, y: 630 / 2,
        width: 1200,
        height: 630,
        cornerRadius: 5,
        mask: true,
    });

    // // Small Bubbles
    // var bubble_count = (p1 + p2 + p3) % 50 + 80;
    // for (var i = 1; i < bubble_count; i++) {
    //     var x = ((i + p1) * (i + p4)) % 1200;
    //     var y = ((i + p2) * (i + p5)) % 630;
    //     var box_size = (630 - y) / 8 - i / 10;
    //     canvas.drawRect({
    //         fillStyle: getFrontColor(h, i),
    //         x: x, y: y,
    //         width: box_size,
    //         height: box_size,
    //         cornerRadius: 50
    //     });
    // }
    //
    // // Large Bubbles
    var large_bubble_count = (p1 + p2 + p3) % 2 + 3;
    for (var i = 1; i <= large_bubble_count; i++) {
        var x = (i * (300 + p4 - p5) + i * p2) % (1200 - 100) + 50;
        var y = ((i + p4) * (i + p2)) % (630 - 50);
        var box_size = (630 - y + 100) / 2;
        canvas.drawRect({
            fillStyle: getAccentColor(h, i),
            x: x, y: y,
            width: box_size,
            height: box_size,
            cornerRadius: 415
        });
    }

    // // Title background
    // canvas.drawRect({
    //     fillStyle: "rgba(0, 0, 0, 0.8)",
    //     x: 1200 / 2,
    //     y: 630 - 70,
    //     width: 1200,
    //     height: 140
    // });

    const title_size = context.measureText(title)

    // Brand
    canvas.drawText({
        fillStyle: "#ffffff",
        x: 1200 / 2,
        y: (630 - 140) / 2,
        shadowColor: getBackColor(h),
        shadowBlur: 5,
        shadowX: 3, shadowY: 3,
        fontSize: 30,
        fontFamily: "'Noto Sans CJK JP Black', 'Noto Sans Japanese'",
        fontWeight: 900,
        maxWidth: 300,
        text: brand,
    });


    title = title.replace('\\n', "\n")
    const title_font_size = Math.min(1000 / title_size.width * 100, 140);
    console.log(title_font_size)
    // Title
    canvas.drawText({
        fillStyle: "#030012",
        name: 'title',
        x: 1200 / 2,
        y: 140,
        fontSize: title_font_size,
        maxWidth: 100,
        align: 'left',
        fontFamily: "'Noto Sans CJK JP Black', 'Noto Sans Japanese'",
        fontWeight: 900,
        text: title,
        lineHeight: 2,
    });



    // hashtag
    canvas.drawText({
        fillStyle: "#6c7ab5",
        x: 1200 - 50,
        y: 630 - 10,
        fontSize: 12,
        fontFamily: "'Noto Sans CJK JP Black', 'Noto Sans Japanese'",
        text: "#ogp_image_generator",
    });

    //Brightness
    canvas.drawPath({
        fillStyle: bright_layer,
        strokeWidth: 0,
        p1: {
            type: 'line',
            x1: 0, y1: 0,
            x2: 0, y2: 630 - 50,
        },
        p2: {
            type: 'quadratic',
            cx1: 1200 / 2, cy1: 120,
            x2: 1200, y2: 80
        },
        p3: {
            type: 'line',
            x1: 1200, y1: 80,
            x2: 1200, y2: 0,
            x3: 0, y3: 0
        }
    });

    return canvas;
};
