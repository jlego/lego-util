/**
 * 组件名称.js v0.0.14
 * (c) 2017 Ronghui Yu
 * @license MIT
 */
"use strict";

var _templateObject = _taggedTemplateLiteral([ '<transfer id="tableFileds"></transfer>' ], [ '<transfer id="tableFileds"></transfer>' ]);

function _taggedTemplateLiteral(strings, raw) {
    return Object.freeze(Object.defineProperties(strings, {
        raw: {
            value: Object.freeze(raw)
        }
    }));
}

Object.assign(Lego.UI.Util, {
    saveAttachment: function saveAttachment(Data, uploadView, response, itemView, callback) {
        var resp = $.extend(true, {}, response);
        delete resp._id;
        var options = {
            body: {
                data: {}
            }
        };
        resp.url = Lego.config.downloadUri + resp.key;
        resp.width = resp.width || undefined;
        resp.height = resp.height || undefined;
        options.body.data = resp;
        Data.fetch("saveAttachment", options, function(result) {
            if (result.success) {
                var hasOne = uploadView.options.value.find(function(item) {
                    return item.file.hash == result.data.hash;
                });
                if (hasOne) {
                    if (result.data.id) hasOne.id = result.data.id;
                    uploadView.refresh();
                    setTimeout(function() {
                        var inputEl = uploadView.$(".lego-upload-value");
                        if (inputEl.length) inputEl.valid();
                    }, 200);
                    if (typeof callback == "function") callback(result.data.id);
                }
                Lego.UI.message("success", "上传成功");
            } else {
                Lego.UI.message("error", "上传失败");
            }
        });
    },
    sorterFun: function sorterFun(Data, view, property, order) {
        var api = view.options.dataSource.api, apiName = Array.isArray(api) ? api[0] : api;
        view.options.dataSource[apiName].body.sorts = view.options.dataSource[apiName].body.sorts || [];
        var sorts = view.options.dataSource[apiName].body.sorts, findOne = sorts ? sorts.find(function(item) {
            return item.property == property;
        }) : null;
        if (findOne) {
            if (order) {
                findOne.property = property;
                findOne.order = order;
            } else {
                view.options.dataSource[apiName].body.sorts = sorts.filter(function(item) {
                    return item.property !== property;
                });
            }
        } else {
            sorts.unshift({
                property: property,
                order: order
            });
        }
        this.saveColumnSetting(Data, view);
        view.fetch();
    },
    filterFun: function filterFun(content, self, col, event) {
        Lego.UI.popover({
            el: $(event.currentTarget),
            container: "th",
            content: typeof content == "string" ? content : content.$el,
            html: true,
            placement: "bottom",
            showNow: true
        });
    },
    saveColumnSetting: function saveColumnSetting(Data, tableView) {
        if (tableView.options.alias) {
            var options = {
                body: {
                    data: {
                        table_sign: tableView.options.alias,
                        column_memory: JSON.stringify(tableView.columnsObj)
                    }
                }
            };
            Data.fetch("saveColumnSetting", options, function(result) {
                console.log("保存字段成功");
            });
        }
    },
    showTableSetting: function showTableSetting(Data, tableView, event) {
        var colsettingData = [], that = this;
        if (tableView.allColumns.length) {
            tableView.allColumns.forEach(function(col) {
                if (col.key !== "operate") {
                    var hasOne = tableView.columnsObj[col.key];
                    if (hasOne) {
                        colsettingData.push({
                            id: col.key,
                            name: col.title,
                            checked: !hasOne.isHide
                        });
                    }
                }
            });
        }
        Lego.UI.modal({
            title: "表格设置",
            content: hx(_templateObject),
            isMiddle: true,
            width: 450,
            height: 300,
            backdrop: true,
            components: [ {
                el: "#tableFileds",
                titles: [ "全部字段", "显示字段" ],
                height: 300,
                onChange: function onChange(self, result) {
                    this.context.selectedArr = result;
                },
                data: colsettingData
            } ],
            onOk: function onOk(self) {
                if (self.selectedArr) {
                    tableView.allColumns.forEach(function(col) {
                        var hasOne = self.selectedArr.find(function(item) {
                            return item.id == col.key;
                        });
                        tableView.columnsObj[col.key].isHide = !hasOne;
                    });
                    tableView.refresh();
                }
                self.close();
                that.saveColumnSetting(Data, tableView);
            }
        });
    },
    saveRecrod: function saveRecrod(Data, apiName) {
        var record = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var msg = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "";
        var options = {
            body: {
                data: {}
            }
        };
        options.body.data = record;
        Data.fetch(apiName, options, function(result) {
            if (result.success) {
                if (typeof msg == "function") {
                    msg(result);
                } else {
                    Lego.UI.message("success", msg + "成功!");
                }
            } else {
                var msgStr = (typeof msg == "string" ? msg : "操作") + "失败! ";
                if (result.error) msgStr += result.error;
                Lego.UI.message("error", msgStr);
            }
        });
    }
});

var index = Lego.UI.Util;

module.exports = index;
