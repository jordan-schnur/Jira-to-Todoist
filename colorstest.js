let todoistColors = [];

let str = `30	berry_red	 #b8256f		40	light_blue	 #96c3eb
31	red	 #db4035		41	blue	 #4073ff
32	orange	 #ff9933		42	grape	 #884dff
33	yellow	 #fad000		43	violet	 #af38eb
34	olive_green	 #afb83b		44	lavender	 #eb96eb
35	lime_green	 #7ecc49		45	magenta	 #e05194
36	green	 #299438		46	salmon	 #ff8d85
37	mint_green	 #6accbc		47	charcoal	 #808080
38	teal	 #158fad		48	grey	 #b8b8b8
39	sky_blue	 #14aaf5		49	taupe	 #ccac93`;

// split string by whitespaces into three parts and add to array
let arr = str.split(/\s+/).map(function (item) {
    return item.split(/\t/);
});

let i = 0;
let tempArray = [];
for (a of arr) {
    let colorIndex = Math.floor(i / 3);
    if(tempArray[colorIndex] === undefined) {
        tempArray[colorIndex] = [];
    }
    tempArray[colorIndex].push(a[0]);

    // console.log(colorIndex);
    // console.log(a);
    i++;
}

for (a of tempArray) {
    let id = a[0];
    let name = a[1];
    let hex = a[2];
    todoistColors[id] = {
        name: name,
        hex: hex
    };
}

//console.log(todoistColors);

// from https://stackoverflow.com/a/5624139
function hexToRgb(hex) {
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });
  
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
  
  // Distance between 2 colors (in RGB)
  // https://stackoverflow.com/questions/23990802/find-nearest-color-from-a-colors-list
  function distance(a, b) {
      return Math.sqrt(Math.pow(a.r - b.r, 2) + Math.pow(a.g - b.g, 2) + Math.pow(a.b - b.b, 2));
  }
  
  // return nearest color from array
  function nearestColor(colorHex){
    var lowest = Number.POSITIVE_INFINITY;
    var tmp;
    let index = 0;
    todoistColors.forEach( (el, i) => {
        tmp = distance(hexToRgb(colorHex), hexToRgb(el.hex))
        if (tmp < lowest) {
          lowest = tmp;
          index = i;
        };
        
    })
    return todoistColors[index];
    
  }

console.log("[")
todoistColors.forEach((value, index) => {
    console.log("\t" + index + ": " + `{ name: ${value.name}, color: "${value.hex}" }`);
});
console.log("]")
console.log("No Category(Medium Gray)[1]: %o", nearestColor("#939799"));
console.log("To Do(Blue Grey)[2]: %o", nearestColor("#dfe1e6"));
console.log("Done(Green)[3]: %o", nearestColor("#00875a"));
console.log("In Progress(Yellow)[4]: %o", nearestColor("#f5e617"));