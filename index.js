//Various attempts at server file reading
/*const fs = require("fs");
const path = require("path");

function* readAllFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    if (file.isDirectory()) {
      yield* readAllFiles(path.join(dir, file.name));
    } else {
      yield path.join(dir, file.name);
    }
  }
}

function readDir(dirPath) {
    for (const file of readAllFiles(dirPath)) {
        console.log(file);
    }
}*/

/*
//From https://web.dev/patterns/files/open-a-directory/#:~:text=To%20open%20a%20directory%2C%20call%20showDirectoryPicker%20%28%29%2C%20which,pass%20%7B%20mode%3A%20%27readwrite%27%20%7D%20to%20the%20method.
const button = document.getElementById('authorize_button');
const pre = document.querySelector('pre');

const openDirectory = async (mode = "read") => {
    // Feature detection. The API needs to be supported
    // and the app not run in an iframe.
    const supportsFileSystemAccess =
      "showDirectoryPicker" in window &&
      (() => {
        try {
          return window.self === window.top;
        } catch {
          return false;
        }
      })();
    // If the File System Access API is supported…
    if (supportsFileSystemAccess) {
      let directoryStructure = undefined;
  
      // Recursive function that walks the directory structure.
      const getFiles = async (dirHandle, path = dirHandle.name) => {
        const dirs = [];
        const files = [];
        for await (const entry of dirHandle.values()) {
          const nestedPath = `${path}/${entry.name}`;
          if (entry.kind === "file") {
            files.push(
              entry.getFile().then((file) => {
                file.directoryHandle = dirHandle;
                file.handle = entry;
                return Object.defineProperty(file, "webkitRelativePath", {
                  configurable: true,
                  enumerable: true,
                  get: () => nestedPath,
                });
              })
            );
          } else if (entry.kind === "directory") {
            dirs.push(getFiles(entry, nestedPath));
          }
        }
        return [
          ...(await Promise.all(dirs)).flat(),
          ...(await Promise.all(files)),
        ];
      };
  
      try {
        // Open the directory.
        const handle = await showDirectoryPicker({
          mode,
        });
        // Get the directory structure.
        directoryStructure = getFiles(handle, undefined);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err.name, err.message);
        }
      }
      return directoryStructure;
    }
    // Fallback if the File System Access API is not supported.
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.webkitdirectory = true;
  
      input.addEventListener('change', () => {
        let files = Array.from(input.files);
        resolve(files);
      });
      if ('showPicker' in HTMLInputElement.prototype) {
        input.showPicker();
      } else {
        input.click();
      }
    });
  };
*/
/*
  button.addEventListener('click', async () => {
    const filesInDirectory = await openDirectory();
    if (!filesInDirectory) {
      return;
    }
    Array.from(filesInDirectory).forEach((file) => (pre.textContent += `${file.name}\n`));
  });
*/

/*
let i = document.getElementById('input').addEventListener('change', (e) => {
    var Arr_Of_Objs = []
    for (let i = 0; i < e.target.files.length; i++) {
        var file_name = e.target.files[i].name
        var obj = {}
        obj["Files"] = file_name
        Arr_Of_Objs.push(obj);
        console.log(e.target.files[i].name);
    }
    Button_LIST_FILES_OnClick(Arr_Of_Objs)
    
})
*/