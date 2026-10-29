import * as d3 from "d3";
import * as Geo from "../geo.json";
import {useRef, useEffect} from "react";

const MAP_FILL = "#d0e3f0";
const R = 6;
const R_ACTIVE = 12;

function Map(props){
    const {launchpads = [], activePadId = null} = props;
    const width = 1000;
    const height = 600;
    const margin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 100
    };
    const containerRef = useRef(null);
    const dotsRef = useRef(null);

    useEffect(()=> {
        const root = d3.select(containerRef.current);
        root.selectAll("*").remove();

        const svg = root.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const projection = d3.geoMercator()
            .scale(70)
            .center([0, 20])
            .translate([width/2 - margin.left, height/2 - margin.top]);

        const zoomLayer = g.append("g");

        zoomLayer.selectAll("path")
            .data(Geo.features)
            .enter()
            .append("path")
            .attr("class", "topo")
            .attr("d", d3.geoPath().projection(projection))
            .attr("fill", MAP_FILL)
            .style("opacity", .7);

        const features = launchpads.map(p => ({
            type: "Feature",
            id: p.id,
            name: p.name,
            geometry: { type: "Point", coordinates: [p.longitude, p.latitude] }
        }));

        const xy = f => projection(f.geometry.coordinates) ?? [0, 0];

        const dots = zoomLayer.append("g")
            .selectAll("circle")
            .data(features)
            .join("circle")
            .attr("class", "launchpad")
            .attr("cx", f => xy(f)[0])
            .attr("cy", f => xy(f)[1])
            .attr("r", R)
            .attr("fill", "#e63946");

        dots.append("title").text(f => f.name);

        dotsRef.current = dots;

        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on('zoom', function(event) {
                zoomLayer.attr('transform', event.transform);
            });

        svg.call(zoom);

        return () => {
            dotsRef.current = null;
            root.selectAll("*").remove();
        };
    }, [launchpads]);

    useEffect(() => {
        const dots = dotsRef.current;
        if (!dots) return;

        const on = activePadId != null;

        dots
            .classed("launchpad--active", d => on && d.id === activePadId)
            .transition().duration(150)
            .attr("r", d => on && d.id === activePadId ? R_ACTIVE : R);
    }, [activePadId]);

    return(
        <div className="mapContainer map" ref={containerRef}>
        </div>
    )
}

export {Map}
