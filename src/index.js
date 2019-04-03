import React, { Component } from "react";
import ReactDOM from "react-dom";
import classnames from "classnames";
import * as d3 from "d3";
import { geoModifiedStereographicMiller } from "d3-geo-projection";
import { feature } from "topojson-client";
// import { animated, Spring } from "react-spring";
//import topoCountries from "./Europe_countries.json";
import topoCountries from "./Europe_admin_3.json";

import "./styles.css";

const width = document.body.clientWidth;
const height = 700;

const countries = feature(
  topoCountries,
  topoCountries.objects.NUTS_RG_10M_2016_4326_LEVL_3
).features;

const projection = geoModifiedStereographicMiller()
  .scale(1000)
  .translate([400, 1000]);
const geoPath = d3.geoPath().projection(projection);

const getCountryBounds = countryGeoJSON => {
  const bounds = geoPath.bounds(countryGeoJSON);
  const dx = bounds[1][0] - bounds[0][0];
  const dy = bounds[1][1] - bounds[0][1];
  const x = (bounds[0][0] + bounds[1][0]) / 2;
  const y = (bounds[0][1] + bounds[1][1]) / 2;
  const scale = 0.9 / Math.max(dx / width, dy / height);
  const translate = [width / 2 - scale * x, height / 2 - scale * y];
  return {
    translate,
    scale
  };
};

const defaultState = {
  translate: 0,
  scale: 1,
  hoveredCountry: null,
  selectedCountry: null
};

class Map extends Component {
  state = defaultState;
  onCanvasClick = () => {
    this.setState(defaultState);
  };
  onCountryHover(hoveredCountry) {
    this.setState({
      hoveredCountry
    });
  }
  onCountryClick(country) {
    //if (country === this.state.)
    const bounds = getCountryBounds(country);
    this.setState(bounds);
  }
  render() {
    const { translate, scale, hoveredCountry } = this.state;

    const { translate, scale } = getCountryBounds(
      countries.find(feature => feature.properties.NUTS_ID === currentCountry)
    );

    return (
      <div>
        Click on a country to zoom in, click again or outside to zoom out
        <svg height={height} width={width} onClick={this.onCanvasClick}>
          <g
            className="group"
            transform={`translate(${translate})scale(${scale})`}
          >
            {countries.map(country => {
              const d = geoPath(country);
              const id = country.properties.NUTS_ID;
              return (
                <path
                  key={id}
                  d={d}
                  className={classnames("country", {
                    hovered: id === hoveredCountry
                  })}
                  style={{ strokeWidth: 0.2 / scale }}
                  onMouseOver={() => this.onCountryHover(id)}
                  onClick={e => {
                    e.stopPropagation();
                    this.onCountryClick(country);
                  }}
                />
              );
            })}
          </g>
        </svg>
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<Map />, rootElement);
