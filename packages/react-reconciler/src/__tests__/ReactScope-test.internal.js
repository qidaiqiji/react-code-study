/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

let React;
let ReactFeatureFlags;

describe('ReactScope', () => {
  beforeEach(() => {
    jest.resetModules();
    ReactFeatureFlags = require('shared/ReactFeatureFlags');
    ReactFeatureFlags.enableScopeAPI = true;
    React = require('react');
  });

  describe('ReactDOM', () => {
    let ReactDOM;
    let container;

    beforeEach(() => {
      ReactDOM = require('react-dom');
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    afterEach(() => {
      document.body.removeChild(container);
      container = null;
    });

    it('getScopedNodes() works as intended', () => {
      const TestScope = React.unstable_createScope((type, props) => true);
      const scopeRef = React.createRef();
      const divRef = React.createRef();
      const spanRef = React.createRef();
      const aRef = React.createRef();

      function Test({toggle}) {
        return toggle ? (
          <TestScope ref={scopeRef}>
            <div ref={divRef}>DIV</div>
            <span ref={spanRef}>SPAN</span>
            <a ref={aRef}>A</a>
          </TestScope>
        ) : (
          <TestScope ref={scopeRef}>
            <a ref={aRef}>A</a>
            <div ref={divRef}>DIV</div>
            <span ref={spanRef}>SPAN</span>
          </TestScope>
        );
      }

      ReactDOM.render(<Test toggle={true} />, container);
      let nodes = scopeRef.current.getScopedNodes();
      expect(nodes).toEqual([divRef.current, spanRef.current, aRef.current]);
      ReactDOM.render(<Test toggle={false} />, container);
      nodes = scopeRef.current.getScopedNodes();
      expect(nodes).toEqual([aRef.current, divRef.current, spanRef.current]);
    });

    it('mixed getParent() and getScopedNodes() works as intended', () => {
      const TestScope = React.unstable_createScope((type, props) => true);
      const TestScope2 = React.unstable_createScope((type, props) => true);
      const refA = React.createRef();
      const refB = React.createRef();
      const refC = React.createRef();
      const refD = React.createRef();
      const spanA = React.createRef();
      const spanB = React.createRef();
      const divA = React.createRef();
      const divB = React.createRef();

      function Test() {
        return (
          <div>
            <TestScope ref={refA}>
              <span ref={spanA}>
                <TestScope2 ref={refB}>
                  <div ref={divA}>
                    <TestScope ref={refC}>
                      <span ref={spanB}>
                        <TestScope2 ref={refD}>
                          <div ref={divB}>>Hello world</div>
                        </TestScope2>
                      </span>
                    </TestScope>
                  </div>
                </TestScope2>
              </span>
            </TestScope>
          </div>
        );
      }

      ReactDOM.render(<Test />, container);
      const dParent = refD.current.getParent();
      expect(dParent).not.toBe(null);
      expect(dParent.getScopedNodes()).toEqual([
        divA.current,
        spanB.current,
        divB.current,
      ]);
      const cParent = refC.current.getParent();
      expect(cParent).not.toBe(null);
      expect(cParent.getScopedNodes()).toEqual([
        spanA.current,
        divA.current,
        spanB.current,
        divB.current,
      ]);
      expect(refB.current.getParent()).toBe(null);
      expect(refA.current.getParent()).toBe(null);
    });

    it('getChildren() works as intended', () => {
      const TestScope = React.unstable_createScope((type, props) => true);
      const TestScope2 = React.unstable_createScope((type, props) => true);
      const refA = React.createRef();
      const refB = React.createRef();
      const refC = React.createRef();
      const refD = React.createRef();
      const spanA = React.createRef();
      const spanB = React.createRef();
      const divA = React.createRef();
      const divB = React.createRef();

      function Test() {
        return (
          <div>
            <TestScope ref={refA}>
              <span ref={spanA}>
                <TestScope2 ref={refB}>
                  <div ref={divA}>
                    <TestScope ref={refC}>
                      <span ref={spanB}>
                        <TestScope2 ref={refD}>
                          <div ref={divB}>>Hello world</div>
                        </TestScope2>
                      </span>
                    </TestScope>
                  </div>
                </TestScope2>
              </span>
            </TestScope>
          </div>
        );
      }

      ReactDOM.render(<Test />, container);
      const dChildren = refD.current.getChildren();
      expect(dChildren).toBe(null);
      const cChildren = refC.current.getChildren();
      expect(cChildren).toBe(null);
      const bChildren = refB.current.getChildren();
      expect(bChildren).toEqual([refD.current]);
      const aChildren = refA.current.getChildren();
      expect(aChildren).toEqual([refC.current]);
    });
  });
});
