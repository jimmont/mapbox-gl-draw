'use strict';

import hat from 'hat';
import { translate } from '../util';

/**
 * Base Feature class which other features extend
 *
 * @param {Object} options
 * @param {Object} options.map - Instance of MapboxGL Map
 * @param {String} options.type - Type of GeoJSON geometry
 * @param {Object} options.data - GeoJSON feature
 * @returns {Geometry} this
 */
export default class Geometry {

  constructor(options) {
    this._map = options.map;
    this.drawId = options.data.id || hat();
    this.coordinates = options.data.geometry.coordinates;
    this.properties = options.data.properties || {};
    this.type = options.type;

    this.options = {
      permanent: options.permanent
    };

    this.created = false;
    this.ready = false;
    this.commited = false;
    this.toRemove = false;
    this.selected = false;
    this.lastCoords = null;
  }

  select() {
    this.selected = true;
    if (this.lastCoords === null) {
      this.lastCoords = JSON.stringify(this.coordinates);
    }
  }

  deselect() {
    this.selected = false;
    this.lastCoords = null;
  }

  revert() {
    if (this.lastCoords !== null) {
      this.coordinates = JSON.parse(this.lastCoords);
    }
  }

  startDrawing() {
    this._map.getContainer().classList.add('mapbox-gl-draw_activated');
    if(this._map.options.doubleClickZoom) {
      this._map.doubleClickZoom.disable();
    }
  }

  /**
  * default onStopDrawing handler for all Geometry objects.
  * @return Null
  */

  onStopDrawing() {
    this.created = !this.toRemove;
    if(this._map.options.doubleClickZoom) {
      this._map.doubleClickZoom.disable();
      this._map.doubleClickZoom.enable();
    }
    this._map.getContainer().classList.remove('mapbox-gl-draw_activated');
  }

  /**
  * default onClick handler for all Geometry objects.
  * @return Null
  */

  onClick() { return null; }

  /**
  * default onDoubleClick handler for all Geometry objects.
  * @return Null
  */

  onDoubleClick() { return null; }

  /**
  * default onMouseMove handler for all Geometry objects.
  * @return Null
  */

  onMouseMove() { return null; }

  /**
  * default onMouseDown handler for all Geometry objects.
  * @return Null
  */

  onMouseDown() { return null; }


  /**
  * default onMouseUp handler for all Geometry objects.
  * @return Null
  */

  onMouseUp() { return null; }

  /**
   * @return {Object} GeoJSON feature
   */
  toGeoJSON() {
    return JSON.parse(JSON.stringify({
      type: 'Feature',
      id: this.drawId,
      properties: this.properties,
      geometry: {
        type: this.type,
        coordinates: this.coordinates
      }
    }));
  }

  /**
   * @returns Draw type
   */
  getType() {
    return this.type;
  }

  getOptions() {
    return this.options;
  }

  setCoordinates(coords) {
    this.coordinates = coords;
    return this;
  }

  setProperties(props) {
    props = JSON.parse(JSON.stringify(props));
    this.properties = props;
    return this;
  }

  /**
   * Translate this feature
   *
   * @param {Array<Number>} init - Mouse position at the beginining of the drag
   * @param {Array<Number>} curr - Current mouse position
   */
  translate(init, curr) {
    if (!this.translating) {
      this.translating = true;
      this.initGeom = this.toGeoJSON();
    }

    var translatedGeom = translate(this.initGeom, init, curr, this._map);
    this.coordinates = translatedGeom.geometry.coordinates;
  }

}
