const Jimp = require('jimp');

var color = {
    path: 4294967295,
    wall: 255,
    solve: 16751359,
    exits: 65535
};

const directory = "20x20.png";

//restart();
run();

async function restart() {
    var img = await Jimp.read(`${directory}`);
    img.write('output.png');
};

async function run() {
    var img = await Jimp.read(`${directory}`);

    const width = img.getWidth();
    const height = img.getHeight();

    var mazeString = "";

    for(y = 0; y < height; y++) {
        for(x = 0; x < width; x++) {

            var pixel = img.getPixelColor(x, y);
            var val = 0;

            if(pixel == color.wall) val = 1;
            if(pixel == color.path) {
                if(y == 0) val = "S";
                if(x == 0) val = "S";

                if(y+1 == height) val = "E";
                if(x+1 == width) val = "E";
            }

            if(x+1 == width && y+1 !== height) {
                mazeString = `${mazeString}${val}\r\n`
            } else {
                mazeString = `${mazeString}${val}`
            }
        }
    }

    var maze = [];
    var solution = [];
    var row = mazeString.split("\r\n");

    for(i = 0; i < row.length; i++) {
        maze[i] = row[i].split("");
        solution[i] = row[i].split("");
    }

    var start = [-1, -1];

    for(y = 0; y < height; y++) {
        for(x = 0; x < width; x++) {
            if(solution[x][y] == "S") {
                start = [x, y];
            } else if(solution[x][y] == "1") {
                solution[x][y] = "@";
            } else if(solution[x][y] == "0") {
                solution[x][y] = "_";
            }
        }
    }

    solution = await solve(solution, start[0], start[1]);

    for(x = 0; x < width; x++) {
        for(y = 0; y < height; y++) {
            if(solution[x][y] == "@") {
                solution[x][y] = "1";
            } else if(solution[x][y] == "#") {
                solution[x][y] = "0";
            } else if(solution[x][y] == "_") {
                solution[x][y] = "0";
            }
        }
    }

    for(y = 0; y < height; y++) {
        for(x = 0; x < width; x++) {
            if(solution[y][x] == "X") img.setPixelColor(color.solve, x, y);
            if(solution[y][x] == "S") img.setPixelColor(color.exits, x, y);
            if(solution[y][x] == "E") img.setPixelColor(color.exits, x, y); 
        }
    }

    img.write('output.png');
}

async function solve(solution, x, y) {
    var newStep = await lookFor("_", solution, x, y);
    var oldStep = await lookFor("X", solution, x, y);
    var winStep = await lookFor("E", solution, x, y);

    if(winStep[0] != -2) {
        return await solution;
    } else if(newStep[0] != -2) {
        solution[newStep[0]][newStep[1]] = "X";
        await solve(solution, newStep[0], newStep[1]);
    } else if(oldStep[0] != -2) {
        solution[x][y] = "#";
        await solve(solution, oldStep[0], oldStep[1]);
    }
    return solution;
}

async function lookFor(target, solution, x, y) {
    var location = [-2];

    async function check(x, y) {
        try {
            return await solution[x][y] == target;
        } catch (e) {
            return false;
        }
    }

    if(await check(x-1, y)) {
        location = [x - 1, y];
    } else if(await check(x, y - 1)) {
        location = [x, y - 1];
    } else if(await check(x + 1, y)) {
        location = [x + 1, y];
    } else if(await check(x, y + 1)) {
        location = [x, y + 1];
    }
    return location;
}