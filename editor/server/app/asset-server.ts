import * as fs from 'fs/promises';
import * as http from 'http';
import { IncomingMessage, Server, ServerResponse } from 'http';
import * as path from 'path';

const SERVER_PORT = parseInt(process.env['port'] ?? '4201', 10);

export class AssetServer {
  static #server: Server;
  static #root: string;

  static get root() {
    return this.#root;
  }

  static get assetsRoot() {
    return path.join(this.root, 'assets');
  }

  constructor(root: string) {
    AssetServer.setRoot(root);
    AssetServer.#server = http.createServer(this.#listener.bind(this));
    AssetServer.#server.listen(SERVER_PORT, () => console.log(`Asset Server listening on port ${SERVER_PORT}`));
  }

  static start(projectRoot: string = '') {
    const server = new AssetServer(projectRoot);
    return server;
  }

  static stop() {
    this.#server.close();
  }

  static restart(root?: string) {
    this.stop();
    this.start(root ?? this.#root);
  }

  static setRoot(root: string) {
    this.#root = root;
    console.log('Project Root:', this.#root);
  }

  async #listener(req: IncomingMessage, res: ServerResponse) {
    if (!req.url) return res.end();
    const url = new URL(req.url, `http://${req.headers.host}`);

    const asset = await this.#getAsset(url);
    if (typeof asset === 'number') {
      res.statusCode = asset;
    } else if (asset instanceof Buffer) {
      res.statusCode = 200;
      res.write(asset);
    }

    // End the request
    return res.end();
  }

  /**
   * Gets the asset from the filesystem.
   * @param url The url for the asset.
   * @returns The asset data or a 404.
   */
  async #getAsset(url: URL) {
    const root = AssetServer.#root;
    const assetPath = decodeURIComponent(url.pathname ?? '');

    // If the folder or the asset path are set attempt to get the asset.
    if (root && assetPath) {
      const fullPath = path.join(root, assetPath);
      console.log('Get Asset:', fullPath);
      let fileExists = false;

      // Try to read the file from the filesystem.
      try {
        const stat = await fs.stat(fullPath);
        fileExists = stat.isFile();
      } catch (e) {}

      // If the file was found return it.
      if (fileExists) {
        return fs.readFile(fullPath);
      }
    }

    // The file could not be accessed send a 404.
    return 404;
  }
}
