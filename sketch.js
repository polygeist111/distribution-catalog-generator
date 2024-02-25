let button1;
let button2; //depracated
const productURL = "https://api.commerce7.com/v1/product?cursor=";
const appID = "distribution-catalog-generator";
const ASK = "Basic ZGlzdHJpYnV0aW9uLWNhdGFsb2ctZ2VuZXJhdG9yOmNGSGxOS0g5SGp6dWM0cHF1eThoeWtiS3ZGV0x2cGhaY2MyS2xBY3lnbDl0NzlKQ1ZiMTB2UDRNZERqZVBFbG8=";
//generate auth header at https://www.debugbear.com/basic-auth-header-generator
//let credentials = btoa(appID + ":" + ASK);
//let auth = { "Authorization" : `Basic${credentials}` };
let productList = [];
let wineList = [];
let pricedWineList = [];
let allPages = [];
let allImages = [];
let frontMatter = [];
let makerMatter = [];
let backMatter = [];
let makers = [];
let allInsertOverlays = [];

let wineIndex = 0;
let drawing = false;

var pdf;
var currentPage;
var vectorsOnly = false;

let determiningDim;

let ArchBlue = '#2B3475';
let C7Gray = "#222a30";
let white = '#FFFFFF';

let imgWidth = 170;
let imgHeight = 691;

let testFont;
let regFont;
let boldFont;
let italFont;

let bodyMargin = 20;

let definitiveLength = 0;
let printIndex = 0;
let lastMaker = "";
let makerIndex = 0;
let backIndex = 0;
let allDone = false;
let printReady = false;

let tester;


//let pageCount = 0;

/*

Change all measurements from template by 1.02 (it's 800 by 1035, should be 816 by 1056)

*/


function preload() {
  testFont = loadFont('Fonts\\MoonlessSC-Regular (1).otf');
  regFont = loadFont('Fonts\\Brandon-Grotesque-Regular.otf');
  boldFont = loadFont('Fonts\\Brandon-Grotesque-Bold.otf');
  italFont = loadFont('Fonts\\Brandon-Grotesque-Regular-Italic.otf');

}

function setup() {
  //readDir('InsertedCopy');

  frontMatter.splice(0, 3);
  makerMatter.splice(0, 23);
  backMatter.splice(0, 8);
  //console.log(frontMatter);
  //console.log(makerMatter);
  //console.log(backMatter);
  if (window.innerWidth > window.innerHeight) { determiningDim = window.innerHeight; } else { determiningDim = window.innerWidth; }
  var canvas = createCanvas(determiningDim * 0.8, determiningDim * 0.8, SVG);
  document.getElementById('canvas_shell').style = "width: " + (document.getElementById("defaultCanvas").getBoundingClientRect().width + 10) + "px; height: " + (document.getElementById("defaultCanvas").getBoundingClientRect().height + 10) + "px; float: left;";
  //document.getElementById("defaultCanvas").parent = document.getElementById('canvas_shell');
  document.getElementById('canvas_shell').appendChild(document.getElementById("defaultCanvas"));
  //canvas.parent("canvas_shell");
  //document.getElementById('canvas_shell').appendChild(canvas);

  //button1 = createButton('Generate Sheets');
  //button1.parent("canvas_shell");
  //button1 = document.getElementById("confirm_generation");
  //button1.position(width * 0.5 - button1.width * 0.5,  height * -0.5 + button1.height * -0.5, "relative");
  //button1.mousePressed(startPressed);
  //button1.hide();
  document.getElementById("confirm_generation").style.visibility = "hidden";

  //button2 = createButton('Print Sheets');
  //button2.parent("canvas_shell");
  //button2.position(width * 0.5 - button1.width * 0.5,  height * -0.5 + button1.height * -0.5, "relative");
  //button2.mousePressed(printPDF);
  //button2.hide();

  document.getElementById('printer_shell').style.display = "none";
  document.getElementById('page_list').style.display = "none";


  //reStart();
  textFont(regFont);
  noStroke();
  repositionButtons();
}



//Resizes canvas to fit window
function windowResized() {
  if (!drawing) {
    if (window.innerWidth > window.innerHeight) { determiningDim = window.innerHeight; } else { determiningDim = window.innerWidth; }
    //console.log(window.innerWidth + "x" + window.innerHeight + determiningDim);
    resizeCanvas(determiningDim * 0.8, determiningDim * 0.8);
    //button1.position(width * 0.5 - button1.width * 0.5,  height * -0.5 + button1.height * -0.5, "relative");
    //button2.position(width * 0.5 - button2.width * 0.5,  height * -0.5 + button2.height * -0.5, "relative");
    document.getElementById('canvas_shell').style = "width: " + (document.getElementById("defaultCanvas").getBoundingClientRect().width + 1) + "px; height: " + (document.getElementById("defaultCanvas").getBoundingClientRect().height + 1) + "px; border: 1px solid white; float: left;";

  }

  repositionButtons();

}



//Recursively fills produtsList with all products in C7
function populateProducts(cursorIn) {
  fetchWines(productURL + cursorIn)
  .then(m => { 
    m[0].forEach(item => append(productList, item));
    console.log(productList);
    console.log(m[1]);
    if (m[1] != null) {
      populateProducts(m[1]);
    } else {
      populateWineList();
    }
  })
  .catch(e => { console.log(e) });

  repositionButtons();
}



//Requests 50 product pages from C7
async function fetchWines(url = "") {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Basic Y2F0YWxvZy1nZW5lcmF0b3ItaW50ZWdyYXRpb24tdGVzdDpoS00wN01LcHE0aHVhZ2tMRHVrQ3FjRnU1R1FBTWVORUM2dWVpRU1ma09EdGQwUmFhNVYxZWlQRVhCaWtESDM5",
      "Tenant": "archetyp",
    },
  });
  const parsedJSON = await response.json();
  const newCursor = await parsedJSON.cursor;
  const products = await parsedJSON.products;
  return [products, newCursor]; //returns array of products as well as ending cursor value (essentially, next page index)

} 



//Filters productList to wineList, making sure only available wines and bundles are included
function populateWineList() {
  productList.forEach(item => {
    if(item.webStatus === "Available" && (item.type === "Wine" /*|| item.type === "Bundle"*/)) { 
      append(wineList, item) } 
  });
  sortWineList();
}



//Sorts wineList alpha by maker, then wine, then bundles by alpha at end (commented out sections are logic to sort bundles)
function sortWineList() {
  let wines = [];
  //let bundles = [];
  wineList.sort((a,b) => makerName(a.title).localeCompare(makerName(b.title)));
  wineList.sort(function (a,b) {
    if (makerName(a.title).localeCompare(makerName(b.title)) == 0) {
      return wineName(a).localeCompare(wineName(b));
    }
    return 0;
  });
  wineList.forEach(function(item) {
    if (item.type === "Wine") { append(wines, item); }
    //if (item.type === "Bundle") { append(bundles, item); }
  });
  for (var i = 0; i < wines.length; i++) {
    wineList.splice(i, 1, wines[i]);
  }/*
  for (var i = 0; i < bundles.length; i++) {
    wineList.splice(wines.length + i, 1, bundles[i]);
  }*/
  console.log(wineList);
  
  //moves winelist into 2d array with space for prices
  for (var w = 0; w < wineList.length; w++) {
    let toPush = [wineList[w]]
      for (var i = 0; i <= wineList[w].variants.length; i++) {
        toPush.push("");
    }
    pricedWineList.push(toPush);
  }
  console.log(pricedWineList);
  getMakers();
  if (document.getElementById('authorize_button').innerText == "Refresh") { getPrices(); }
  loop();
}



//Returns wine title without vintage
function makerName(name) {
  if (name.substring(0,1) === "2") {
    return name.substring(5);
  } else return name;

}



//Returns only actual maker name, no wine name
function justMakerName(wineIn) {
  let name = wineIn.title
  let makeName = makerName(name);
  let bottleName;
  
  bottleName = wineName(wineIn);
  let result =  makeName.substring(0, makeName.length - bottleName.length - 1);
  //if (!makers.includes(result)) { makers.push(result); console.log("hi"); } else { console.log("bye"); }
  return result;

}


//Returns wine title without vintage or maker
function wineName(wine) {
  let name = makerName(wine.title);
  let makerNameSpace;
  if (wine.vendor != null) {
    makerNameSpace = wine.vendor.title.length;
  } else return name;
  if (wine.vendor.title == "Vinodea / Andrea Schenter") {
    makerNameSpace = 7;
  }
  return name.substring(makerNameSpace + 1);

}



//Handles start button input
function startPressed() {
  fill(white);
  resizeCanvas(816, 1056);
  document.getElementById('canvas_shell').style = "width: " + (document.getElementById("defaultCanvas").getBoundingClientRect().width + 1) + "px; height: " + (document.getElementById("defaultCanvas").getBoundingClientRect().height + 1) + "px; border: 1px solid white; float: left;";

  drawing = true;
  pdf.beginRecord();
  //button1.hide();
  document.getElementById("confirm_generation").style.visibility = "hidden";

  repositionButtons();
}



//Draws to canvas, snaps and saves all product pages
//The checks for vectorsOnly don't render anything but insert matter overlay if they fail
function draw() {
  if (!drawing) { 
    background(C7Gray); 
  } else { 
    background(white);
    clear(); 
    currentPage = createGraphics(width, height); 

    priceGraphic = createGraphics(width, height);
    footerGraphic = createGraphics(width, height);
    productGraphic = createGraphics(width, height);
    insertGraphic = createGraphics(width, height);


  }

  
  console.log("current pg: " + width + " " + height);
  /*
  if (drawing && wineIndex < wineList.length - 1) {
    pages();
    footer(0, 0);
    pdf.nextPage();
  } else if (drawing && wineIndex == wineList.length - 1) {
    pages();
    footer(0, 0);
  }
  if (wineIndex == wineList.length && wineList.length > 0) {
    pdf.save();
    noLoop();
    reStart();

  }
  */
  //console.log(pricedWineList[wineIndex + 1][0]);
  //console.log(lastMaker);
  let img;
  if (drawing && printIndex < definitiveLength - 1 && !allDone) {
    //front matter
    if (printIndex < frontMatter.length) {
      if (!vectorsOnly) {
        img = frontMatter[printIndex];
        img = resizeToPrint(img);
        currentPage.image(img, 0, 0);
      }
      
      //console.log("Page " + (printIndex + 1) + ": " + "InsertedCopy\\FrontMatter_Fall_" + (printIndex + 1) + ".png");
      if (printIndex != 0) {
        document.getElementById('page_list').innerHTML += ("<br>");
      }
      document.getElementById('page_list').innerHTML += "&nbsp;Page " + (printIndex + 1) + ": " + "InsertedCopy\\FrontMatter_Fall_" + (printIndex + 1) + ".png";

      //fix footers
      if (printIndex != 0) {
        footer(0, 0);
      }

      image(currentPage, 0, 0);
      footer(0, 0);

      pdf.nextPage();

      printIndex++;
      console.log("front page " + printIndex);

      //maker matter
    } if (printIndex == 2) { noLoop(); } /*comment out here */else if (pricedWineList[wineIndex] != undefined && lastMaker != undefined && justMakerName(pricedWineList[wineIndex][0]) != lastMaker) {
      lastMaker = justMakerName(pricedWineList[wineIndex][0]);
      img = makerMatter[makerIndex];
      //console.log(img.width + " " + img.height);
      var imgW = img.width;
      var imgH = img.height;
      var img2 = img.get(img.width * 0.75, 0, img.width * 0.25, img.height);
      //console.log(lastMaker + " " + imgW + " " + imgH);
      img = resizeToPrint(img);
      image(img, 0, 0);


      document.getElementById('page_list').innerHTML += "<br> &nbsp;Page " + (printIndex + 1) + ": " + "InsertedCopy\\MakerMatter_Fall_" + makers[makerIndex] + ".png";
      makerIndex++;

      //fix top right wine listing
      makerWineList(img2, imgW, imgH);
      //makerWineList(img, imgW, imgH);

      //fix footers
      footer(0, 392);

      pdf.nextPage();
    
      printIndex++;
      console.log("maker page " + printIndex);

      //back matter
    } else if (wineIndex == pricedWineList.length && backIndex < backMatter.length - 1) {
      img = backMatter[backIndex];
      img = resizeToPrint(img);
      image(img, 0, 0);

      document.getElementById('page_list').innerHTML += "<br> &nbsp;Page " + (printIndex + 1) + ": " + "InsertedCopy\\BackMatter_Fall_" + (backIndex + 1) + ".png";


      //fix footers
      if (backIndex < 2) {
        footer(243, 0);
      } else {
        footer(0, 0);
      }

      pdf.nextPage();

      backIndex++;
      printIndex++;
      console.log("back page " + printIndex);

      //tech sheets
    } else if (wineIndex < pricedWineList.length) {
      pages();
      footer(0, 0);
      console.log(wineIndex + " " + pricedWineList[wineIndex])
      document.getElementById('page_list').innerHTML += "<br> &nbsp;Page " + printIndex + ": " + pricedWineList[wineIndex - 1][0].title;

      //wineIndex--;
      //printIndex--;
      pdf.nextPage();
      console.log("tech sheet page " + printIndex);
    }
    //end here
  } 
  
  
  //last back matter / last page
  if (drawing && backIndex == backMatter.length - 1 && !printReady) {
    img = backMatter[backIndex];
    img = resizeToPrint(img);
    image(img, 0, 0);

    document.getElementById('page_list').innerHTML += "<br> &nbsp;Page " + (printIndex + 1) + ": " + "InsertedCopy\\BackMatter_Fall_" + (backIndex + 1) + ".png";

    //fix footers
    if (backIndex < 2) {
      footer(243, 0);
    } else {
      footer(0, 0);
    }
    
    backIndex++;
    printIndex++;
    noLoop();
    //printReady = true;
    //allDone = true;
    //button2.show();
    document.getElementById('printer_shell').style.display = 'block'
    document.getElementById('page_list').style.display = "inline-block";
    repositionButtons();
    
  }
  
  //Closing save (after last page)
  if (allDone) {
    pdf.save();
    noLoop();
    allDone = false
    printReady = false;
    reStart();

  }



  if (!drawing) {
    document.getElementById('canvas_shell').style = "width: " + (document.getElementById("defaultCanvas").getBoundingClientRect().width + 1) + "px; height: " + (document.getElementById("defaultCanvas").getBoundingClientRect().height + 1) + "px; border: 1px solid white; float: left;";

    fill('#ED225D');
    textSize(30);
    textAlign(CENTER);
    if (document.getElementById('authorize_button').innerText == "Refresh") { 
      text("Press the button to continue", width * 0.5, height * 0.4);
    } else {
      text("Please sign in to Google to continue", width * 0.5, height * 0.4);
    }
  }

}



//converts price(s) into formatted string with dividers as needed
function formatPrice(thisWine) {
  let price = "";
  for (var i = 2; i < thisWine.length; i++) {
    price += " | " + thisWine[i];
  }
  price = price.substring(3);
  return price;

}



//Iterates through wineList to create product pages (requires Nicole's designs) - consider special case for multiple variants
function pages() {
  var thisWine = pricedWineList[wineIndex];
  productGraphic.fill('#ED225D');
  productGraphic.textSize(30);
  productGraphic.textAlign(CENTER);
  
  //text(justMakerName(thisWine[0]), width * 0.5, height * 0.3);
  //text(wineIndex, width * 0.5, height * 0.5);
  
  //text(formatPrice(thisWine), width * 0.5, height * 0.7);
  //https://github.com/zenozeng/p5.js-pdf/releases/tag/v0.3.0
  //currently unused, adapt to fit with pdf generator
  //button1.hide()
  /*
  for (let i = 0; i < gridded.length; i++) {
    let page = createGraphics(738, 662);

    page.background(0,0,0,0);
    page.imageMode(CORNER);

    page.image(guide, 45, 88, 0.666 * guide.width, 0.666 * guide.height);
    page.image(gridded[i], 63 + 0.666 * guide.width, 88);

    append(allPages, page);
  }

  for (let page = 0; page < allPages.length; page++) {
    save(allPages[page], modelName + "_instructions_" + page + ".png");
  }*/

  //header(thisWine);

  //bottleshot also calls header (to avoid vectorization bug where header text was rasterized)
  bottleShot(thisWine);

  header(thisWine);

  priceBox(thisWine);

  writeBody(thisWine[0]);

  //footer(0, 0);

  console.log(wineIndex);
  wineIndex++;
  printIndex++;

}



//Starts/restarts all processes
function reStart() {
  productList = [];
  wineList = [];
  pricedWineList = [];
  allPages = [];
  allImages = [];
  allInsertOverlays = [];

  wineIndex = 0;
  drawing = false;

  //if (window.innerWidth > window.innerHeight) { determiningDim = window.innerHeight; } else { determiningDim = window.innerWidth; }
  resizeCanvas(determiningDim * 0.8, determiningDim * 0.8);
  document.getElementById('canvas_shell').style = "width: " + (document.getElementById("defaultCanvas").getBoundingClientRect().width + (-1)) + "px; height: " + (document.getElementById("defaultCanvas").getBoundingClientRect().height + (-1)) + "px; border: 1px solid white; float: left;";


  noLoop();
  pdf = createPDF();
  currentPage = null;

  priceGraphic = null;
  footerGraphic = null;
  productGraphic = null;
  insertGraphic = null;

  vectorsOnly = false;

  populateProducts("start");
  //button1.hide();
  document.getElementById("confirm_generation").style.visibility = "hidden";
  document.getElementById('printer_shell').style.display = "none";
  document.getElementById('page_list').innerHTML = "";
  document.getElementById('page_list').style.display = "none";
  console.log("reStarted");

  definitiveLength = 0;
  printIndex = 0;
  lastMaker = "";
  makerIndex = 0;
  backIndex = 0;
  allDone = false;
  printReady = false;
  repositionButtons();
}



//Wipes all read data
function wipeOut() {
  productList = [];
  wineList = [];
  pricedWineList = [];
  allPages = [];

  frontMatter = [];
  makerMatter = [];
  backMatter = [];

  wineIndex = 0;
  drawing = false;

  noLoop();

  //button1.hide();
  document.getElementById("confirm_generation").style.visibility = "hidden";

  definitiveLength = 0;
  printIndex = 0;
  lastMaker = "";
  makerIndex = 0;
  backIndex = 0;
  allDone = false;
  printReady = false;
}



//Applies trade prices (for all variants) to their correct places in pricedWineList array, automatically skips over unavailable wines. 
//Trade price sheet must be correctly sorted and have accurate SKUs
function filterPrices(priceIn) {
  console.log(priceIn);
  var winDex = 0;
  //iterates across pricedWineList
  for (var i = 0; i < pricedWineList.length; i++) {
    //iterates through each variant for a given entry in pricedWineList
    for (var s = 0; s < pricedWineList[i][0].variants.length; s++) {
      //Skips past nonmatching entries

      //if an error is thrown in this code, ensure than the file Archetyp Stocklist for Retail/Restaurant (on the TradingPriceConcise page) is appropriately organized
      while (priceIn[winDex][0] != (pricedWineList[i][0].variants[s].sku)) {
        console.log("entered loop");
        winDex++;
      }
      //appends price to correct array slot for given wine in pricedWineList
      if (priceIn[winDex][0] == (pricedWineList[i][0].variants[s].sku)) {
        pricedWineList[i][2 + s] = priceIn[winDex][1];
        winDex++;
      }
    }
  }
  loadImages();
  
  /* prints html description box
  let p = createP(pricedWineList[0][0].content);
      p.style('font-size', '16px');
      p.position(420, 300);
  */
  //parseHTMLText(pricedWineList[0][0].content);
}



//Confirms pdf print
function printPDF() {
  //allDone = true;
  console.log("printing");
  console.log("Full PDF Contents: ");
  console.log(pdf);
  pdf.save();
  noLoop();
  allDone = false
  printReady = false;
  reStart();
}



//Loads all wine images into an array
function loadImages() {
  for (var i = 0; i < pricedWineList.length; i++) {
    pricedWineList[i][1] = loadImage(pricedWineList[i][0].image);
  }
  console.log(pricedWineList);

  //Shows start button after a short delay to give photos loading time
  definitiveLength = pricedWineList.length + frontMatter.length + makers.length + backMatter.length;
  console.log("Definitive Length: " + definitiveLength);

  setTimeout(function() { /*button1.show();*/document.getElementById("confirm_generation").style.visibility = "visible"; }, 2000);
  
}



//Generates header
function header(thisWine) {
  productGraphic.textStyle(NORMAL);
  //header
  productGraphic.fill(ArchBlue);
  productGraphic.rect(0, 0, 816, 244);
  
  productGraphic.fill(white);
  productGraphic.noStroke();
  
  productGraphic.textAlign(LEFT);
  //textFont("Brandon Grotesque", 24);
  productGraphic.textFont(boldFont, 28);
  let thisVintage = thisWine[0].wine.vintage;
  if (thisVintage == null) { thisVintage = ""; }
  productGraphic.text(thisVintage, 62, 84);
  productGraphic.text(makerName(thisWine[0].title), 62, 135);
  productGraphic.textFont(italFont, 20);
  productGraphic.text(thisWine[0].subTitle, 62, 175);
  productGraphic.textFont(regFont);
  
}



//Generates bottle shot
function bottleShot(thisWine) {
//Resizes and renders image (170 max width, 691 max height)
  let img = thisWine[1];
  //width based resize
  let conversionRatio = imgWidth / img.width;
  img.width = imgWidth;
  img.height *= conversionRatio;
  //height based resize
  if (img.height > imgHeight) {
    conversionRatio = imgHeight / img.height;
    img.width *= conversionRatio;
    img.height = imgHeight;
  }
  //62,96
  productGraphic.image(img, 210 - img.width / 2, 280);

  //header(thisWine);
}



//Generates body text
function writeBody(thisWine) {

  let left = 420;
  let top = 275;
  let lastBox = null;
  let maxWidth = 336;
  let maxHeight = 600;
  let thisHeight;
  let totalHeight = 0;
  
  let thisContent = parseHTMLText(thisWine.content);
  let key = "";
  let spacer = "";
  let value = "";
  
  productGraphic.textSize(14.5);
  productGraphic.textFont(regFont);
  let spaceSize = textWidth(" ");
  /*
  textFont(boldFont);
  console.log(textWidth(thisContent[0].substring(0, thisContent[0].indexOf(":") + 1)));
  textFont(regFont);
  console.log(textWidth(thisContent[0].substring(0, thisContent[0].indexOf(":") + 1)));
  console.log(textWidth(" "));
  console.log(thisContent.length);
  */
  for (var i = 0; i < thisContent.length; i++) {

    //sets text block height
    if (lastBox == null) {
      thisHeight = top;
    } else { 
      thisHeight = textHeight(value, maxWidth) + 10;
      //console.log(thisHeight);
    }
    totalHeight += thisHeight;

    //assigns key, value, and spacer
    productGraphic.textFont(boldFont);
    key = thisContent[i].substring(0, thisContent[i].indexOf(":") + 1);
    spacer = "";
    spacerConstant = Math.round(textWidth(thisContent[i].substring(0, thisContent[i].indexOf(":") + 1) + 1) / spaceSize);
    for (var k = 0; k < spacerConstant; k++) {
      spacer += " ";
    }
    value = spacer + thisContent[i].substring(thisContent[i].indexOf(":") + 1);

    //Prints descriptive text
    productGraphic.textFont(boldFont);
    //text(thisContent[i][0], left, totalHeight, maxWidth, maxHeight);
    productGraphic.text(key, left, totalHeight, maxWidth, maxHeight);
    
    productGraphic.textFont(regFont);
    //text(thisContent[i][1], left, totalHeight, maxWidth, maxHeight);
    lastBox = productGraphic.text(value, left, totalHeight, maxWidth, maxHeight);
  }

}



//Generates footer
function footer(leftSide, rightSide) {
  let pageNum = pdf.elements.length / 2 + 1;
  console.log("Page num: " + printIndex);
  if (leftSide == 0) { leftSide = 60; }
  if (rightSide == 0) { rightSide = 756; }
  //rightSide -= leftSide;

  //white box (clear potential prior footers)
  footerGraphic.fill("white");
  footerGraphic.noStroke();
  footerGraphic.rect(leftSide - 5, 990, rightSide - leftSide + 25, 1025);

  //divider line
  footerGraphic.fill(ArchBlue);
  footerGraphic.stroke(ArchBlue);
  footerGraphic.line(leftSide, 1000, rightSide, 1000)

  //footer text
  footerGraphic.noStroke();
  footerGraphic.textFont(regFont, 12);
  footerGraphic.textAlign(RIGHT, TOP);
  footerGraphic.text(printIndex + 1, rightSide, 1005);
  footerGraphic.textAlign(LEFT, TOP);
  footerGraphic.text("Archetyp Catalog " + year(), leftSide, 1005);

}



//Generates wine list on top right of maker pages
function makerWineList(thisImg, thisWidth, thisHeight) {
  footerGraphic.imageMode(CORNER);
  thisImg.resize(204, 1056);
  //image(thisImg, 0, 0);

  let thisContent = [];

  //identifies box area
  var foundEnd = false;
  var lastBlue = 0;
  while(!foundEnd && lastBlue < thisImg.height) {
    //if (thisImg.get(203, lastBlue))
    var color = thisImg.get(203, lastBlue);
    console.log(color[0] + " " + color[1] + " " + color[2]);
    if (color[0] != 43 || color[1] != 52 || color[2] != 117) {
      foundEnd = true;
    } 
    lastBlue++;
  }
  lastBlue--;
  console.log("lastBlue = " + lastBlue);

  //fills box
  footerGraphic.fill(ArchBlue);
  footerGraphic.rectMode(CORNER);
  footerGraphic.rect(426, 0, 390, lastBlue);

  //fills list of current wines
  
  //adds text
  footerGraphic.textAlign(LEFT, TOP);
  let thisInd = wineIndex;
  while(thisInd < pricedWineList.length && justMakerName(pricedWineList[thisInd][0]) == justMakerName(pricedWineList[wineIndex][0])) {
    console.log(pricedWineList[thisInd][0].seo.title)
    thisContent.push(pricedWineList[thisInd][0].seo.title);
    thisInd++;
  }
  console.log(thisContent);
  
  let left = 481;
  //let top = 275;
  let lastBox = null;
  let maxWidth = 280;
  let maxHeight = lastBlue - 20;
  var thisHeight = 0;
  let totalHeight = 0;

  let boldFontSize = 22;
  let regFontSize = 15;
  
 
  let value = "";

  //textFont(boldFont);
  //console.log(textWidth(thisContent[0].substring(0, thisContent[0].indexOf(":") + 1)));
  //textFont(regFont);
  //console.log(textWidth(thisContent[0].substring(0, thisContent[0].indexOf(":") + 1)));
  //console.log(textWidth(" "));
  //console.log(thisContent.length);
  fill(white);
  for (var i = 0; i <= thisContent.length; i++) {

    //sets text block height
    if (lastBox == null) {
      thisHeight = 0;
      footerGraphic.textFont(boldFont, boldFontSize);
      value = "Wines"
    } else {
      thisHeight = 0;
      footerGraphic.textFont(regFont, regFontSize);
      value = thisContent[i - 1];
    }
    //if (i == 1) { thisHeight += 5; }

    thisHeight += (textHeight(value, maxWidth) + 10);
    console.log(thisHeight);

    totalHeight += thisHeight;
    console.log(totalHeight);

    //assigns key, value, and spacer
    //textFont(boldFont);
    //key = thisContent[i].substring(0, thisContent[i].indexOf(":") + 1);
    
    //value = thisContent[i].substring(thisContent[i].indexOf(":") + 1);

    //Prints descriptive text
    //textFont(boldFont);
    //text(thisContent[i][0], left, totalHeight, maxWidth, maxHeight);
    //text(key, left, totalHeight, maxWidth, maxHeight);
    
    //textFont(regFont);
    //text(thisContent[i][1], left, totalHeight, maxWidth, maxHeight);
    console.log(value + " " + left + " " + totalHeight + " " + maxWidth + " " + maxHeight);
    lastBox = value
  }
  lastBox = null;
  console.log("total height: " + totalHeight); 
  //totalHeight *= -1;
  totalHeight = (lastBlue * 0.5) - (totalHeight * 0.5) - 5;
  console.log("adjusted total height: " + totalHeight); 


  for (var i = 0; i <= thisContent.length; i++) {

    //sets text block height
    if (lastBox == null) {
      thisHeight = 0;
      footerGraphic.textFont(boldFont, boldFontSize);
      value = "Wines"
    } else {
      thisHeight = 0;
      footerGraphic.textFont(regFont, regFontSize);
      value = thisContent[i - 1];
    }
    
    //if (i == 1) { thisHeight += 5; }
    thisHeight += textHeight(value, maxWidth) + 10;
    //console.log(thisHeight);

    totalHeight += thisHeight;
    //console.log(totalHeight);

    //assigns key, value, and spacer
    //textFont(boldFont);
    //key = thisContent[i].substring(0, thisContent[i].indexOf(":") + 1);
    
    //value = thisContent[i].substring(thisContent[i].indexOf(":") + 1);

    //Prints descriptive text
    //textFont(boldFont);
    //text(thisContent[i][0], left, totalHeight, maxWidth, maxHeight);
    //text(key, left, totalHeight, maxWidth, maxHeight);
    
    //textFont(regFont);
    //text(thisContent[i][1], left, totalHeight, maxWidth, maxHeight);
    console.log(value + " " + left + " " + totalHeight + " " + maxWidth + " " + maxHeight);
    lastBox = footerGraphic.text(value, left, totalHeight - thisHeight, maxWidth, maxHeight);
  }
}



//Generates price box
function priceBox(thisWine) {
  //price box
  priceGraphic.strokeWeight(2);
  priceGraphic.stroke(ArchBlue);
  priceGraphic.rect(420, 916, 336, 52);

  //priceText
  priceGraphic.noStroke();
  priceGraphic.fill(ArchBlue);
  priceGraphic.textFont(boldFont, 22);
  priceGraphic.textAlign(CENTER, CENTER);
  priceGraphic.text(formatPrice(thisWine), 588, 942);
  priceGraphic.textAlign(LEFT, TOP);
}



//Converts c7 api wine content box into an array of readable text
function parseHTMLText(textIn) {
  let current = textIn;
  let result = [];
  let thisLine = "";

  while(current.length > 0) {
    //checks for new line
    //console.log("first four: " + current.substring(0,4));
    if (current.substring(0, 3) == "<p>") {
      current = current.substring(3);
    }
    if (current.substring(1, 4) == "<p>") {

      thisLine = handleSpecialCharacters(thisLine);
      result.push(thisLine);
      thisLine = "";
      current = current.substring(4);
    }

    //checks for/removes bracketed traits
    while (current.substring(0, 1) == "<") {
      current = current.substring(current.indexOf(">") + 1);
      //console.log(current)
    }
    //adds plain text to thisLine
    thisLine += current.substring(0, current.indexOf("<"));
    current = current.substring(current.indexOf("<"));
    //console.log(thisLine);

    //checks for/removes bracketed traits
    while (current.substring(0, 1) == "<" && current.substring(0, 3) != "<p>") {
      current = current.substring(current.indexOf(">") + 1);
      //console.log(current);
    }
  }
  thisLine = handleSpecialCharacters(thisLine);
  result.push(thisLine);

  console.log(result);
  return result;

}



//Handles special html characters
function handleSpecialCharacters(textIn) {
  //Spare spaces
  while (textIn.indexOf("&nbsp;") != -1) {
    textIn = textIn.substring(0, textIn.indexOf("&nbsp;")) + textIn.substring(textIn.indexOf("&nbsp;") + 6);
  }

  //U umlauts
  while (textIn.indexOf("&uuml;") != -1) {
    textIn = textIn.substring(0, textIn.indexOf("&uuml;")) + "ü" + textIn.substring(textIn.indexOf("&uuml;") + 6);
  }

  //Left quotation
  while (textIn.indexOf("&ldquo;") != -1) {
    textIn = textIn.substring(0, textIn.indexOf("&ldquo;")) + "\"" + textIn.substring(textIn.indexOf("&ldquo;") + 7);
  }

  //Right quotation
  while (textIn.indexOf("&rdquo;") != -1) {
    textIn = textIn.substring(0, textIn.indexOf("&rdquo;")) + "\"" + textIn.substring(textIn.indexOf("&rdquo;") + 7);
  }

  //Raised tone e
  while (textIn.indexOf("&eacute;") != -1) {
    textIn = textIn.substring(0, textIn.indexOf("&eacute;")) + "é" + textIn.substring(textIn.indexOf("&eacute;") + 8);
  }

  //N dash
  while (textIn.indexOf("&ndash;") != -1) {
    textIn = textIn.substring(0, textIn.indexOf("&ndash;")) + "–" + textIn.substring(textIn.indexOf("&ndash;") + 7);
  }

  //Apostrophe
  while (textIn.indexOf("&rsquo;") != -1) {
    textIn = textIn.substring(0, textIn.indexOf("&rsquo;")) + "\'" + textIn.substring(textIn.indexOf("&rsquo;") + 7);
  }

  //Degree symbol
  while (textIn.indexOf("&deg;") != -1) {
    textIn = textIn.substring(0, textIn.indexOf("&deg;")) + "°" + textIn.substring(textIn.indexOf("&deg;") + 5);
  }

  //o umlauts
  while (textIn.indexOf("&ouml;") != -1) {
    textIn = textIn.substring(0, textIn.indexOf("&ouml;")) + "ö" + textIn.substring(textIn.indexOf("&ouml;") + 6);
  }

  //a umlauts
  while (textIn.indexOf("&auml;") != -1) {
    textIn = textIn.substring(0, textIn.indexOf("&auml;")) + "ä" + textIn.substring(textIn.indexOf("&auml;") + 6);
  }

  //fractional 1/2
  while (textIn.indexOf("&frac12;") != -1) {
    textIn = textIn.substring(0, textIn.indexOf("&frac12;")) + "½" + textIn.substring(textIn.indexOf("&frac12;") + 6);
  }

  //O umlauts
  while (textIn.indexOf("&Ouml;") != -1) {
    textIn = textIn.substring(0, textIn.indexOf("&Ouml;")) + "Ö" + textIn.substring(textIn.indexOf("&Ouml;") + 6);
  }

  //A umlauts
  while (textIn.indexOf("&Auml;") != -1) {
    textIn = textIn.substring(0, textIn.indexOf("&Auml;")) + "Ä" + textIn.substring(textIn.indexOf("&Auml;") + 6);
  }

  //U umlauts
  while (textIn.indexOf("&Uuml;") != -1) {
    textIn = textIn.substring(0, textIn.indexOf("&Uuml;")) + "Ü" + textIn.substring(textIn.indexOf("&Uuml;") + 6);
  }

  //Sharp S
  while (textIn.indexOf("&#223;") != -1) {
    textIn = textIn.substring(0, textIn.indexOf("&#223;")) + "ß" + textIn.substring(textIn.indexOf("&#223;") + 6);
  }

  //Ampersand
  while (textIn.indexOf("&amp;") != -1) {
    textIn = textIn.substring(0, textIn.indexOf("&amp;")) + "&" + textIn.substring(textIn.indexOf("&amp;") + 5);
  }
  
  return textIn;
}



//Gets height of box given text and max width
//Borrowed from studioijeoma https://gist.github.com/studioijeoma/942ced6a9c24a4739199
function textHeight(text, maxWidth) {
  var words = text.split(' ');
  var line = '';
  var h = this._textLeading;

  for (var i = 0; i < words.length; i++) {
      var testLine = line + words[i] + ' ';
      //var testWidth = drawingContext.measureText(testLine).width;
      var testWidth = textWidth(testLine);

      if (testWidth > maxWidth && i > 0) {
          line = words[i] + ' ';
          h += this._textLeading;
      } else {
          line = testLine;
      }
      //console.log(line);
  }

  return h;
}



//Resizes image to print window dimensions (816 x 1056)
function resizeToPrint(imgIn) {
  imgIn.width = 816;
  imgIn.height = 1056;
  return imgIn;
}



//Reads InsertedCopy Directory
//Borrowed from https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryEntry/createReader
function readDirectory(directory) {
  let dirReader = directory.createReader();
  let entries = [];

  let getEntries = () => {
    dirReader.readEntries(
      (results) => {
        if (results.length) {
          entries = entries.concat(toArray(results));
          getEntries();
        }
      },
      (error) => {
        /* handle error — error is a FileError object */
      },
    );
  };

  getEntries();
  return entries;

}



//Loads inserted pages
function loadMatter() {
  //console.log(readDirectory(FileSystem.getDirectory('InsertedCopy')));
  //loads front matter
  frontMatter = [];
  makerMatter = [];
  backMatter = [];
  for (var i = 0; i < 3; i++) {
    var toPush = (loadImage('InsertedCopy\\FrontMatter_Fall_' + (i + 1) + '.png'));
    frontMatter.push(toPush);
  }
  console.log(frontMatter);
  console.log
  //loads mid matter (maker profiles)
  for (var i = 0; i < makers.length; i++) {
    var toPush = (loadImage('InsertedCopy\\MakerMatter_Fall_' + makers[i] + '.png'));
    makerMatter.push(toPush);
  }
  console.log(makerMatter);

  //loads back matter
  for (var i = 0; i < 8; i++) {
    var toPush = (loadImage('InsertedCopy\\BackMatter_Fall_' + (i + 1) + '.png'));
    backMatter.push(toPush);
  }
  console.log(backMatter);

}



//Gets list of all makers in the catalogue
function getMakers() {
  for (const i of pricedWineList) {
    //console.log(justMakerName(i[0]));
    if (!makers.includes(justMakerName(i[0]))) { makers.push(justMakerName(i[0])); }
  }
  for (var i = 0; i < makers.length; i++) {
    while(makers[i].indexOf(" ") != -1) {
      makers[i] = makers[i].substring(0, makers[i].indexOf(" ")) + "_" + makers[i].substring(makers[i].indexOf(" ") + 1);
    }
  }
  console.log(makers);
  
  loadMatter();

}



//Repositions buttons in window based on location of canvas and page printout
function repositionButtons() {
  var thisCanvas = document.getElementById('canvas_shell');
  var canvasRect = thisCanvas.getBoundingClientRect();
  var canvasX = canvasRect.left + window.scrollX;
  var canvasY = canvasRect.top + window.scrollY;

  var thisPageList = document.getElementById('page_list');
  var pageListRect = thisPageList.getBoundingClientRect();
  var pageListX = pageListRect.left + window.scrollX;
  var pageListY = pageListRect.top + window.scrollY;

  var thisPrinter = document.getElementById('printer_shell');
  var printerRect = thisPrinter.getBoundingClientRect();
  var printerX = printerRect.left + window.scrollX;
  var printerY = printerRect.top + window.scrollY;

  var authStuff = document.getElementById('authStuff');
  var confirmButton = document.getElementById('confirm_generation');

  //button1.position(width * 0.5 - button1.width * 0.5,  height * -0.5 + button1.height * -0.5, "relative");
  //console.log(document.getElementById("confirm_generation").style.visibility);
  //console.log(document.getElementById("confirm_generation").getBoundingClientRect().height);
  var visibility = confirmButton.style.visibility;
  var buttonHeight = confirmButton.getBoundingClientRect().height;
  var buttonWidth = confirmButton.getBoundingClientRect().width;
  //console.log(buttonHeight / 2);
  //console.log(confirmButton.style);
  //console.log(confirmButton.getBoundingClientRect());
  //console.log("top: " + (canvasY + canvasRect.height / 2 - buttonHeight / 2) + "px; left: " + (canvasX + canvasRect.width / 2 - buttonWidth / 2) + "px; visibility: " + visibility + "; position: absolute;");
  //confirmButton.style = "top: " + (-1 * canvasRect.top) + "px; left: " + (-1 * canvasRect.left) + "px; visibility: " + visibility + "; position: absolute;";
  //console.log(confirmButton.getBoundingClientRect());
  //confirmButton.style = "top: " + (canvasY + canvasRect.height / 2 - buttonHeight / 2 - canvasRect.top) + "px; left: " + (canvasX + canvasRect.width / 2 - buttonWidth / 2 - canvasRect.left) + "px; visibility: " + visibility + "; position: absolute;";
  confirmButton.style = "top: " + (canvasY + canvasRect.height / 2 - buttonHeight / 2) + "px; left: " + (canvasX + canvasRect.width / 2 - buttonWidth / 2) + "px; visibility: " + visibility + "; position: absolute;";
  
  if (pageListX >= pageListY) {
    authStuff.style = "top: " + (canvasRect.bottom + window.scrollY) + "px; margin-top: 10px";
  } else {
    authStuff.style = "top: " + canvasY + "px; margin-top: 0px; left: " + (canvasRect.right + window.scrollX) + "px;";
  }
  //console.log(confirmButton.style);
  //console.log(confirmButton.getBoundingClientRect());
}

//Remove button2
//Assess the dual restart functions, ideally remove one (reStart and wipeOut)
