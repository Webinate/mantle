var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var modepress_api_1 = require("modepress-api");
/**
* A class that is used to describe the project model
*/
var Asset = (function () {
    /**
    * Creates an instance of a project
    */
    function Asset(shallowId, name, className, projectID, createdBy, json) {
        if (json === void 0) { json = []; }
        this.name = name;
        this.shallowId = shallowId;
        this.className = className;
        this.project_id = projectID;
        this.createdBy = createdBy;
        this.json = json;
        this.created_on = Date.now();
        this.last_modified = Date.now();
    }
    return Asset;
})();
exports.Asset = Asset;
/**
* A class that is used to describe the assets model
*/
var AssetModel = (function (_super) {
    __extends(AssetModel, _super);
    /**
    * Creates an instance of the model
    */
    function AssetModel() {
        _super.call(this, "assets");
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("name", "", 1));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.num("shallowId", -1, -1, Infinity, modepress_api_1.NumberType.Integer));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("className", "", 1));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.id("project_id", null, true));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.id("createdBy", null, true));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("json", "", 1));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.date("created_on")).indexable(true);
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.date("last_modified")).indexable(true);
    }
    return AssetModel;
})(modepress_api_1.Model);
exports.AssetModel = AssetModel;
