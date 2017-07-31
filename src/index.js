/**
 * 公共函数库
 */
Object.assign(Lego.UI.Util, {
    // 保存附件
    saveAttachment(Data, uploadView, response, itemView, callback) {
        let resp = $.extend(true, {}, response);
        delete resp._id;
        const options = {body: {data: {}}};
        resp.url = Lego.config.downloadUri + resp.key;
        resp.width = resp.width || undefined;
        resp.height = resp.height || undefined;
        options.body.data = resp;
        Data.fetch('saveAttachment', options, function(result) {
            if (result.success) {
                const hasOne = uploadView.options.value.find(item => item.file.hash == result.data.hash);
                if (hasOne) {
                    if (result.data.id) hasOne.id = result.data.id;
                    uploadView.refresh();
                    setTimeout(function(){
                        let inputEl = uploadView.$('.lego-upload-value');
                        if(inputEl.length) inputEl.valid();
                    }, 200);
                    if(typeof callback == 'function') callback(result.data.id);
                }
                Lego.UI.message('success', '上传成功');
            } else {
                Lego.UI.message('error', '上传失败');
            }
        });
    },
    // 表格排序
    sorterFun(Data, view, property, order) {
        let api = view.options.dataSource.api,
            apiName = Array.isArray(api) ? api[0] : api;
        view.options.dataSource[apiName].body.sorts = view.options.dataSource[apiName].body.sorts || [];
        let sorts = view.options.dataSource[apiName].body.sorts,
            findOne = sorts ? sorts.find(item => item.property == property) : null;
        if (findOne) {
            if (order) {
                findOne.property = property;
                findOne.order = order;
            } else {
                view.options.dataSource[apiName].body.sorts = sorts.filter(item => item.property !== property);
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
    // 表格字段条件筛选
    filterFun(content, self, col, event) {
        Lego.UI.popover({
            el: $(event.currentTarget),
            container: 'th',
            content: typeof content == 'string' ? content : content.$el,
            html: true,
            placement: 'bottom',
            showNow: true
        });
    },
    // 保存字段
    saveColumnSetting(Data, tableView) {
        if (tableView.options.alias) {
            let options = {
                body: {
                    data: {
                        table_sign: tableView.options.alias,
                        column_memory: JSON.stringify(tableView.columnsObj)
                    }
                }
            };
            Data.fetch('saveColumnSetting', options, function(result) {
                console.log('保存字段成功');
            });
        }
    },
    // 显示表格设置
    showTableSetting(Data, tableView, event) {
        let colsettingData = [],
            that = this;
        if (tableView.allColumns.length) {
            tableView.allColumns.forEach(col => {
                if (col.key !== 'operate') {
                    let hasOne = tableView.columnsObj[col.key];
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
            title: '表格设置',
            content: hx `<transfer id="tableFileds"></transfer>`,
            isMiddle: true,
            width: 450,
            height: 300,
            backdrop: true,
            components: [{
                el: '#tableFileds',
                titles: ['全部字段', '显示字段'],
                height: 300,
                onChange(self, result) {
                    this.context.selectedArr = result;
                },
                data: colsettingData
            }],
            onOk(self) {
                if (self.selectedArr) {
                    tableView.allColumns.forEach(col => {
                        let hasOne = self.selectedArr.find(item => item.id == col.key);
                        tableView.columnsObj[col.key].isHide = !hasOne;
                    });
                    tableView.refresh();
                }
                self.close();
                that.saveColumnSetting(Data, tableView);
            }
        });
    },
    // 修改表单某字段
    saveRecrod(Data, apiName, record = {}, msg = '') {
        const options = {
            body: {
                data: {}
            }
        };
        options.body.data = record;
        Data.fetch(apiName, options, function(result) {
            if (result.success) {
                if (typeof msg == 'function') {
                    msg(result);
                } else {
                    Lego.UI.message('success', msg + '成功!');
                }
            } else {
                let msgStr = (typeof msg == 'string' ? msg : '操作') + '失败! ';
                if (result.error) msgStr += result.error;
                Lego.UI.message('error', msgStr);
            }
        });
    }
});

export default Lego.UI.Util;
