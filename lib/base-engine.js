/**
 * Base class for all screenshot engines
 * Defines the interface that all engines must implement
 */
export class BaseEngine {
  constructor(options = {}) {
    this.options = {
      width: options.width || 1280,
      height: options.height || 1024,
      aspectRatio: options.aspectRatio || null, // e.g., "16:9", "4:3"
      delay: options.delay || 0,
      userAgent: options.userAgent || null,
      timeout: options.timeout || 30000,
      fullPage: options.fullPage || false,
      deviceScaleFactor: options.deviceScaleFactor || 1,
      ...options
    };

    // Calculate dimensions from aspect ratio if provided
    if (this.options.aspectRatio) {
      this._applyAspectRatio();
    }
  }

  /**
   * Apply aspect ratio to dimensions
   * @private
   */
  _applyAspectRatio() {
    const ratio = this.options.aspectRatio;
    const match = ratio.match(/^(\d+):(\d+)$/);

    if (!match) {
      throw new Error(`Invalid aspect ratio format: ${ratio}. Use format like "16:9" or "4:3"`);
    }

    const [_, widthRatio, heightRatio] = match.map(Number);

    // If only width is provided, calculate height
    if (this.options.width && !this.options.height) {
      this.options.height = Math.round(this.options.width * heightRatio / widthRatio);
    }
    // If only height is provided, calculate width
    else if (this.options.height && !this.options.width) {
      this.options.width = Math.round(this.options.height * widthRatio / heightRatio);
    }
    // If both provided, adjust height to match ratio
    else {
      this.options.height = Math.round(this.options.width * heightRatio / widthRatio);
    }
  }

  /**
   * Capture screenshot of a URL
   * @param {string} url - URL to capture
   * @param {string} outputPath - Path to save screenshot
   * @returns {Promise<Object>} - Result with metadata
   */
  async capture(url, outputPath) {
    throw new Error('capture() must be implemented by subclass');
  }

  /**
   * Initialize the engine
   * @returns {Promise<void>}
   */
  async initialize() {
    throw new Error('initialize() must be implemented by subclass');
  }

  /**
   * Cleanup resources
   * @returns {Promise<void>}
   */
  async cleanup() {
    throw new Error('cleanup() must be implemented by subclass');
  }

  /**
   * Get engine name
   * @returns {string}
   */
  get name() {
    return this.constructor.name;
  }

  /**
   * Get viewport configuration
   * @returns {Object}
   */
  getViewport() {
    return {
      width: this.options.width,
      height: this.options.height,
      deviceScaleFactor: this.options.deviceScaleFactor
    };
  }
}
