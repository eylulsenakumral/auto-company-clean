"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateCatalog  void 0;
var templates_json_1  require("../templates.json");
var TemplateCatalog  /** @class */ (function () {
    function TemplateCatalog() {
        this.templates  templates_json_1.default;
    }
    TemplateCatalog.prototype.getAll  function () {
        return this.templates;
    };
    TemplateCatalog.prototype.getById  function (id) {
        return this.templates.find(function (t) { return t.id  id; });
    };
    TemplateCatalog.prototype.getByCategory  function (category) {
        return this.templates.filter(function (t) { return t.category  category; });
    };
    TemplateCatalog.prototype.getCategories  function () {
        return Array.from(new Set(this.templates.map(function (t) { return t.category; })));
    };
    TemplateCatalog.prototype.search  function (query) {
        var lowerQuery  query.toLowerCase();
        return this.templates.filter(function (t) {
            return t.name.toLowerCase().includes(lowerQuery) ||
                t.description.toLowerCase().includes(lowerQuery) ||
                t.tags.some(function (tag) { return tag.toLowerCase().includes(lowerQuery); });
        });
    };
    return TemplateCatalog;
}());
exports.TemplateCatalog  TemplateCatalog;
