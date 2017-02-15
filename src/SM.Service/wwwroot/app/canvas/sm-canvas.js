'use strict';

class Canvas extends Polymer.Element {
  static get is() { return 'sm-canvas'; }

  static get config() {
    return {
      properties: {
        enabled: {
          type: Object,
          reflectToAttribute: true,
          observer: '_enabledChanged'
        }
      }
    };
  }

  constructor() {
    super();
    this._offsetX = 10;
    this._offsetY = 10;
  }

  _enabledChanged() {
    if (this.enabled) {
      if (!this.offsetWidth) {
        console.log('Requesting animation frame.')
        window.requestAnimationFrame(this._draw.bind(this));
      } else {
        console.log('Rendering.')
        this._draw();
      }

      // TOOD: Move to a better place.
      this._mouseEvent = {};
      let onMove = (e) => {
        // TODO: Check that the button is pressed. Mouse up even could occure outside of canvas boundaries.

        console.log(this._mouseEvent);

        if (this._mouseEvent[1] && this._mouseEvent[3]) {

          this._offsetX += e.movementX;
          this._offsetY += e.movementY;

          this._draw();
        }
      };

      this.$.canvas.addEventListener("mousedown", (e) => {
        this._mouseEvent[e.which] = e;

        // TODO: Do not subscribe twice in case of two buttons movement.
        this.$.canvas.addEventListener("mousemove", onMove);
      });

      this.$.canvas.addEventListener("mouseup", (e) => {
        this.$.canvas.removeEventListener("mousemove", onMove);
        this._mouseEvent[e.which] = null;

        let canvas = this.$.canvas;
        let ctx = this.$.canvas.getContext('2d');

        // TODO: Make sure we calculate stitch position correctly.

        let relativeX = e.offsetX - this._offsetX;
        let relativeY = e.offsetY - this._offsetY;

        // TODO: Check for canvas boundaries.
        if (relativeX > 0 && relativeY > 0) {

          const stitchSize = 30;
          let stitchX = this._offsetX + Math.floor(relativeX / stitchSize) * stitchSize;
          let stitchY = this._offsetY + Math.floor(relativeY / stitchSize) * stitchSize;

          ctx.fillStyle = 'blue';
          ctx.fillRect(stitchX + 1, stitchY + 1, stitchSize - 1, stitchSize - 1)
        }
      });

      this._resizeListener = this._draw.bind(this);
      window.addEventListener("resize", this._resizeListener);
    } else {
      window.removeEventListener('resize', this._resizeListener);
    }
  }

  _draw() {
    const width = this.offsetWidth;
    const height = this.offsetHeight;

    const canvas = this.$.canvas;

    canvas.width = width;
    canvas.height = height;

    var ctx = canvas.getContext('2d');

    this._drawGrid(canvas, ctx);
  }

  _drawGrid(canvas, ctx) {
    const stitchSize = 30;

    ctx.strokeStyle = '#e0e0e0';
    ctx.beginPath();

    for (let i = this._offsetX + 0.5; i < canvas.width; i += stitchSize) {

      ctx.moveTo(i, this._offsetY);
      ctx.lineTo(i, canvas.height);
    }

    for (let i = this._offsetY + 0.5; i < canvas.height; i += stitchSize) {
      ctx.moveTo(this._offsetX, i);
      ctx.lineTo(canvas.width, i);

    }

    ctx.stroke();
  }
}

customElements.define(Canvas.is, Canvas);