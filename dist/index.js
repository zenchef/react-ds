var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React from 'react';
import PropTypes from 'prop-types';

var Selection = function (_React$PureComponent) {
  _inherits(Selection, _React$PureComponent);

  function Selection(props) {
    _classCallCheck(this, Selection);

    var _this = _possibleConstructorReturn(this, (Selection.__proto__ || Object.getPrototypeOf(Selection)).call(this, props));

    _this.bind = function () {
      _this.props.target.addEventListener('mousedown', _this.onMouseDown);
      _this.props.target.addEventListener('touchstart', _this.onTouchStart);
    };

    _this.reset = function () {
      if (_this.props.target) {
        _this.props.target.removeEventListener('mousedown', _this.onMouseDown);
      }
    };

    _this.onMouseDown = function (e) {
      if (_this.props.disabled || e.button === 2 || e.nativeEvent && e.nativeEvent.which === 2) {
        return;
      }

      var nextState = {};
      if (e.ctrlKey || e.altKey || e.shiftKey) {
        nextState.appendMode = true;
      }

      nextState.mouseDown = true;
      nextState.startPoint = {
        x: e.pageX - _this.props.offset.left,
        y: e.pageY - _this.props.offset.top
      };

      _this.setState(nextState);

      window.document.addEventListener('mousemove', _this.onMouseMove);
      window.document.addEventListener('mouseup', _this.onMouseUp);
    };

    _this.onTouchStart = function (e) {
      if (_this.props.disabled || !e.touches || !e.touches[0] || e.touches.length > 1) {
        return;
      }

      var nextState = {};
      if (e.ctrlKey || e.altKey || e.shiftKey) {
        nextState.appendMode = true;
      }
      nextState.mouseDown = true;
      nextState.startPoint = {
        x: e.touches[0].pageX - _this.props.offset.left,
        y: e.touches[0].pageY - _this.props.offset.top
      };

      _this.setState(nextState);
      window.document.addEventListener('touchmove', _this.onTouchMove);
      window.document.addEventListener('touchend', _this.onMouseUp);
    };

    _this.onMouseUp = function () {
      window.document.removeEventListener('touchmove', _this.onTouchMove);
      window.document.removeEventListener('mousemove', _this.onMouseMove);
      window.document.removeEventListener('mouseup', _this.onMouseUp);
      window.document.removeEventListener('touchend', _this.onMouseUp);

      _this.setState({
        mouseDown: false,
        startPoint: null,
        endPoint: null,
        selectionBox: null,
        appendMode: false
      });

      _this.props.onSelectionChange(_this.selectedChildren);
      _this.selectedChildren = [];
    };

    _this.onMouseMove = function (e) {
      e.preventDefault();
      if (_this.state.mouseDown) {
        var _endPoint = {
          x: e.pageX - _this.props.offset.left,
          y: e.pageY - _this.props.offset.top
        };

        _this.setState({
          endPoint: _endPoint,
          selectionBox: _this.calculateSelectionBox(_this.state.startPoint, _endPoint)
        });
      }
    };

    _this.onTouchMove = function (e) {
      e.preventDefault();
      if (_this.state.mouseDown) {
        var _endPoint2 = {
          x: e.touches[0].pageX - _this.props.offset.left,
          y: e.touches[0].pageY - _this.props.offset.top
        };

        _this.setState({
          endPoint: _endPoint2,
          selectionBox: _this.calculateSelectionBox(_this.state.startPoint, _endPoint2)
        });
      }
    };

    _this.lineIntersects = function (lineA, lineB) {
      return lineA[1] >= lineB[0] && lineB[1] >= lineA[0];
    };

    _this.boxIntersects = function (boxA, boxB) {
      // calculate coordinates of all points
      var boxAProjection = {
        x: [boxA.left, boxA.left + boxA.width],
        y: [boxA.top, boxA.top + boxA.height]
      };

      var boxBProjection = {
        x: [boxB.left, boxB.left + boxB.width],
        y: [boxB.top, boxB.top + boxB.height]
      };

      return _this.lineIntersects(boxAProjection.x, boxBProjection.x) && _this.lineIntersects(boxAProjection.y, boxBProjection.y);
    };

    _this.updateCollidingChildren = function (selectionBox) {
      _this.selectedChildren = [];
      if (_this.props.elements) {
        _this.props.elements.forEach(function (ref, $index) {
          if (ref) {
            var refBox = ref.getBoundingClientRect();
            var tmpBox = {
              top: refBox.top - _this.props.offset.top,
              left: refBox.left - _this.props.offset.left,
              width: ref.clientWidth,
              height: ref.clientHeight
            };

            if (_this.boxIntersects(selectionBox, tmpBox)) {
              _this.selectedChildren.push($index);
            }
          }
        });
      }
    };

    _this.calculateSelectionBox = function (startPoint, endPoint) {
      if (!_this.state.mouseDown || !startPoint || !endPoint) {
        return null;
      }

      // The extra 1 pixel is to ensure that the mouse is on top
      // of the selection box and avoids triggering clicks on the target.
      var left = Math.min(startPoint.x, endPoint.x) - 1;
      var top = Math.min(startPoint.y, endPoint.y) - 1;
      var width = Math.abs(startPoint.x - endPoint.x) + 1;
      var height = Math.abs(startPoint.y - endPoint.y) + 1;

      return {
        left: left,
        top: top,
        width: width,
        height: height
      };
    };

    _this.state = {
      mouseDown: false,
      startPoint: null,
      endPoint: null,
      selectionBox: null,
      appendMode: false
    };

    _this.selectedChildren = [];
    return _this;
  } // eslint-disable-line react/prefer-stateless-function


  _createClass(Selection, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.reset();
      this.bind();
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this.reset();
      this.bind();
      if (this.state.mouseDown && this.state.selectionBox) {
        this.updateCollidingChildren(this.state.selectionBox);
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.reset();
      window.document.removeEventListener('mousemove', this.onMouseMove);
      window.document.removeEventListener('mouseup', this.onMouseUp);
    }

    /**
     * On root element mouse down
     * @private
     */


    /**
     * On document element mouse up
     * @private
     */


    /**
     * On document element mouse move
     * @private
     */


    /**
     * Calculate if two segments overlap in 1D
     * @param lineA [min, max]
     * @param lineB [min, max]
     */


    /**
     * Detect 2D box intersection - the two boxes will intersect
     * if their projections to both axis overlap
     * @private
     */


    /**
     * Updates the selected items based on the
     * collisions with selectionBox
     * @private
     */


    /**
     * Calculate selection box dimensions
     * @private
     */

  }, {
    key: 'render',


    /**
     * Render
     */
    value: function render() {
      var style = _extends({
        position: 'absolute',
        background: 'rgba(159, 217, 255, 0.3)',
        border: 'solid 1px rgba(123, 123, 123, 0.61)',
        zIndex: 9,
        cursor: 'crosshair'
      }, this.state.selectionBox, this.props.style);
      if (!this.state.mouseDown || !this.state.endPoint || !this.state.startPoint) {
        return null;
      }
      return React.createElement('div', { className: 'react-ds-border', style: style });
    }
  }]);

  return Selection;
}(React.PureComponent);

export default Selection;


Selection.propTypes = {
  target: PropTypes.object,
  disabled: PropTypes.bool,
  onSelectionChange: PropTypes.func.isRequired,
  elements: PropTypes.array.isRequired,
  offset: PropTypes.object.isRequired,
  style: PropTypes.object
};