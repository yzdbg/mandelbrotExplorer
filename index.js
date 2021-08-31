
const ASPECT_RATIO = window.innerHeight/window.innerWidth
const HEIGHT = window.innerHeight;
const WIDTH =  window.innerWidth;
const ZOOM = 0.5

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageData = ctx.createImageData(HEIGHT, WIDTH);
ctx.canvas.width = HEIGHT;
ctx.canvas.height = WIDTH;

let prog = document.getElementById("progress")
let iter = document.getElementById("iterations")
let max_iter
let x_range 
let y_range 
let x 
let y 

function init(){
    progress("Processing, please wait...")
    max_iter = 200
    if(HEIGHT>WIDTH){
        x_range = 3
        y_range = x_range*ASPECT_RATIO
    }
    else{
        
        y_range = 2.2
        x_range = y_range/ASPECT_RATIO
    }
    x = -x_range*0.666
    y = -y_range/2
    render(x, x+x_range, y, y+y_range)
}

// Used Complex.js initially, turned out to be significantly slower than standard arithmetic
/* mandelbrot = function (r,i) {
    let c = Complex(r,i)
    let z = Complex(0, 0);
    let n = 0;
    while (z.abs() <= 2 && n < MAX_ITER) {
        z = z.pow(2).add(c);
        n++;
    }
    return [n, z];
} */

// Instead, a pure arithmetic optimized operation was used. Resulted in a significan speed increase.
let mandelbrot2 = function (r,i) {
    let za = r;
    let zb = i;
    let n = 1;
    let temp;
    while (za*za+zb*zb <= 3.5 && n < max_iter) {
        temp = za
        za = za*za - zb*zb + r
        zb = 2*temp*zb + i
        n++;
    }
    return [n, za*za+zb*zb];
}

let progress = async function(text){
    prog.innerHTML = text
}
let iterations = function(text){
    iter.innerHTML = text
}
let save = function(){
    var link = document.getElementById('link');
    link.setAttribute('download', 'Mandelbrot_'+ max_iter+'_iterations.png');
    link.setAttribute('href', canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
    link.click();
}
// Calculating the escape count and 
let render = async function (x_start, x_end,y_start, y_end) {
    let t = performance.now()
    let image = []
    let real;
    let imaginary;
    let color;
    let log_z;
    let nu;
    var interiorColor = [0, 0, 0, 255];
    iterations('Iterations: ' + max_iter)
    
    for (let i = 0; i < WIDTH; i++) {
        for (let j = 0; j < HEIGHT; j++) {

            real = x_start + Math.abs(x_start-x_end) * i / WIDTH
            imaginary = y_start + Math.abs(y_start-y_end) * j / HEIGHT

            res = mandelbrot2(real, imaginary)
            n = res[0]
            z = res[1]
            // Calculating the squre root of |Z| with log trick
            log_z = Math.log(z)*0.5
            nu = Math.log(log_z / Math.log(2)) / Math.log(2)

            if(n == max_iter) image.push(...interiorColor)
            else{
                //color smoothing
                color = n + 1 - nu
                image.push( 
                    color/max_iter*0,
                    color/max_iter*255,
                    color/max_iter*65,
                    255
                )
            }

        }
    }
    t = (performance.now() - t )/ 1000
    //console.log('Finished in :' + t + 's')
    progress('Finished in: ' + t.toFixed(3) + 's')

    // Iterate through every pixel
    imageData.data.set(image)

    // Draw image data to the canvas
    ctx.putImageData(imageData, 0, 0);
}

let zoom = function(pos_x,pos_y){
    
    x = x+x_range*pos_x/WIDTH - x_range*ZOOM/2
    x_range = x_range*ZOOM
    
    y = y+y_range*pos_y/HEIGHT - y_range*ZOOM/2
    y_range = y_range*ZOOM
    
    max_iter = Math.floor(max_iter + 200/(ZOOM*1.25))

    console.log({pos_x},
        {pos_y},
        {x_range},
        {y_range},
        {x},
        {y},
        'New max iter : ' + max_iter)
    render(x, x+x_range, y, y+y_range)
}

let zoomOut = function(pos_x,pos_y){
    
    x = x+x_range*pos_x/WIDTH - (x_range/ZOOM)/2
    x_range = x_range/ZOOM
    
    y = y+y_range*pos_y/HEIGHT - (y_range/ZOOM)/2
    y_range = y_range/ZOOM
    
    if(max_iter != 200) max_iter = Math.floor(max_iter - 200/(ZOOM*1.25))

    console.log({pos_x},
        {pos_y},
        {x_range},
        {y_range},
        {x},
        {y},
        'New max iter : ' + max_iter)
    render(x, x+x_range, y, y+y_range)
}



function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

let lcHandler = function (evt) {
    progress("Processing, please wait...")
    setTimeout(()=>{
        var mousePos = getMousePos(canvas, evt);
    //console.log('x : ' + (x+x_range*mousePos.x/WIDTH) + ', y : ' + -(y+y_range*mousePos.y/HEIGHT));
    canvas.removeEventListener("click", lcHandler)
    zoom(mousePos.x,mousePos.y);
    canvas.addEventListener("click", lcHandler, false)
    }, 1)
}

let rcHandler = function (evt) {
    progress("Processing, please wait...")
    setTimeout(()=>{
        var mousePos = getMousePos(canvas, evt);
        console.log('x : ' + (x+x_range*mousePos.x/WIDTH) + ', y : ' + -(y+y_range*mousePos.y/HEIGHT));
        canvas.removeEventListener("contextmenu", rcHandler)
        zoomOut(mousePos.x,mousePos.y);
        canvas.addEventListener("contextmenu", rcHandler, false)
    },1)
}
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}
canvas.addEventListener("click", lcHandler, false);
canvas.addEventListener("contextmenu", rcHandler, false);



init()