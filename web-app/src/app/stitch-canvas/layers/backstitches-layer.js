class BackstitchesLayer extends BaseLayer {
  constructor(scene) {
    super(scene)

    this.scene = scene;
    this.ctx = this.createContext();
    this.generateBackstitches();
    this.markers = [];

    const sceneEventListeners = {
      render: this.render.bind(this),
      resize: this.resize.bind(this),
      zoom: this.render.bind(this),
      touchstart: this.touchStart.bind(this)
    };

    this.markerEventListeners = {
      progress: this.progress.bind(this),
      complete: this.backstitchComplete.bind(this),
      abort: this.abort.bind(this)
    };

    for (const type in sceneEventListeners) {
      this.scene.addEventListener(type, sceneEventListeners[type]);
    }
  }

  dispose() {
    this.scene.component.shadowRoot.removeChild(this.ctx.canvas);
  }

  disposeMarkers() {
    this.markers.forEach(marker => {
      marker.dispose();
    });
    this.markers.length = 0;
  }

  abort() {
    this.disposeMarkers();
  }

  backstitchComplete() {
    //set flag for backstitch that bs is complete in marker
    this.disposeMarkers();
  }

  progress(e) {
    // if (this.backstitchesMap[e.detail.x * this.scene.pattern.height + e.detail.y]) {
    //   //set flag for this backstitch in bsMap but we're rendering backstitches Array
    // }
  }

  touchStart(e) {
    const x = Math.floor((e.detail.x - this.scene.x) / this.scene.stitchSize * 2);
    const y = Math.floor((e.detail.y - this.scene.y) / this.scene.stitchSize * 2);
    let tapCoords = [];
    for (let i = 0; i <= 2; i++)
      for (let j = 0; j <= 2; j++)
        tapCoords.push({ x: (x - 1) + i, y: (y - 1) + j });

    tapCoords.forEach(p => {
      const point = this.backstitchesMap[p.x * this.scene.pattern.height + p.y];
      if (point) {
        point.forEach(backstitch => {
          this.markers.push(new BackstitchMarker(this.ctx, this.scene, backstitch, p.x, p.y));
        });
        for (const type in this.markerEventListeners) {
          this.markers.forEach(marker => {
            marker.addEventListener(type, this.markerEventListeners[type]);
          });
        }
      }
    });
  }

  render() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.translate(this.scene.x + 0.5, this.scene.y + 0.5);
    this.backstitches.forEach(backstitch => {
      backstitch.draw(this.ctx, this.scene.stitchSize, this.scene.scale);
    });
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  generateBackstitches() {
    const height = this.scene.pattern.height;
    this.backstitchesMap = [];
    this.backstitches = [];
    this.scene.pattern.backstitches.forEach(bs => {
      const config = this.scene.pattern.configurations[bs.configurationIndex];
      const strands = config.strands || this.scene.pattern.strands;
      const backstitch = new Backstitch(config, strands, bs, this.scene.scale);
      [
        { x: backstitch.x1, y: backstitch.y1 },
        { x: backstitch.x2, y: backstitch.y2 }
      ].forEach(point => {
        const index = point.x * height + point.y;
        this.backstitchesMap[index] = this.backstitchesMap[index] || [];
        this.backstitchesMap[index].push(backstitch);
        this.backstitches.push(backstitch);
      });
    });
  }

  createContext() {
    let canvas = document.createElement("canvas");
    this.scene.component.shadowRoot.appendChild(canvas);
    return canvas.getContext("2d");
  }
}
