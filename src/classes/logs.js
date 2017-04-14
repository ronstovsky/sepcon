import 'console-polyfill';

export default class Logs {
    constructor(config) {
        this.active = true;
    }
    setActive(active) {
        this.active = active;
        return this;
    }
    print(data) {
        if(!this.active) return false;
        if(data.content) {
            this.executeConsole(data);
        }
        if(data.title) {
            data.title.style = 'title';
            data.title.type = 'groupCollapsed';
            this.executeConsole(data.title);
        }
        data.rows.forEach(row => this.executeConsole(row));
        if(data.title) {
            data.title.type = 'groupEnd';
            this.executeConsole(data.title);
        }
    }
    getStyle(stl) {
        switch(stl) {
            case 'title':
                return 'font-weight: bold; color: black; background: #f0f0f0; line-height: 1.2em; padding: .1em .2em';
            case 'label':
                return 'color: white; background: #aaaaaa; border-bottom: solid 0.2em #999999; line-height: 1.4em; padding: .1em .2em';
            case 'code':
                return 'font-style: italic; background: #f5f5f5; line-height: 1.2em; padding: .1em 0 .1em';
            case 'info':
                return 'line-height: 1.4em; padding: .1em .2em';
        }
        return stl;
    }
    executeConsole(row) {
        row.type = row.type || 'log';
        if(typeof row.content === 'object' && row.content !== null && !(row.content instanceof Element)) {
            row.content = JSON.stringify(row.content, null, 2);
        }
        if(row.style) {
            row.style = this.getStyle(row.style);
            console[row.type]('%c%s', row.style, row.content);
        }
        else {
            console[row.type](row.content);
        }
    }
}