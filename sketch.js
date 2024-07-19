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

  //index within pricedWineList
let wineIndex = 0;
//let drawing = false; //replace with state enum

  //container for saved pages
var pdf;

var yesOverlays = false; //tied to footer graphic, also includes maker page top right
var yesProducts = false;
var yesInserts = false;
var yesPrices = false;

var printedPages = 0;

var vectorsOnly = false; //likely unnecessary, check back after fixing mode selector

let determiningDim;

let ArchBlue = '#2B3475';
let C7Gray = "#222a30";
let white = '#FFFFFF';

//Bottle shot parameters?
let imgWidth = 170;
let imgHeight = 691;

//variants of Brandon Grotesque font
let testFont;
let regFont;
let boldFont;
let italFont;

let bodyMargin = 20;
  //final # of initial pages pre-checkboxing
let definitiveLength = 0;
  //which page of the print the draw loop is on
let printIndex = 0;
let lastMaker = "";
  //index within makerMatter
let makerIndex = 0;
  //index within backMatter
let backIndex = 0;
//let allDone = false;  //replace with state enum
//let printReady = false;  //replace with state enum

  //whether final list of included print pages is ready
//let confirmed = false;  //replace with state enum
  //contains an entry per print page, [bool included, int whichType, specialInd, lastBlue (default -1), checkboxDiv (emplaced later)]
let pageIncluded = [];
  //tells draw loop whether to actively display previews or not
//let previewing = false;  //replace with state enum
  //current page # (1 indexed) of preview
let viewingPageNum = 1;
  //index of the last page to be printed
let lastToPrint = -1;

//let pageCount = 0;

/*

Change all measurements from template by 1.02 (it's 800 by 1035, should be 816 by 1056)

*/
  //reference to modeSelect html form
let modeSelector;

  //reference to svg item that is canvas
let vectorCanvas;
  //string of last injected svg
let lastInsert = "";
  //default state of canvas svg inner html
let baseState = -1;
  //white background svg code
let whiteBG = "<g transform=\"scale(1,1) scale(1,1)\"><rect fill=\"rgb(255,255,255)\" stroke=\"none\" x=\"0\" y=\"0\" width=\"816\" height=\"1056\" fill-opacity=\"1\"></rect></g>";
  //c7 gray background svg code
let C7GrayBG = "<g transform=\"scale(1,1) scale(1,1)\"><rect fill=\"rgb(34,42,48)\" stroke=\"none\" x=\"0\" y=\"0\" width=\"816\" height=\"1056\" fill-opacity=\"1\"></rect></g>";

//enum for draw states, to be implemented to replace AllDone, Confirmed, Previewing, and related bools
const States = {
  SETUP: 0,
  COMPILING: 1,
  PREVIEWING: 2,
  ASSEMBLING: 3
};
var state = 0;

let col1;
let col2;
let authStuff;
let pageList;

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
  //edit for mobile friendly version
  if (determiningDim < 600) {
    determiningDim = 750;
  }
  var canvas = createCanvas(determiningDim * 0.8, determiningDim * 0.8, SVG);
  //document.getElementById('canvas_shell').style = "width: " + (document.getElementById("defaultCanvas").getBoundingClientRect().width + 10) + "px; height: " + (document.getElementById("defaultCanvas").getBoundingClientRect().height + 10) + "px; float: left;";
  document.getElementById("defaultCanvas").style.display = "inline-block";
  document.getElementById('canvas_shell').appendChild(document.getElementById("defaultCanvas"));
  vectorCanvas = document.getElementsByTagName('svg')[0];

  //document.getElementById("generation_settings").style.display = "none";

  //document.getElementById('print_button').style.display = "none";
  //document.getElementById('page_list').style.display = "none";

  //document.getElementById('preview_controls').style.display = "none";
  textFont(regFont);
  noStroke();
  state = States.SETUP;
  col1 = document.getElementById("col1");
  col2 = document.getElementById("col2");
  authStuff = document.getElementById("authStuff");
  pageList = document.getElementById("page_list");

  windowResized();
}



//Resizes canvas to fit window
function windowResized() {
  /*
  if (state == States.SETUP) {
    if (window.innerWidth > window.innerHeight) {
      determiningDim = window.innerHeight;
    } else {
      determiningDim = window.innerWidth; 
    }
    if (determiningDim < 600) {
      determiningDim = 600;
    }
    //console.log(window.innerWidth + "x" + window.innerHeight + determiningDim);
    resizeCanvas(determiningDim * 0.8, determiningDim * 0.8);
    //button1.position(width * 0.5 - button1.width * 0.5,  height * -0.5 + button1.height * -0.5, "relative");
    //button2.position(width * 0.5 - button2.width * 0.5,  height * -0.5 + button2.height * -0.5, "relative");
    let canvasRect = document.getElementById("defaultCanvas").getBoundingClientRect();
    let shellStyle = document.getElementById('canvas_shell').style;
    let holderStyle = document.getElementById('holder').style;

    //shellStyle = "width: " + (document.getElementById("defaultCanvas").getBoundingClientRect().width + 1) + "px; height: " + (document.getElementById("defaultCanvas").getBoundingClientRect().height + 1) + "px; border: 1px solid white; float: left;";
    shellStyle.width = (canvasRect.width + 1) + "px";
    shellStyle.Height = (canvasRect.height + 1) + "px";
    shellStyle.border = "1px solid white;";
    shellStyle.float = "left"
    holderStyle.width = (parseFloat((shellStyle.width).substring(0, (shellStyle.width).length - 2)) + 10) + "px";
    holderStyle.minHeight = shellStyle.height;
    //console.log((parseFloat((shellStyle.width).substring(0, (shellStyle.width).length - 2)) + 10));
  }

  windowResized();
  */
  //console.log("RESIZE called")
  if (window.innerWidth >= 1500) {
    //console.log(col1.childNodes);
    console.log("SEARCH " + col2.querySelector("#authStuff") + " " + col1.querySelector("#page_list") + " " + pageList.style.display);
    if (col2.querySelector("#authStuff") != null && col1.querySelector("#page_list") != null && state == States.PREVIEWING) {
      col2.removeChild(authStuff);
      col1.appendChild(authStuff);
      col1.removeChild(pageList);
      col2.appendChild(pageList);
    }
  } else {
    if (col1.querySelector("#authStuff") != null && col2.querySelector("#page_list") != null && state == States.PREVIEWING) {
      col1.removeChild(authStuff);
      col2.appendChild(authStuff);
      col2.removeChild(pageList);
      col1.appendChild(pageList);
    }
  }
  //console.log(col1.childNodes);
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

  windowResized();
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
  //document.getElementById('canvas_shell').style = "width: " + (document.getElementById("defaultCanvas").getBoundingClientRect().width + 1) + "px; height: " + (document.getElementById("defaultCanvas").getBoundingClientRect().height + 1) + "px; border: 1px solid white; float: left;";

  state = States.COMPILING;
  pdf.beginRecord();
  //button1.hide();
  document.getElementById("generation_settings").style.display = "none";

  windowResized();
}


























//Draws to canvas, snaps and saves all product pages
//The checks for vectorsOnly don't render anything but insert matter overlay if they fail
function draw() {
  
  if(baseState == -1) {
    baseState = vectorCanvas.innerHTML;
    console.log(baseState.substring(0, 53));
  } else {
    vectorCanvas.innerHTML = baseState;
  }
  clear();/*
  let str = vectorCanvas.innerHTML;
  if (lastInsert != "") {
    //console.log("BASE: " + str);
    vectorCanvas.innerHTML = str.substring(lastInsert.length);
  } 
  clear();*/
  //console.log(document.getElementById('generation_settings').style.visibility);
  //updates user input settings
  if (document.getElementById('generation_settings').style.display != "none" && document.getElementById('generation_settings').style.visibility != "hidden") {
    //console.log("SEARCH " + document.getElementById('generation_settings').style.display + " | " + document.getElementById('generation_settings').style.visibility);
    //readGenerationSettings();
  }

  //resizes previewControl div to match sketch container
  if (document.getElementById('preview_controls').style.display != "none") {
    canvasObject = document.getElementById('canvas_shell').getBoundingClientRect();
    //document.getElementById('preview_controls').style = "width: " + (canvasObject.width - 2) + "px; display: inline-block; border: 1px solid white; left: " + 0 + "px; top " + (canvasObject.bottom) + "px;";
    //document.getElementById('preview_controls').style = "width: " + (canvasObject.width - 2) + "px; display: inline-block; border: 1px solid white; line-height: normal;";
    windowResized();
  }
  //handles pageList and authStuff format switching based on window width
  if(document.getElementById('page_list').style.display != "none") {
    canvasObject = document.getElementById('canvas_shell').getBoundingClientRect();
    thisPageList = document.getElementById('page_list');
    //console.log(window.innerWidth + " " + (canvasObject.width + thisPageList.getBoundingClientRect().width + 20));
    if (window.innerWidth < canvasObject.width + thisPageList.getBoundingClientRect().width + 20) {
      //thisPageList.style.left = canvasObject.left;
      //thisPageList.style.top = document.getElementById('holder').getBoundingClientRect().bottom;
      //document.getElementById('page_list').style = "border: 1px solid white; display: inline-block; left: " + canvasObject.left + "px; top: " + (document.getElementById('preview_controls').getBoundingClientRect().bottom + window.scrollY + 10)+ "px;";
      //document.getElementById('authStuff').style = "display: inline-block; left: " + (canvasObject.right) + "px; top: " + (canvasObject.top - 8 + window.scrollY) + "px;";

    } else {
      //thisPageList.style.left = canvasObject.right;
      //thisPageList.style.top = canvasObject.top;
      //document.getElementById('page_list').style = "border: 1px solid white; display: inline-block; left: " + (canvasObject.right + 10) + "px; top: " + (canvasObject.top + window.scrollY) + "px;";
      //document.getElementById('authStuff').style = "left: " + (canvasObject.left - 10) + "px; top: " + (document.getElementById('preview_controls').getBoundingClientRect().bottom + window.scrollY)+ "px;";
    }

  }
  //console.log(state);
  if (state == States.SETUP) { 
    readGenerationSettings();

    //background(C7Gray);
  } else { 
    //background(white);
    //clear(); 

    //yesOverlays = true; //tied to footer graphic, also includes maker page top right

    //yesProducts = true;

    //yesInserts = true;

    //yesPrices = true;
  }

  
  //compiles all initial pages
  if (state == States.COMPILING) {
    /*if (printIndex >= 4) {
      wineIndex = pricedWineList.length;
      backIndex = backMatter.length - 1;
    } //DEBUGGING*/
    //draws all but last page
    //if (drawing && printIndex < definitiveLength - 1 && !allDone) {
      let whichType = -1;
      //front matter
      if (printIndex < frontMatter.length) {
        //drawFrontMatter();
        whichType = 1;
      
        //maker matter
      } else if (printIndex == 2) { 
        //noLoop(); 
      } /*comment out here */else if (pricedWineList[wineIndex] != undefined && lastMaker != undefined && justMakerName(pricedWineList[wineIndex][0]) != lastMaker) {
        //drawMakerMatter();
        whichType = 2;
        
        //back matter
      } else if (wineIndex == pricedWineList.length && backIndex < backMatter.length - 1) {
        //drawGeneralBackMatter();
        whichType = 3;
        
        //tech sheets
      } else if (wineIndex < pricedWineList.length) {
        //drawTechSheets();
        whichType = 4;
        
        //last back matter
      } else if (wineIndex == pricedWineList.length && backIndex == backMatter.length - 1) {
        whichType = 5;
      }
      
      compilePage(whichType); 
      if (whichType != 5) {
        printIndex++;
      }
  }
    /*
    //Closing save (after last page)
  if (allDone) {
    pdf.save();
    noLoop();
    allDone = false
    printReady = false;
    reStart();

  }*/

  if (state == States.PREVIEWING) {
    previewPage(viewingPageNum, pageIncluded[viewingPageNum - 1][1], pageIncluded[viewingPageNum - 1][2]);
  }

  if (state == States.ASSEMBLING) {
    if (lastToPrint == -1) {
      reStart();
    }
    //skips to next page to be printed
    while (!pageIncluded[viewingPageNum - 1][0] && viewingPageNum <= lastToPrint) {
      viewingPageNum++;
      if (viewingPageNum >= (lastToPrint + 1)) {
        break;
      }
      console.log(viewingPageNum + " " + (lastToPrint + 1));
    } 
    if (viewingPageNum < (lastToPrint + 1)) {
      printedPages++;
      previewPage(viewingPageNum, pageIncluded[viewingPageNum - 1][1], pageIncluded[viewingPageNum - 1][2]);
      viewingPageNum++;
      pdf.nextPage();
      //pdf is done
    } else {
      printedPages++;
      previewPage(viewingPageNum, pageIncluded[viewingPageNum - 1][1], pageIncluded[viewingPageNum - 1][2]);
      console.log("exit draw to print");
      /*
      for(var i = 0; i < 10000; i++) {
        console.log();
      }*/
      //printPDF();
      setTimeout(function() {
        printPDF();
      }, 500);
      noLoop();
      /*
      sleep(501);*/
    }

  }

  if (state == States.SETUP) {
    //document.getElementById('canvas_shell').style = "width: " + (document.getElementById("defaultCanvas").getBoundingClientRect().width + 1) + "px; height: " + (document.getElementById("defaultCanvas").getBoundingClientRect().height + 1) + "px; border: 1px solid white; float: left;";

    fill('#ED225D');
    textSize(30);
    textAlign(CENTER);
    if (document.getElementById('authorize_button').innerText == "Refresh") { 
      push();
        noStroke();
        textFont(regFont);
        text("Press the button to continue", width * 0.5, height * 0.4);
      pop();
    } else {
      text("Please sign in to Google to continue", width * 0.5, height * 0.4);
    }
  }
}












function compilePage(whichType) {
  if (state == States.COMPILING) {
    var specialInd = -1;
    if (whichType == 4) {
      console.log("winDex " + wineIndex);
      specialInd = wineIndex;
    } else if (whichType == 2) {
      specialInd = makerIndex;
    } else if (whichType == 3 || whichType == 5) {
      specialInd = backIndex;
    }
    pageIncluded.push([true, whichType, specialInd, -1]);
  }
  //CODE: this section is likely useless
  if (yesInserts) {
    console.log("adding insert");
  }
  if (yesProducts) {
    console.log("adding product");
  }
  if (yesOverlays) {
    console.log("adding overlay");
  }
  if (yesPrices) {
    console.log("adding this wine price");
  }

  //Writes list of generated pages
  switch (whichType) {
    case 1:
      let str1 = drawFrontMatter();
      makeCheckbox("&nbsp;" + str1 + "Page " + (printIndex + 1) + ": " + "InsertedCopy\\FrontMatter_" + (printIndex + 1) + ".svg", 1);
      break;

    case 2:
      let str2 = drawMakerMatter();
      makeCheckbox("&nbsp;" + str2 + "Page " + (printIndex + 1) + ": " + "InsertedCopy\\MakerMatter_" + makers[makerIndex - 1] + ".svg", 2);
      break;

    case 3:
      let str3 = drawGeneralBackMatter();
      makeCheckbox("&nbsp;" + str3 + "Page " + (printIndex + 1) + ": " + "InsertedCopy\\BackMatter_" + backIndex + ".svg", 3);
      break;
      
    case 4:
      let str4 = drawTechSheets();
      makeCheckbox("&nbsp;" + str4 + "Page " + (printIndex + 1) + ": " + pricedWineList[wineIndex - 1][0].title, 4);
      break;

    case 5:
      let str5 = drawLastBackMatter();
      makeCheckbox("&nbsp;" + str5 + "Page " + (printIndex + 1) + ": " + "InsertedCopy\\BackMatter_" + backIndex + ".svg", 5);
      //reveal preview controls
      document.getElementById('preview_controls').style.display = "flex";
      console.log(pageIncluded);
      //state = States.PREVIEWING
      document.getElementById('pageNumIn').max = printIndex + 1;
      console.log(makerMatter);

      console.log("printing preview controls");

      /*
      let div = document.createElement('div');
      div.id = "testScript";
      let script = document.createElement('script');
      div.appendChild(script);
      pageList.appendChild(div);*/
      break;

    default:
      break;

  }
  /*
  console.log("writing to screen");
  //saves to pdf if in confirmation loop
  if (state == States.ASSEMBLING && pageIncluded[printedPages][0]) {
    if (!yesOverlays && yesProducts) {
      if (whichType == 4) {
        pdf.nextPage();
        printedPages++;
        console.log("saving product page to pdf");
      } else {
        whichType = -1;
      }
    } else {
      if (whichType != 5 ) {
        pdf.nextPage();
        console.log("saving page to pdf");
      } else {
        console.log("final page to pdf");
      }
      printedPages++;
    }
  }*/
  //console.log("list: " + document.getElementById('page_list').innerHTML);
}



function previewPage(thisPageNum, whichType, specialInd) {
  //console.log("previewing page " + thisPageNum + " of type " + whichType + " and specialInd " + specialInd);
  printIndex = thisPageNum - 1;
  if (whichType == 4) {
    wineIndex = specialInd;
  } else if (whichType == 2) {
    makerIndex = specialInd;
    wineIndex = pageIncluded[printIndex + 1][2];
  } else if (whichType == 3 || whichType == 5) {
    backIndex = specialInd;
  }
  switch (whichType) {
    case 1:
      drawFrontMatter();
      break;

    case 2:
      drawMakerMatter();
      break;

    case 3:
      drawGeneralBackMatter();
      break;
      
    case 4:
      drawTechSheets();
      break;

    case 5:
      drawLastBackMatter();
      break;

    default:
      break;

  }
  printIndex = 0;
  if (whichType == 4) {
    wineIndex = 0;
  } else if (whichType == 2) {
    makerIndex = 0;
    wineIndex = 0;
  } else if (whichType == 3 || whichType == 5) {
    backIndex = 0;
  }
}


function drawFrontMatter() {
  if (printIndex != 0) {
    footer(0, 0);
  }
  //let exists = await urlExists(path);
  //fix footers
  if (frontMatter[printIndex].width < 800) {
    background("white");
    console.log("ERROR: InsertedCopy/FrontMatter_" + (printIndex + 1) + ".svg not found");
    push();
      textSize(40);
      fill("red");
      stroke("red");
      textAlign(CENTER, CENTER);
      text("NO IMAGE FOUND", width / 2, height / 2);
    pop();
    console.log("front page " + printIndex);
    return "(NOT FOUND) ";
  } else {
    var path = "InsertedCopy/FrontMatter_" + (printIndex + 1) + ".svg";
    var temp = vectorCanvas.innerHTML;
    var tempBegin = temp.substring(0, 53);
    var tempEnd = temp.substring(53);
    lastInsert = "<image x=\"0\" y=\"0\" width=\"816\" height=\"1056\" href=\"" + path + "\"></image>";
    vectorCanvas.innerHTML = tempBegin + whiteBG + lastInsert + tempEnd;
    console.log("front page " + printIndex);
    return "";
  }
  //let img;
  //if (!vectorsOnly) {
    //img = frontMatter[printIndex];
    //img = resizeToPrint(img);
    //image(img, 0, 0);
  //}
}



function drawMakerMatter() {
  footer(0, 392);
  let img;
  lastMaker = justMakerName(pricedWineList[wineIndex][0]);
  img = makerMatter[makerIndex];
  console.log(img.width);
  if (img.width < 10) {
    //console.log("no maker matter found for " + lastMaker);
    console.log("ERROR: InsertedCopy/MakerMatter_" + makers[makerIndex - 1] + ".svg not found");
    push();
      textSize(40);
      fill("red");
      stroke("red");
      textAlign(CENTER, CENTER);
      text("NO IMAGE FOUND", width / 2, height / 2);
    pop();
    makerIndex++;
    console.log("maker page " + printIndex);
    return "(NOT FOUND) ";
  } else {
    
    //console.log(img.width + " " + img.height);
    //var imgW = img.width;
    var imgH = img.height;
    //var img2 = img.get(img.width * 0.75, 0, img.width * 0.25, img.height);
    //console.log(lastMaker + " " + imgW + " " + imgH);
    img = resizeToPrint(img);
    //image(img, 0, 0);
    makerIndex++;
    var blueIn = pageIncluded[printIndex][3];
    
    //fix top right wine listing
    makerWineList(img, blueIn, imgH);
    
    
    let path = "InsertedCopy/MakerMatter_" + makers[makerIndex - 1] + ".svg";
    var temp = vectorCanvas.innerHTML;
    var tempBegin = temp.substring(0, 53);
    var tempEnd = temp.substring(53);
    lastInsert = "<image x=\"0\" y=\"0\" width=\"816\" height=\"1056\" href=\"" + path + "\"></image>";
    vectorCanvas.innerHTML = tempBegin + whiteBG + lastInsert + tempEnd;
    console.log("maker page " + printIndex);
    return "";
  }
  //makerWineList(img, imgW, imgH);

  //fix footers

  //pdf.nextPage();
    
}



function drawGeneralBackMatter() {
  //let img;
  //img = backMatter[backIndex];
  //img = resizeToPrint(img);
  //image(img, 0, 0);
  
  //fix footers
  if (backIndex < 2) {
    footer(243, 0);
  } else {
    footer(0, 0);
  }
  
  //pdf.nextPage();
  
  if (backMatter[backIndex].width < 800) {
    background("white");
    console.log("ERROR: InsertedCopy/BackMatter_" + (backIndex + 1) + ".svg not found");
    push();
      textSize(40);
      fill("red");
      stroke("red");
      textAlign(CENTER, CENTER);
      text("NO IMAGE FOUND", width / 2, height / 2);
    pop();
    backIndex++;
    console.log("back page " + printIndex);
    return "(NOT FOUND) ";
  } else {
    let path  ="InsertedCopy/BackMatter_" + (backIndex + 1) + ".svg";
    var temp = vectorCanvas.innerHTML;
    var tempBegin = temp.substring(0, 53);
    var tempEnd = temp.substring(53);
    lastInsert = "<image x=\"0\" y=\"0\" width=\"816\" height=\"1056\" href=\"" + path + "\"></image>";
    vectorCanvas.innerHTML = tempBegin + whiteBG + lastInsert + tempEnd;
    backIndex++;
    console.log("back page " + printIndex);
    return "";
  }
  
  

}



function drawTechSheets() {
  background("white");
  pages();
  footer(0, 0);
  console.log(wineIndex + " " + pricedWineList[wineIndex])

  //wineIndex--;
  //printIndex--;
  //pdf.nextPage();
  console.log("tech sheet page " + printIndex);
  //triggers end of cycle if no inserts are printed
  if ((!yesOverlays && yesProducts) && wineIndex == pricedWineList.length - 1 && state != States.PREVIEWING) {
    //noLoop();
    state = States.PREVIEWING;
    //button2.show();
    document.getElementById('print_button').style.display = 'block'
    document.getElementById('page_list').style.display = "inline-block";
    windowResized();
  }
  return "";
}



function drawLastBackMatter() {
  console.log("drawing last page");
  //let img;
  //img = backMatter[backIndex];
  //img = resizeToPrint(img);
  //image(img, 0, 0);

  //fix footers
  if (backIndex < 2) {
    footer(243, 0);
  } else {
    footer(0, 0);
  }
  var found = true;
  if (backMatter[backIndex].width < 800) {
    found = false;
    background("white");
    console.log("ERROR: InsertedCopy/BackMatter_" + (backIndex + 1) + ".svg not found");
    push();
      textSize(40);
      fill("red");
      stroke("red");
      textAlign(CENTER, CENTER);
      text("NO IMAGE FOUND", width / 2, height / 2);
    pop();
  } else {
    let path  ="InsertedCopy/BackMatter_" + (backIndex + 1) + ".svg";
    var temp = vectorCanvas.innerHTML;
    var tempBegin = temp.substring(0, 53);
    var tempEnd = temp.substring(53);
    lastInsert = "<image x=\"0\" y=\"0\" width=\"816\" height=\"1056\" href=\"" + path + "\"></image>";
    vectorCanvas.innerHTML = tempBegin + whiteBG + lastInsert + tempEnd;
  }

  windowResized();
  backIndex++;

  
  if (state == States.COMPILING) { //possible unnecessary if statement
    //noLoop();
    state = States.PREVIEWING;
    //button2.show();
    document.getElementById('print_button').style.display = 'block'
    document.getElementById('page_list').style.display = "inline-block";
  }
    
  
  //
  //
  //Give option to preview any page
  //add checkboxing system
  //or confirm selected pages
  //
  //
  windowResized();
  if (!found) {
    return "(NOT FOUND) ";
  }
  return "";
}


















//converts price(s) into formatted string with dividers as needed
function formatPrice(thisWine) {
  let price = "";
  for (var i = 2; i < thisWine.length; i++) {
    //in case of multiple variant SKUs, e.g. 2021 Matan
    if (thisWine.length > 3) {
      if (checkVariantAvailability(thisWine, i - 2)) {
        if (thisWine.length < i || thisWine[i] == null) {
          price += " | Not Found"; 
        } else {
          price += " | " + thisWine[i];
        }
      }
    //in base case of only one SKU
    } else {
      if (thisWine.length < i || thisWine[i] == null) {
        price += " | Not Found"; 
      } else {
        price += " | " + thisWine[i];
      }
    }
    //console.log("SEARCH  " + thisWine);
  }
  price = price.substring(3);
  return price;

}



//checks whether variant sku has available inventory
function checkVariantAvailability(thisWine, variantNum) {
  //console.log("SEARCH " + thisWine[0].variants[variantNum].inventory[0].availableForSaleCount);
  let variantInventory = thisWine[0].variants[variantNum].inventory[0].availableForSaleCount;
  if (variantInventory > 0) {
    return true;
  }
  return false;
}



//Iterates through wineList to create product pages (requires Nicole's designs) - consider special case for multiple variants
function pages() {
  //background("white");
  var thisWine = pricedWineList[wineIndex];
  fill('#ED225D');
  textSize(30);
  textAlign(CENTER);
  
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
  
  if (yesPrices) {
    priceBox(thisWine);
  }

  writeBody(thisWine[0]);

  //footer(0, 0);

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
  allInsertOverlays = [];

  wineIndex = 0;
  state = States.SETUP;

  //if (window.innerWidth > window.innerHeight) { determiningDim = window.innerHeight; } else { determiningDim = window.innerWidth; }
  resizeCanvas(determiningDim * 0.8, determiningDim * 0.8);
  //document.getElementById('canvas_shell').style = "width: " + (document.getElementById("defaultCanvas").getBoundingClientRect().width + (-1)) + "px; height: " + (document.getElementById("defaultCanvas").getBoundingClientRect().height + (-1)) + "px; border: 1px solid white; float: left;";


  noLoop();
  pdf = createPDF();

  yesOverlays = false;
  yesProducts = false;
  yesInserts = false;
  yesPrices = false;

  document.getElementById('Full Catalog').checked = "true";
  document.getElementById('priceIncluded').checked = "true";
  document.getElementById('priceIncluded').disabled = "false";
  
  printedPages = 0;

  vectorsOnly = false;

  populateProducts("start");
  document.getElementById("generation_settings").style.display = "none";
  document.getElementById('printer_button').style.display = "none";
  document.getElementById('page_list').innerHTML = "";
  document.getElementById('page_list').style.display = "none";
  
  definitiveLength = 0;
  printIndex = 0;
  lastMaker = "";
  makerIndex = 0;
  backIndex = 0;

  lastToPrint = 0;

  console.log("reStarted");

  windowResized();
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
      console.log(priceIn[winDex][0] + " " + (pricedWineList[i][0].variants[s].sku));
      while (priceIn[winDex][0] != (pricedWineList[i][0].variants[s].sku)) {
        console.log("entered loop");
        winDex++;
      }
      //appends price to correct array slot for given wine in pricedWineList
      if (priceIn[winDex][0] == (pricedWineList[i][0].variants[s].sku)) {
        console.log("Added " + priceIn[winDex][0] + " " + pricedWineList[i][0].variants[s].sku);
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



//sets off assembly loop
function preparePDF() {
  state = States.ASSEMBLING;
  var previewControls = document.getElementById('preview_controls');
  previewControls.style.display = "none";
  document.getElementById('page_list').style.display = "none";
  /*
  while(previewControls.firstChild) {
    previewControls.removeChild(previewControls.firstChild);
  }*/
  viewingPageNum = 1;

  var temp = definitiveLength - 1;
  while (!pageIncluded[temp][0]) {
    temp--;
  }
  lastToPrint = temp;
  console.log("Last to print: " + lastToPrint);
}



//Confirms pdf print, called from html
function printPDF() { 
  if (state == States.ASSEMBLING) {
    console.log("printing");
    console.log("Full PDF Contents: ");
    console.log(pageIncluded);
    console.log(pdf);
    //if (!yesOverlays && yesProducts) {}
    pdf.endRecord();
    pdf.save();
    
    noLoop();
    reStart();
  } else {
    console.log("Repeated call to printPDF");
  }
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

  setTimeout(function() {
     document.getElementById("generation_settings").style.display = "flex";
    
  }, 2000);
  
}



//Generates header
function header(thisWine) {
  textStyle(NORMAL);
  //header
  fill(ArchBlue);
  rect(0, 0, 816, 244);
  
  fill('#FFFFFF');
  noStroke();
  
  textAlign(LEFT);
  textFont(boldFont, 28);
  let thisVintage = thisWine[0].wine.vintage;
  if (thisVintage == null) { thisVintage = ""; }
  text(thisVintage, 62, 84);
  text(makerName(thisWine[0].title), 62, 135);
  textFont(italFont, 20);
  text(thisWine[0].subTitle, 62, 175);
  textFont(regFont);
  console.log("writing header text");
  
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
  image(img, 210 - img.width / 2, 280);

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
  
  textSize(14.5);
  textFont(regFont);
  fill(ArchBlue);
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
    }
    totalHeight += thisHeight;
    
    //assigns key, value, and spacer
    textFont(boldFont);
    key = thisContent[i].substring(0, thisContent[i].indexOf(":") + 1);
    spacer = "";
    spacerConstant = Math.round(textWidth(thisContent[i].substring(0, thisContent[i].indexOf(":") + 1) + 1) / spaceSize);
    for (var k = 0; k < spacerConstant; k++) {
      spacer += " ";
    }
    value = spacer + thisContent[i].substring(thisContent[i].indexOf(":") + 1);

    //Prints descriptive text
    textFont(boldFont);
    //text(thisContent[i][0], left, totalHeight, maxWidth, maxHeight);
    text(key, left, totalHeight, maxWidth, maxHeight);
    
    textFont(regFont);
    //text(thisContent[i][1], left, totalHeight, maxWidth, maxHeight);
    lastBox = text(value, left, totalHeight, maxWidth, maxHeight);
  }

}



//Generates footer
function footer(leftSide, rightSide) {
  //console.log("Page num: " + printIndex);
  if (leftSide == 0) { leftSide = 60; }
  if (rightSide == 0) { rightSide = 756; }

  //white box (clear potential prior footers)
  fill("white");
  noStroke();
  rect(leftSide - 5, 990, rightSide - leftSide + 25, 1025);

  //divider line
  fill(ArchBlue);
  stroke(ArchBlue);
  line(leftSide, 1000, rightSide, 1000);

  //footer text
  noStroke();
  textFont(regFont, 12);
  textAlign(RIGHT, TOP);
  if (state == States.COMPILING || state == States.PREVIEWING) {
    text(printIndex + 1, rightSide, 1005);
    console.log("preview page # " + (printIndex + 1));
  } else if (state == States.ASSEMBLING) {
    text(printedPages, rightSide, 1005);    
    console.log("Assembled page # " + printedPages);
  }
  textAlign(LEFT, TOP);
  text("Archetyp Catalog " + year(), leftSide, 1005);
  //clear();
  
}



//Generates wine list on top right of maker pages
function makerWineList(thisImg, blueIn, thisHeight) {
  //imageMode(CORNER);
  let thisContent = [];
  //identifies box area
  var foundEnd = false;
  var lastBlue = 0;
  if (blueIn == -1) {
    while(!foundEnd && lastBlue < height) {
      var color = thisImg.get(815, lastBlue);
      console.log(color[0] + " " + color[1] + " " + color[2]);
      if (color[0] != 42 || color[1] != 52 || color[2] != 117) {
        foundEnd = true;
      }
      fill(color);
      rect(600, lastBlue, 7, 1); 
      lastBlue++;
    }
    lastBlue--;
    //CODE write lastBlue into pageIncluded
  } else {
    lastBlue = blueIn;
  }
  pageIncluded[printIndex][3] = lastBlue;
  console.log("lastBlue = " + lastBlue);

  //fills box
  fill(ArchBlue);
  rectMode(CORNER);
  rect(426, 0, 390, lastBlue);

  //fills list of current wines
  
  //adds text
  textAlign(LEFT, TOP);
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
      textFont(boldFont, boldFontSize);
      value = "Wines"
    } else {
      thisHeight = 0;
      textFont(regFont, regFontSize);
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
      textFont(boldFont, boldFontSize);
      value = "Wines"
    } else {
      thisHeight = 0;
      textFont(regFont, regFontSize);
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
    lastBox = text(value, left, totalHeight - thisHeight, maxWidth, maxHeight);
  }
}



//Generates price box
function priceBox(thisWine) {
  //price box
  strokeWeight(2);
  stroke(ArchBlue);
  noFill();
  push();
    strokeWeight(2);
    stroke(ArchBlue);
    noFill();
    rect(420, 916, 336, 52);
  pop();
  

  //priceText
  
  push();
    noStroke();
    fill(ArchBlue);
    textFont(boldFont, 22);
    textAlign(CENTER, CENTER);
    text(formatPrice(thisWine), 588, 942);
  pop();
  
  console.log("This wine price: " + formatPrice(thisWine));
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
    var toPush = (loadImage('InsertedCopy\\FrontMatter_' + (i + 1) + '.svg'));
    frontMatter.push(toPush);
  }
  console.log(frontMatter);
  //console.log
  //loads mid matter (maker profiles)
  for (var i = 0; i < makers.length; i++) {
    console.log(makers[i]);
    var toPush = loadImage('InsertedCopy\\MakerMatter_' + makers[i] + '.svg', makerMatterSucceeded, makerMatterFailed);
    makerMatter.push(toPush);
    /*
    if(toPush.width > 10) {
    } else {
      makerMatter.push(null);
    }*/
  }
  console.log(makerMatter);
  
  //loads back matter
  for (var i = 0; i < 8; i++) {
    var toPush = (loadImage('InsertedCopy\\BackMatter_' + (i + 1) + '.svg'));
    backMatter.push(toPush);
  }
  console.log(backMatter);
  
}



//handles maker matter load successes
function makerMatterSucceeded(img) {
  console.log("Maker sheet found");
  //makerMatter.push(img);

}



//handles maker matter load failures 
function makerMatterFailed() {
  console.log("Maker sheet not found");
  //makerMatter.push(null);
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
  
  loadMatter();

}



//reads generator settings and updates global vars
function readGenerationSettings() {
  var modes = document.getElementById('modeSelect'); 
  var priceSelector = document.getElementById('priceIncluded');
  var selectedMode;
  //console.log(document.getElementById('modeSelect'));

  for (var i = 0; i < modes.length - 1; i++) {
    if (modes[i].checked) {
      selectedMode = modes[i].value;
    }
  }
  console.log("selected mode is " + selectedMode);
  
  //handles price checkbox availability
  if (selectedMode != "Overlays") {
    priceSelector.disabled = false;
  } else {
    priceSelector.disabled = true;
  }

  //handles mode logic
  switch (selectedMode) {
    case "Full Catalog":
      yesOverlays = true;
      yesInserts = true;
      yesProducts = true;
      yesPrices = false;
      //console.log("mode is full");
      break;
    case "Print-Ready Kit":
      yesOverlays = true;
      yesInserts = false;
      yesProducts = true;
      //console.log("mode is kit");
      break;
    case "Tech Sheets":
      yesOverlays = false;
      yesInserts = false;
      yesProducts = true;
      yesPrices = false; 
      //console.log("mode is sheets");
      break;
    case "Overlays":
      yesOverlays = true;
      yesInserts = false;
      yesProducts = false;
      yesPrices = false;
      //console.log("mode is overlay");
      break;
    default:
      reStart();
      return;
  }

  //handles price selection, auto-false if mode is overlay
  //console.log(modes[modes.length - 1].value);
  if (modes[modes.length - 1].value == "yes") {
    yesPrices = true;
  } else {
    yesPrices = false;
  }
  if (priceSelector.disabled == true) {
    yesPrices = false;  
  }


}



/*
*
* PREVIEW INPUT HANDLING
*
*/



//moves preview screen back a page
function viewPreviousPage() {
  console.log("viewing previous page");
  var pageIn = document.querySelector("#pageNumIn");
  viewingPageNum--; 
  if (viewingPageNum < 1) {
    viewingPageNum = definitiveLength;
  }
  pageIn.value = viewingPageNum;
}



//moves preview screen forward a page
function viewNextPage() {
  console.log("viewing next page");
  var pageIn = document.querySelector("#pageNumIn");
  viewingPageNum++; 
  if (viewingPageNum > definitiveLength) {
    viewingPageNum = 1;
  }
  pageIn.value = viewingPageNum;
}



//jumps preview screen to input page
function jumpToPageView() {
  var pageIn = document.querySelector("#pageNumIn");
  var input = pageIn.value;
  if (input > definitiveLength) {
    input = definitiveLength;
  }
  if (input < 1) {
    input = 1;
  }
  pageIn.value = input;
  viewingPageNum = input
  //console.log("jumping to page " + viewingPageNum + " via input " + input);

}



/*
*
* CHECKBOX GENERATION & INPUT HANDLING
*
*/



//takes pageList text as input and creates new line with checkbox and text
  //creates Select All box if no checkboxes exist yet
  //creates Select Section box if entering new section
function makeCheckbox(label, whichType) {
  //var pageList = document.getElementById("page_list");

  //create "Select All" checkbox
  if (!pageList.hasChildNodes()) {
    //container for select all
    var selectAllDiv = document.createElement("div");
    selectAllDiv.id = "selectAllDiv";
    pageList.appendChild(selectAllDiv);
    
    //checkbox for select all
    var selectAllCheckbox = document.createElement("input");
    selectAllCheckbox.type = "checkbox";
    selectAllCheckbox.id = "selectAllCheckbox";
    selectAllCheckbox.name = "selectAllCheckbox";
    selectAllCheckbox.checked = true
    selectAllCheckbox.addEventListener('click', changeAllChecked);
    selectAllDiv.appendChild(selectAllCheckbox);

    //label for select all
    var selectAllLabel = document.createElement("label");
    selectAllLabel.htmlFor = "selectAllCheckbox";
    selectAllLabel.innerHTML = "Select All";
    selectAllDiv.appendChild(selectAllLabel);
  }

  //container for page selector
  var newCheckboxDiv = document.createElement("div");
  newCheckboxDiv.id = "initialPage" + (printIndex + 1) + "Selector";
  pageList.appendChild(newCheckboxDiv);

  //add sectional checkbox if needed
  if (
    (//first front matter
    whichType == 1 && printIndex == 0) ||
    (//maker matter
    whichType == 2) ||
    (//first back matter
    whichType == 3 && pageIncluded[printIndex][2] == 0)
    ) {
    //sectional checkbox
    var newSectionalCheckbox = document.createElement("input");
    newSectionalCheckbox.type = "checkbox";
    newSectionalCheckbox.id = "initialPage" + (printIndex + 1) + "SectionalCheckbox";
    newSectionalCheckbox.name = "initialPage" + (printIndex + 1) + "SectionalCheckbox";
    newSectionalCheckbox.checked = true;
    newSectionalCheckbox.addEventListener('click', changeSectionalChecked);
    newCheckboxDiv.appendChild(newSectionalCheckbox);
  } else {
    //spacer div for current page if not section header
    var newSpacerDiv = document.createElement("div");
        newSpacerDiv.id = "initialPage" + (printIndex + 1) + "Spacer";
        newSpacerDiv.class = "checkboxSpacer";
        //newSpacerDiv.style = "width: 20px; height: 13px; display: inline-block;";
        newCheckboxDiv.appendChild(newSpacerDiv);
  }

  //checkbox for current page
  var newCheckbox = document.createElement("input");
  newCheckbox.type = "checkbox";
  newCheckbox.id = "initialPage" + (printIndex + 1) + "Checkbox";
  newCheckbox.name = "initialPage" + (printIndex + 1) + "Checkbox";
  newCheckbox.checked = true;
  console.log("Pre event listener");
  newCheckbox.addEventListener('click', changeSingleChecked);
  console.log("post event listener");
  newCheckboxDiv.appendChild(newCheckbox);

  //label for current page
  var newCheckboxLabel = document.createElement("label");
  newCheckboxLabel.htmlFor = "initialPage" + (printIndex + 1) + "Checkbox";
  newCheckboxLabel.innerHTML = label;
  newCheckboxDiv.appendChild(newCheckboxLabel);

  //emplaces reference to div with checkbox and text into fifth place of pageIncluded array
  pageIncluded[printIndex].push(newCheckboxDiv);
}



//toggles individual checkbox and corresponding value in pageIncluded
function changeSingleChecked(e) {
  var target = e.currentTarget;
  var targetName = target.name;
  var targetIndex = targetName.match(/\d+/)[0] - 1;
  //console.log(targetName + " at index " + targetIndex + " checked status: " + target.checked);
  //match appropriate page inclusion to checkbox status
  pageIncluded[targetIndex][0] = target.checked;

  //deselect sectional checkbox if it's selected and this box has been deselected
  var targetType = pageIncluded[targetIndex][1];
  var sectionalBox;
  //front matter sectional checkbox
  if (targetType == 1) {
    sectionalBox = document.getElementById("initialPage1SectionalCheckbox");
    //back matter sectional checkbox
  } else if (targetType == 3 || targetType == 5) {
    var tempInd = targetIndex;
    while (pageIncluded[tempInd - 1][1] != 4) {
      tempInd--;
    }
    //console.log("initialPage" + (tempInd + 1) + "SectionalCheckbox");
    var nameString = "initialPage" + (tempInd + 1) + "SectionalCheckbox";
    sectionalBox = document.getElementById(nameString);
    //console.log(sectionalBox);
    //maker matter sectional checkbox
  } else if (targetType == 2 || targetType == 4) {
    var tempInd = targetIndex;
    while (!(pageIncluded[tempInd - 1][1] == 4 && pageIncluded[tempInd][1] == 2) && pageIncluded[tempInd - 1][1] != 1) {
      tempInd--;
    }
    //console.log("initialPage" + (tempInd + 1) + "SectionalCheckbox");
    var nameString = "initialPage" + (tempInd + 1) + "SectionalCheckbox";
    sectionalBox = document.getElementById(nameString);
    //console.log(sectionalBox);

  }
  if (sectionalBox.checked && !target.checked) {
    sectionalBox.checked = false;
  }
  
  //deselect "Select All" box if it's selected and this box has been deselected
  var selectAll = document.getElementById("selectAllCheckbox");
  if (selectAll.checked && !target.checked) {
    selectAll.checked = false;
  }
}



//toggles sectional checkboxes
function changeSectionalChecked(e) {
  var target = e.currentTarget;
  var targetName = target.name;
  var targetIndex = targetName.match(/\d+/)[0] - 1;
  var targetStatus = target.checked;

  //deselect all checkboxes in section
  document.getElementById("initialPage" + (targetIndex + 1) + "Checkbox").checked = targetStatus;
  pageIncluded[targetIndex][0] = target.checked;
  targetIndex++;
  var thisElement = pageIncluded[targetIndex];
  var targetType = thisElement[1];

  while (thisElement[1] == targetType) {
    document.getElementById("initialPage" + (targetIndex + 1) + "Checkbox").checked = targetStatus;
    pageIncluded[targetIndex][0] = target.checked;
    targetIndex++;
    thisElement = pageIncluded[targetIndex];
  }
  if (targetType == 3 && thisElement[1] == 5) {
    document.getElementById("initialPage" + (targetIndex + 1) + "Checkbox").checked = targetStatus;
    pageIncluded[targetIndex][0] = target.checked;
  }

  //deselect "Select All" box if it's selected and this box has been deselected
  var selectAll = document.getElementById("selectAllCheckbox");
  if (selectAll.checked && !target.checked) {
    selectAll.checked = false;
  }
}

//toggles all checkboxes
function changeAllChecked(e) {
  var target = e.currentTarget;
  var targetName = target.name;

  var allBoxes = document.querySelectorAll('input');
  allBoxes.forEach((input) => {
    if (input.type == "checkbox" && input.name.substring(0, 11) == "initialPage") {
      //console.log(input.name);
      input.checked = target.checked;
      pageIncluded[input.name.match(/\d+/)[0] - 1][0] = target.checked;
    }
  });
}



//creates blocking program delay
// from https://www.sitepoint.com/delay-sleep-pause-wait/
function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

/*

Four modes:

Name             | Toggle Price  | Associated Graphic Object(s)                  | Included Modes                 | Included Pages (For combos, higher amount dominates)
Print Overlays   | N             | footerGraphic (includes maker page headers)   | Self                           | All
Product Pages    | Y             | productGraphic                                | Self                           | Product Pages
Print-Ready Kit  | Y             | footerGraphic, productGraphic                 | Print Overlays, Product Pages  | All
Full Catalog     | Y             | footerGraphic, productGraphic, insertGraphic  | Self, Print-Ready Kit          | All

Any mode with price toggled on will also include priceGraphic

user selection will use a Radio DOM object for mode, and a checkbox DOM object for price toggle

*/


//Remove button2
//text in graphics bug
//price checkbox currently has no impact, may be related to other abovc bug

