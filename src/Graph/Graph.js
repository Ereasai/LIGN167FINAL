// Graph.js

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './Graph.css';

const Graph = ({ topics }) => {
  const d3Container = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    console.log('rerender!')
    if (topics && d3Container.current && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;

      const svg = d3.select(d3Container.current)
        .attr('width', containerWidth)
        .attr('height', containerHeight);
      svg.selectAll("*").remove();

      const width = containerWidth;
      const height = containerHeight;

      // Define zoom behavior
      const zoom = d3.zoom()
        .scaleExtent([0.5, 2])
        .on("zoom", (event) => {
          g.attr("transform", event.transform);
        });

      // Apply zoom to the SVG
      svg.call(zoom);

      // Define the arrowhead marker
      svg.append("defs").append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "-0 -5 10 10")
        .attr("refX", 30) // Controls the position of the arrowhead along the line
        .attr("refY", 0)
        .attr("orient", "auto")
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("xoverflow", "visible")
        .append("svg:path")
        .attr("d", "M 0,-5 L 10 ,0 L 0,5")
        .attr("fill", "#999");

      // Convert the topics data into a hierarchy
      // Get the first element
      const rootName = topics[0].name
      const rootRel  = topics[0].related
      const root = d3.hierarchy({ name: rootName, related: rootRel }, d => d.related)
        .sum(() => 1)
        .sort((a, b) => (a.height - b.height) || a.data.name.localeCompare(b.data.name));

      const treeLayout = d3.tree().size([height, width]);
      const treeData = treeLayout(root);

      const g = svg.append("g")
        .attr("transform", "translate(80,0)");

      // Draw links (lines)
      g.selectAll(".link")
        .data(treeData.links())
        .enter().append("path")
        .attr("class", "link")
        .attr("d", d3.linkHorizontal()
          .x(d => d.y)
          .y(d => d.x))
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("stroke-opacity", 0.4)
        // .attr("marker-end", "url(#arrowhead)") // Apply the arrowhead marker

      // Draw nodes
      const node = g.selectAll(".node")
        .data(root.descendants())
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.y},${d.x})`);

      node.append("circle")
        .attr("r", 10)
        .attr("fill", "#3a3a3a");

      // Node labels
      node.append("text")
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 10)
        .attr("dy", 30)
        .style("text-anchor", "middle")
        .text(d => d.data.name)
        .style("fill", "white") // Make text white
        .attr("paint-order", "stroke")
        .attr("stroke", "#1a1a1a");

    }
  }, [topics]); // Dependency array

  return (
    <div ref={containerRef} style={{ width: '100%', height: '98%' }}>
      <svg ref={d3Container}></svg>
    </div>
  );
};

export default Graph;
