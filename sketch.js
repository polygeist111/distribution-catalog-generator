let button1;
const productURL = "https://api.commerce7.com/v1/product?cursor="
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

let wineIndex = 0;
let drawing = false;

var pdf;

let determiningDim;

let ArchBlue = '#2B3475';
let white = '#FFFFFF';

let imgWidth = 170;
let imgHeight = 691;

let testFont;
//let pageCount = 0;

/*

Change all measurements from template by 1.02 (it's 800 by 1035, should be 816 by 1056)

*/

function preload() {
  testFont = loadFont('MoonlessSC-Regular (1).otf');
}

function setup() {
  //var canvas = createCanvas(400, 400);
  if (window.innerWidth > window.innerHeight) { determiningDim = window.innerHeight; } else { determiningDim = window.innerWidth; }
  var canvas = createCanvas(determiningDim * 0.8, determiningDim * 0.8);
  
  canvas.parent("canvas");

  button1 = createButton('Generate Sheets');
  button1.parent("canvas");
  button1.position(width * 0.5 - button1.width * 0.5,  height * -0.5 + button1.height * -0.5, "relative");
  button1.mousePressed(startPressed);
  button1.hide();

  //reStart();
  textFont(testFont);
  noStroke();
}



//Resizes canvas to fit window
function windowResized() {
  if (!drawing) {
    if (window.innerWidth > window.innerHeight) { determiningDim = window.innerHeight; } else { determiningDim = window.innerWidth; }
    resizeCanvas(determiningDim * 0.8, determiningDim * 0.8);
    button1.position(width * 0.5 - button1.width * 0.5,  height * -0.5 + button1.height * -0.5, "relative");
  }

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
  let makeName;
  let bottleName;
  if (name.substring(0,1) === "2") {
    makeName = name.substring(5);
  } else makeName = name;
  bottleName = wineName(wineIn);
  return makeName.substring(0, makeName.length - bottleName.length);

}


//Returns wine title without vintage or maker
function wineName(wine) {
  let name = makerName(wine.title);
  let makerNameSpace;
  if (wine.vendor != null) {
    makerNameSpace = wine.vendor.title.length;
  } else return name;
  return name.substring(makerNameSpace + 1);

}



//Handles start button input
function startPressed() {
  fill(white);
  canvas = resizeCanvas(816, 1056);

  drawing = true;
  pdf.beginRecord();
  button1.hide();


}



//Draws to canvas, snaps and saves all product pages
function draw() {
  background(220);
  
  if (drawing && wineIndex < wineList.length - 1) {
    pages();
    pdf.nextPage();
  } else if (drawing && wineIndex == wineList.length - 1) {
    pages();
  }
  if (wineIndex == wineList.length && wineList.length > 0) {
    pdf.save();
    noLoop();
    reStart();

  }
  if (!drawing) {
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
  fill('#ED225D');
  textSize(30);
  textAlign(CENTER);
  
  text(justMakerName(thisWine[0]), width * 0.5, height * 0.3);
  text(wineIndex, width * 0.5, height * 0.5);
  
  text(formatPrice(thisWine), width * 0.5, height * 0.7);
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

  header(thisWine);
  footer();

  console.log(wineIndex);
  wineIndex++;
}



//Starts/restarts all processes
function reStart() {
  productList = [];
  wineList = [];
  pricedWineList = [];
  allPages = [];
  allImages = [];

  wineIndex = 0;
  drawing = false;

  canvas = resizeCanvas(determiningDim * 0.8, determiningDim * 0.8);

  noLoop();
  pdf = createPDF();

  populateProducts("start");
  button1.hide();
  console.log("reStarted");

}



//Wipes all read data
function wipeOut() {
  productList = [];
  wineList = [];
  pricedWineList = [];
  allPages = [];

  wineIndex = 0;
  drawing = false;

  noLoop();

  button1.hide();
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
      while (priceIn[winDex][0] != (pricedWineList[i][0].variants[s].sku)) {
        winDex++;
      }
      //appends price to correct array slot for given wine in pricedWineList
      if (priceIn[winDex][0] == (pricedWineList[i][0].variants[s].sku)) {
        pricedWineList[i][2 + s] = priceIn[winDex][1];
        winDex++
      }
    }
  }
  loadImages();
}



//Loads all wine images into an array
function loadImages() {
  for (var i = 0; i < pricedWineList.length; i++) {
    pricedWineList[i][1] = loadImage(pricedWineList[i][0].image);
  }
  console.log(pricedWineList);
  button1.show();
  
}



/*
*
* End of Logic Section, Beginning of Renderer (multiply all dims by 1.02)
*
*/



//Generates header
function header(thisWine) {
  //header
  fill(ArchBlue);
  rect(0, 0, 816, 244);
  
  fill(white);
  textAlign(LEFT);
  //textFont("Brandon Grotesque", 24);
  textSize(24);
  let thisVintage = thisWine[0].wine.vintage;
  if (thisVintage == null) { thisVintage = ""; }
  text(thisVintage, 62, 84);
  text(makerName(thisWine[0].title), 62, 135);
  textSize(16);
  textStyle(ITALIC);
  text(thisWine[0].subTitle, 62, 175);

  textStyle(NORMAL);

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
  image(img, 96 + (imgWidth - img.width), 280);


  
}



//Generates footer
function footer() {
  let pageNum = pdf.elements.length / 2 + 1;
  console.log("Page num: " + pageNum);

  //divider line
  fill(ArchBlue);
  stroke(ArchBlue);
  line(60, 1000, 756, 1000)
  noStroke();

  //footer text
  textSize(8);
  textAlign(RIGHT);
  text(pageNum, 756, 1016);
  textAlign(LEFT);
  text("Archetyp Catalog " + year(), 60, 1016);

}