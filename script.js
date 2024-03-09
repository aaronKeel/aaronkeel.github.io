const cos = (a, p, s) => (t) => Math.floor(a * Math.cos(t + p) + s);

class Controls {
  constructor() {
    this.collapseButton = document.getElementById("controls-collapse");
    this.collapseButton.addEventListener("click", this.toggleControlsCollapse);
    this.collapseOpen = document.getElementById("collapse-open");
    this.collapseClosed = document.getElementById("collapse-closed");
    this.collapseClosed.style.display = "none";
    this.collapseOpen.style.display = "block";

    this.generateButton = document.getElementById("generate");
    this.generateButton.addEventListener("click", this.generateCanvas);

    this.controls = document.getElementById("controls-content");
    this.controls.style.display = "block";

    this.tileWidth = document.getElementById("tile-width");
    this.tileWidth.value = 300;
    this.tileHeight = document.getElementById("tile-height");
    this.tileHeight.value = 300;
    this.canvasColumns = document.getElementById("canvas-columns");
    this.canvasColumns.value = 2;
    this.canvasRows = document.getElementById("canvas-rows");
    this.canvasRows.value = 2;
    this.steps = document.getElementById("walk-steps");
    this.steps.value = 1000;

    this.canvasContainer = document.getElementById("canvas-container");
    this.canvasA = document.createElement("canvas");
    this.contextA = this.canvasA.getContext("2d");
    this.canvasB = document.createElement("canvas");
    this.contextB = this.canvasB.getContext("2d");
    this.canvasList = [this.canvasA, this.canvasB];
    this.contextList = [this.contextA, this.contextB];
    this.currentContextIndex = 1;
  }

  toggleControlsCollapse = () => {
    if (
      this.controls.style.display === "none" ||
      this.controls.style.display === ""
    ) {
      this.controls.style.display = "block";
      this.collapseClosed.style.display = "none";
      this.collapseOpen.style.display = "block";
    } else {
      this.controls.style.display = "none";
      this.collapseClosed.style.display = "block";
      this.collapseOpen.style.display = "none";
    }
  };

  generateCanvas = () => {
    if (this.canvasContainer.hasChildNodes()) {
      this.canvasContainer.removeChild(
        this.canvasList[this.currentContextIndex]
      );
    }
    this.currentContextIndex += 1;
    this.currentContextIndex %= 2;
    const currentContext = this.contextList[this.currentContextIndex];
    const currentCanvas = this.canvasList[this.currentContextIndex];

    currentContext.clearRect(0, 0, currentCanvas.width, currentCanvas.height);
    currentCanvas.width = this.tileWidth.value * this.canvasRows.value;
    currentCanvas.height = this.tileHeight.value * this.canvasColumns.value;

    this.generateWalk();

    this.canvasContainer.appendChild(currentCanvas);
  };

  generateWalk = () => {
    const context = this.contextList[this.currentContextIndex];
    const tileWidth = this.tileWidth.value;
    const tileHeight = this.tileHeight.value;
    const coords = {
      x: 0,
      y: 0,
    };
    const moveUp = () => {
      coords.y -= 1;
      if (coords.y < 0) {
        coords.y = tileHeight - 1
      }
    };
    const moveDown = () => {
      coords.y +=1;
      if (coords.y >= tileHeight) {
        coords.y = 0;
      }
    };
    const moveRight = () => {
      coords.x -= 1;
      if (coords.x < 0) {
        coords.x = tileWidth - 1;
      }
    };
    const moveLeft = () => {
      coords.x += 1;
      if (coords.x >= tileWidth) {
        coords.x = 0;
      }
    };
    const red = cos(Math.floor(255 / 2), 0, Math.floor(255 / 2));
    const green = cos(Math.floor(255 / 2), Math.PI / 3, Math.floor(255 / 2));
    const blue = cos(Math.floor(255 / 2), Math.PI, Math.floor(255 / 2));
    for (let t = 0; t < this.steps.value; t += 1) {
      const s = Math.PI * 2 * t / this.steps.value;
      context.fillStyle = `rgba(${red(s)}, ${green(s)}, ${blue(s)}, 0.1)`;
      for (let row = 0; row < this.canvasRows.value; row += 1) {
        for (let col = 0; col < this.canvasColumns.value; col += 1) {
          context.fillRect(coords.x + col * tileWidth, coords.y + row * tileHeight, 1, 1);
        }
      }
      const r = Math.floor(Math.random() * 4);
      [moveUp, moveDown, moveRight, moveLeft][r]();
    }
  };
}

window.onload = function () {
  const controls = new Controls();
};
