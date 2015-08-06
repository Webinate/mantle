var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var modepress_1 = require("modepress");
/**
* A class that is used to describe the project model
*/
var Plugin = (function () {
    /**
    * Creates an instance of a project
    */
    function Plugin() {
        this.name = "";
        this.folderName = "";
        this.description = "";
        this.shortDescription = "";
        this.plan = "basic";
        this.path = "";
        this.header = "";
        this.body = "";
        this.deployables = [];
        this.css = "";
        this.image = "";
        this.author = "Webinate Ltd";
        this.version = "0.0.1";
    }
    return Plugin;
})();
exports.Plugin = Plugin;
/**
* A class that is used to describe the plugin model
*/
var PluginModel = (function (_super) {
    __extends(PluginModel, _super);
    /**
    * Creates an instance of the model
    */
    function PluginModel() {
        _super.call(this, "plugins");
        this.defaultSchema.add(new modepress_1.SchemaFactory.text("name", "", 1));
        this.defaultSchema.add(new modepress_1.SchemaFactory.text("folderName", ""));
        this.defaultSchema.add(new modepress_1.SchemaFactory.text("description", ""));
        this.defaultSchema.add(new modepress_1.SchemaFactory.text("shortDescription", ""));
        this.defaultSchema.add(new modepress_1.SchemaFactory.text("plan", "basic", 1));
        this.defaultSchema.add(new modepress_1.SchemaFactory.text("path", "", 1));
        this.defaultSchema.add(new modepress_1.SchemaFactory.text("header", ""));
        this.defaultSchema.add(new modepress_1.SchemaFactory.text("body", ""));
        this.defaultSchema.add(new modepress_1.SchemaFactory.textArray("deployables", []));
        this.defaultSchema.add(new modepress_1.SchemaFactory.text("css", ""));
        this.defaultSchema.add(new modepress_1.SchemaFactory.text("image", ""));
        this.defaultSchema.add(new modepress_1.SchemaFactory.text("author", "", 1));
        this.defaultSchema.add(new modepress_1.SchemaFactory.text("version", "", 1));
    }
    return PluginModel;
})(modepress_1.Model);
exports.PluginModel = PluginModel;
