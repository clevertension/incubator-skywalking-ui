import React, { Component } from 'react';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import nodeHtmlLabel from 'cytoscape-node-html-label';
import conf from './conf';

cytoscape.use(coseBilkent);
cytoscape.use(nodeHtmlLabel);

const cyStyle = {
  height: '400px',
  display: 'block',
};

export default class Base extends Component {
  componentDidMount() {
    this.cy = cytoscape({
      ...conf,
      elements: this.transform(this.props.elements),
      style: this.getStyle(),
    });
    this.cy.nodeHtmlLabel(this.getNodeLabel());
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.elements === this.elements) {
      return;
    }
    this.cy.json({ elements: this.transform(nextProps.elements), style: this.getStyle() });
    const layout = this.cy.layout({
      name: 'cose-bilkent',
      animate: 'end',
      dealEdgeLength: 200,
      padding: 10,
    });
    layout.pon('layoutstop').then(() => {
      this.cy.minZoom(this.cy.zoom());
    });
    layout.run();
  }
  shouldComponentUpdate() {
    return false;
  }
  componentWillUnmount() {
    this.cy.destroy();
  }
  getCy() {
    return this.cy;
  }
  transform(elements) {
    if (!elements) {
      return [];
    }
    this.elements = elements;
    const { nodes, calls } = elements;
    return {
      nodes: nodes.map(node => ({ data: node })),
      edges: calls.filter(call => (nodes.findIndex(node => node.id === call.source) > -1
        && nodes.findIndex(node => node.id === call.target) > -1))
        .map(call => ({ data: { ...call, id: `${call.source}-${call.target}` } })),
    };
  }
  render() {
    return (<div style={cyStyle} ref={(el) => { conf.container = el; }} />);
  }
}
