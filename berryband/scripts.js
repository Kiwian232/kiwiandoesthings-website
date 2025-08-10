var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d", { alpha: true });

var bluebbyImage = document.getElementById("bluebby");
var arrowImage = document.getElementById("arrow");
var arrowLeftImage = document.getElementById("arrow_left");
var arrowUpImage = document.getElementById("arrow_up");
var arrowDownImage = document.getElementById("arrow_down");
var arrowRightImage = document.getElementById("arrow_right");

var arrowSize = 48;

var score = 0;

var combo = {
    level: 0,
    lastHit: 0,
    texts: []
}

var notes = [
    {
        note: 0,
        y: 0,
        blowup: 0
    }
];

var arrowShaker = [
    {
        x: 0,
        y: 0
    },
    {
        x: 0,
        y: 0
    },
    {
        x: 0,
        y: 0
    },
    {
        x: 0,
        y: 0
    }
];

var arrowHurters = [null, null, null, null];
var noteBlowers = [];

function removeArrayItem(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
}

function darkenColor(hex, darken) {
    hex = hex.replace('#', '');
    
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    
    r -= darken;
    g -= darken;
    b -= darken;

    if (r < 0) {
        r = 0;
    }
    if (g < 0) {
        g = 0;
    }
    if (b < 0) {
        b = 0;
    }
    
    return '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
}

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function blowupNote(noteIndex) {
    var noteReference = notes[noteIndex];
    var noteChecker = setInterval(function() {
        if (!notes.includes(noteReference)) {
            clearInterval(noteChecker);
            return;
        }
        
        noteReference.blowup += 5;

        if (noteReference.blowup > 35) {
            notes = removeArrayItem(notes, noteReference);
            clearInterval(noteChecker);
        }
    }, 10);
    
    noteBlowers.push(noteChecker);
}

function newNote(arrowIndex) {
    notes.push({
        note: arrowIndex,
        y: -(bluebbyImage.height * 8),
        blowup: 0
    });
}

function badNote(arrowIndex) {
    if (score - 10 >= 0) {
        score -= 10;
    }

    combo.level = 0;
    combo.lastHit = 0;

    if (arrowHurters[arrowIndex]) {
        clearInterval(arrowHurters[arrowIndex]);
    }

    var arrowHurtTime = 0;
    arrowHurters[arrowIndex] = setInterval(function() {
        var shakeX = 0;
        var shakeY = 0;
        if (arrowIndex == 0 || arrowIndex == 3) {
            shakeX = 5;
            shakeY = 2;
        } else if (arrowIndex == 1 || arrowIndex == 2) {
            shakeX = 2;
            shakeY = 5;
        }
        arrowShaker[arrowIndex].x = randomIntFromInterval(-shakeX, shakeX);
        arrowShaker[arrowIndex].y = randomIntFromInterval(-shakeY, shakeY);

        arrowHurtTime++;

        if (arrowHurtTime >= 20) {
            clearInterval(arrowHurters[arrowIndex]);
            arrowHurters[arrowIndex] = null;
            
            arrowShaker[arrowIndex].x = 0;
            arrowShaker[arrowIndex].y = 0;
        }
    }, 5);
}

function goodNote(score) {
    window.score += 10;

    combo.level++;
    combo.lastHit = 0;

    var text = "";
    var color = "";
    if (score < 10) {
        text = "FRUITY";
        color = "#67fc9e";
    } else if (score < 25) {
        text = "AWESOME";
        color = "#fff311";
    } else if (score < 40) {
        text = "GOOD";
        color = "#665bff";
    } else {
        text = "OK";
        color = "#7c7c7c";
    }

    combo.texts.push({
        time: 0,
        text: text,
        color: color
    });
}

function runGame() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.imageSmoothingEnabled = false;

    updateGame();
    renderGame();
}

function updateGame() {
    for (var i = 0; i < notes.length; ++i) {
        if (notes[i].blowup === 0) {
            notes[i].y += 4;
        }
        if (notes[i].y > canvas.height) {
            notes = removeArrayItem(notes, notes[i]);
            if (score - 10 >= 0) {
                score -= 10;
            }
        }
    }

    if (combo.level > 0 && combo.lastHit >= 500) {
        combo.level = 0;
    }

    combo.lastHit += 5;

    for (var i = 0; i < combo.texts.length; ++i) {
        combo.texts[i].time += 0.05;
        if (combo.texts[i].time > 2) {
            combo.texts = removeArrayItem(combo.texts, combo.texts[i]);
        }
    }
}

function renderGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "black";
    ctx.font = "32px Saturday Night Fruitin";
    ctx.textAlign = "center";
    ctx.fillText("SCORE: " + String(score), canvas.width / 2, canvas.height * 0.1);
    ctx.fillText("COMBO: " + String(combo.level), canvas.width / 2, canvas.height * 0.2);
    var txt = 'Major W.I.P. No actual song charts yet, crazy dev art \n (you can barely tell those are supposed to blueberries\n and the transparency in the arrows isn\'t working)\n also fuck fonts right. hate trying\n to get them to draw without terrible antialiasing';
    var x = 400;
    var y = canvas.height / 2;
    var lineheight = 24;
    var lines = txt.split('\n');

    for (var i = 0; i<lines.length; i++)
        ctx.fillText(lines[i], x, y + (i*lineheight) );

    for (var i = 0; i < combo.texts.length; ++i) {
        ctx.fillStyle = combo.texts[i].color;
        var angle = combo.texts[i].time % (2 * Math.PI);
        var offsetX = 10 * Math.cos(angle);
        var offsetY = -10 * Math.sin(angle);
        ctx.strokeStyle = darkenColor(combo.texts[i].color, 100);
        ctx.lineWidth = 4;
        ctx.strokeText(combo.texts[i].text, canvas.width / 2 + offsetX, canvas.height * 0.3 + offsetY);
        ctx.fillText(combo.texts[i].text, canvas.width / 2 + offsetX, canvas.height * 0.3 + offsetY);
    }

    var arrowTargetSize = arrowSize;
    var arrowTargetPadding = arrowSize / 2;
    var noteOffset = (canvas.width / 2) + 200;
    for (var i = 0; i < 4; ++i) {
        //ctx.beginPath();
        //ctx.arc(noteOffset + (i * ((arrowTargetSize * 2) + arrowTargetPadding)), canvas.height * 0.75, arrowTargetSize, 0, 2 * Math.PI);
        //ctx.stroke();

        if (i === 0) {
            ctx.drawImage(arrowLeftImage, noteOffset - 50 + (i * ((arrowTargetSize * 2) + arrowTargetPadding)) + arrowShaker[0].x, (canvas.height * 0.7) + arrowShaker[0].y, arrowTargetSize * 2, arrowTargetSize * 2);
        } else if (i === 1) {
            ctx.drawImage(arrowUpImage, noteOffset - 50 + (i * ((arrowTargetSize * 2) + arrowTargetPadding)) + arrowShaker[1].x, (canvas.height * 0.7) + arrowShaker[1].y, arrowTargetSize * 2, arrowTargetSize * 2);
        } else if (i === 2) {
            ctx.drawImage(arrowDownImage, noteOffset - 50 + (i * ((arrowTargetSize * 2) + arrowTargetPadding)) + arrowShaker[2].x, (canvas.height * 0.7) + arrowShaker[2].y, arrowTargetSize * 2, arrowTargetSize * 2);
        } else if (i === 3) {
            ctx.drawImage(arrowRightImage, noteOffset - 50 + (i * ((arrowTargetSize * 2) + arrowTargetPadding)) + arrowShaker[3].x, (canvas.height * 0.7) + arrowShaker[3].y, arrowTargetSize * 2, arrowTargetSize * 2);
        }
    }

    for (var i = 0; i < notes.length; ++i) {
        ctx.drawImage(bluebbyImage, noteOffset + (notes[i].note * ((arrowTargetSize * 2) + arrowTargetPadding) - arrowTargetSize) + (((arrowTargetSize * 2) - (bluebbyImage.width * 8)) / 2) - (notes[i].blowup / 2), notes[i].y - (notes[i].blowup / 2), (bluebbyImage.width * 8) + notes[i].blowup, (bluebbyImage.height * 8) + notes[i].blowup);
    }
}

function handleInput(event) {
    var noteFound = false;
    var bestDistance = arrowSize + 1;
    for (var i = 0; i < notes.length; ++i) {
        if (notes[i].blowup > 0) {
            continue;
        }

        if (notes[i].note == 0 && !(event.keyCode == 37)) {
            continue;
        }
        if (notes[i].note == 1 && !(event.keyCode == 38)) {
            continue;
        }
        if (notes[i].note == 2 && !(event.keyCode == 40)) {
            continue;
        }
        if (notes[i].note == 3 && !(event.keyCode == 39)) {
            continue;
        }

        var noteToTargetDistance = Math.abs((canvas.height * 0.75) - (notes[i].y + (bluebbyImage.height * 8 / 2)));
        if (noteToTargetDistance < arrowSize * 2) {
            if (noteToTargetDistance < bestDistance) {
                bestDistance = noteToTargetDistance;
            }
            blowupNote(i);

            noteFound = true;
        }
    }

    if (!noteFound) {
        if (event.keyCode == 37) {
            badNote(0);
        } else if (event.keyCode == 38) {
            badNote(1);
        } else if (event.keyCode == 39) {
            badNote(3);
        } else if (event.keyCode == 40) {
            badNote(2);
        }
    } else {
        goodNote(bestDistance);
    }
}

addEventListener("keydown", (event) => handleInput(event));

setInterval(runGame, 5);
setInterval(function() {
    newNote(randomIntFromInterval(0, 3));
}, 250);