"use client";
"use strict";
var __awaiter  (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P  Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator  generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator  (this && this.__generator) || function (thisArg, body) {
    var _  { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g  Object.create((typeof Iterator  "function" ? Iterator : Object).prototype);
    return g.next  verb(0), g["throw"]  verb(1), g["return"]  verb(2), typeof Symbol  "function" && (g[Symbol.iterator]  function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g  0, op[0] && (_  0)), _) try {
            if (f  1, y && (t  op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t  y["return"]) && t.call(y), 0) : y.next) && !(t  t.call(y, op[1])).done) return t;
            if (y  0, t) op  [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t  op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y  op[1]; op  [0]; continue;
                case 7: op  _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t  _.trys, t  t.length > 0 && t[t.length - 1]) && (op[0]  6 || op[0]  2)) { _  0; continue; }
                    if (op[0]  3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label  op[1]; break; }
                    if (op[0]  6 && _.label < t[1]) { _.label  t[1]; t  op; break; }
                    if (t && _.label < t[2]) { _.label  t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op  body.call(thisArg, _);
        } catch (e) { op  [6, e]; y  0; } finally { f  t  0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductCard  ProductCard;
var react_1  require("react");
function ProductCard(_a) {
    var _this  this;
    var product  _a.product;
    var _b  (0, react_1.useState)(false), copied  _b[0], setCopied  _b[1];
    var copyToClipboard  function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, navigator.clipboard.writeText(product.npmInstall)];
                case 1:
                    _a.sent();
                    setCopied(true);
                    setTimeout(function () { return setCopied(false); }, 2000);
                    return [2 /*return*/];
            }
        });
    }); };
    return (<div className"group p-5 bg-card hover:bg-card-hover rounded-lg border border-dark-800 hover:border-dark-700 transition-all duration-200">
      <div className"flex items-start justify-between gap-4">
        <div className"flex-1 min-w-0">
          <h3 className"text-lg font-semibold text-white group-hover:text-accent transition-colors">
            {product.name}
          </h3>
          <p className"text-sm text-dark-400 mt-1">{product.category}</p>
          <p className"text-sm text-dark-300 mt-3 line-clamp-2">
            {product.description}
          </p>
        </div>
        <span className"text-xs font-mono text-dark-500 whitespace-nowrap">
          v{product.version}
        </span>
      </div>

      <div className"mt-4 flex items-center gap-2">
        <code className"flex-1 text-xs font-mono bg-dark-900 text-dark-300 px-3 py-2 rounded truncate">
          {product.npmInstall}
        </code>
        <button onClick{copyToClipboard} className"p-2 hover:bg-dark-800 rounded transition-colors group/btn relative" aria-label"Copy to clipboard">
          {copied ? (<>
              <svg className"w-5 h-5 text-success" fill"none" stroke"currentColor" viewBox"0 0 24 24">
                <path strokeLinecap"round" strokeLinejoin"round" strokeWidth{2} d"M5 13l4 4L19 7"/>
              </svg>
              <span className"absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-success text-white px-2 py-1 rounded whitespace-nowrap">
                Copied!
              </span>
            </>) : (<svg className"w-5 h-5 text-dark-400 group-hover/btn:text-white transition-colors" fill"none" stroke"currentColor" viewBox"0 0 24 24">
              <path strokeLinecap"round" strokeLinejoin"round" strokeWidth{2} d"M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>)}
        </button>
      </div>

      <div className"mt-4 flex items-center gap-4 text-xs text-dark-500">
        {product.github && (<a href{product.github} target"_blank" rel"noopener noreferrer" className"hover:text-dark-300 transition-colors flex items-center gap-1">
            <svg className"w-4 h-4" fill"currentColor" viewBox"0 0 24 24">
              <path d"M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </a>)}
        {product.npm && (<a href{product.npm} target"_blank" rel"noopener noreferrer" className"hover:text-dark-300 transition-colors flex items-center gap-1">
            <svg className"w-4 h-4" fill"currentColor" viewBox"0 0 24 24">
              <path d"M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22c-5.523 0-10-4.477-10-10S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-16c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 10c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z"/>
            </svg>
            npm
          </a>)}
      </div>
    </div>);
}
