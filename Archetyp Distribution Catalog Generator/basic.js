var pdf;

function setup() {
    createCanvas(600, 200, P2D);
    pdf = createPDF();
    pdf.beginRecord();
}

function draw() {
    background(225);
    fill('#ED225D');
    textSize(100);
    textAlign(CENTER);
    text(frameCount, width * 0.5, height * 0.5);
    if (frameCount == 10) {
        noLoop();
        pdf.save();
    }
}
