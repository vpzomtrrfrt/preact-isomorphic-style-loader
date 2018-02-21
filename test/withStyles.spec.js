/**
 * Isomorphic CSS style loader for Webpack
 *
 * Copyright © 2015-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { JSDOM } from 'jsdom';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import preact, { Component } from 'preact';
import PropTypes from 'proptypes';
import withStyles from '../src/withStyles';

const { window } = new JSDOM('<!doctype html><html><body></body></html>');

global.window = window;
global.document = window.document;
global.navigator = window.navigator;

describe('withStyles(...styles)(WrappedComponent)', () => {
  it('Should call insetCss and removeCss functions provided by context', (done) => {
    class Provider extends Component {
      getChildContext() {
        return { insertCss: this.props.insertCss };
      }

      render() {
        return this.props.children;
      }
    }

    Provider.propTypes = {
      insertCss: PropTypes.func.isRequired,
      children: PropTypes.node.isRequired,
    };

    Provider.childContextTypes = {
      insertCss: PropTypes.func.isRequired,
    };

    class Foo extends Component {
      render() {
        return <div />;
      }
    }

    const FooWithStyles = withStyles('')(Foo);
    const insertCss = sinon.spy(() => done);
    const container = document.createElement('div');

    preact.render(
      <Provider insertCss={insertCss}>
        <FooWithStyles />
      </Provider>,
      container,
    );
    preact.render('', container, container.firstElementChild);
    expect(insertCss.calledOnce).to.be.true;
  });

  it('Should set the displayName correctly', () => {
    expect(withStyles('')(
      class Foo extends Component {
        render() {
          return <div />;
        }
      },
    ).displayName).to.equal('WithStyles(Foo)');
  });

  it('Should expose the component with styles as ComposedComponent', () => {
    class Container extends Component {
      render() {
        return <div />;
      }
    }

    const decorated = withStyles('')(Container);
    expect(decorated.ComposedComponent).to.equal(Container);
  });

  it('Hoists non-react statics of the composed component', () => {
    class Foo extends Component {
      render() {
        return <div />;
      }
    }
    Foo.someStaticProperty = true;

    const decorated = withStyles('')(Foo);
    expect(decorated.someStaticProperty).to.equal(true);
  });

  it('Does not hoist react statics of the composed component', () => {
    class Foo extends Component {
      render() {
        return <div />;
      }
    }
    Foo.propTypes = true;

    const decorated = withStyles('')(Foo);
    expect(decorated.propTypes).to.not.equal(true);
  });
});
