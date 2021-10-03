function toNum(width) {
    return (width.replace(/px/g, '') * 1);
}

class ColumnWidth {

    constructor(element) {
        this.element = element;
    }

    get style() {
        return this.element.style;
    }

    setWidth(clientWidth) {
        const width = clientWidth - this.css('padding-left') - this.css('padding-right')
        this.style.width = `${width}px`;
    }

    clear() {
        this.style.width = '';
    }

    css(key) {
        const computedStyle = getComputedStyle(this.element)
        return toNum(computedStyle.getPropertyValue(key));
    }
}

class ColumnCollection extends Array {

    constructor(fixedtable, headers, items) {
        super();
        this.fixedtable = fixedtable;
        items.forEach((item, i) => 
        this.push({
            head: new ColumnWidth(headers[i]),
            item: new ColumnWidth(item)
        }));
    }
    
    update() {
        this.forEach(c => {
            const itemwidth = c.item.element.clientWidth;
            c.item.setWidth(itemwidth);
            c.head.setWidth(itemwidth);
        });
        this.fixedtable.updateHeaderRow();
    }
    
    clear() {
        this.forEach(c => {
            c.item.clear();
            c.head.clear();
        })
    }

    reset() {
        this.clear();
        this.update();
    }

    setStyle(style) {
        this[0].head.style.borderLeftColor = style == '' ? '' : style.borderLeftColor
        this[0].head.style.borderLeftStyle = style == '' ? '' : style.borderLeftStyle
        this[0].head.style.borderLeftWidth = style == '' ? '' : style.borderLeftWidth
        const n = this.length - 1;
        this[n].head.style.borderLeftColor = style == '' ? '' : style.borderRightColor
        this[n].head.style.borderLeftStyle = style == '' ? '' : style.borderRightStyle
        this[n].head.style.borderLeftWidth = style == '' ? '' : style.borderRightWidth
    }
}

class FixedTable {

    constructor(table, headerrow, itemrow) {
        this.table = table;
        this.headerrow = headerrow;
        this.itemrow = itemrow
    }

    init() {
        this.columns =  new ColumnCollection(this, Array.from(this.headerrow.children), Array.from(this.itemrow.children));
        this.columns.update();
    }

    update() {
        const pos = this.getPosition();
        const headerRowStyle = this.headerrow.style;
    
        if (typeof pos.left !== 'undefined' && headerRowStyle.left !== pos.left) {
            headerRowStyle.left = pos.left;
        }
    
        if (headerRowStyle.top !== pos.top) {
            headerRowStyle.top = pos.top;
            headerRowStyle.position = pos.position;
            headerRowStyle.zIndex = pos.zIndex;
            this.columns.setStyle(pos.tableStyle);
        }
    
        const tbodyStyle = this.itemrow.parentElement.style;
        if ((pos.tbodyTop == '' || toNum(pos.tbodyTop) > 0) && tbodyStyle.top !== pos.tbodyTop) {
            tbodyStyle.top = pos.tbodyTop;
            tbodyStyle.position = pos.tbodyPosition;
        }
    }

    reset() {
        this.update();
        this.columns.reset();
    }

    getPosition() {
        if (this.rect.top < this.topLine) {
            const tableStyle = getComputedStyle(this.table);
            return { top: `${this.topLine}px`, position: 'fixed', tableStyle: tableStyle, left: this.getLeft(), zIndex: 1, tbodyTop: this.getTbodyTop(), tbodyPosition: 'relative' }
        } else {
            return { top: '', position: '', tableStyle: '', zIndex: '', tbodyTop: '', tbodyPosition: '' }
        }
    }

    getTbodyTop() {
        const height = toNum(getComputedStyle(this.headerrow).height);
        const top = this.rect.top - this.topLine
        if (height < (top * -1)) return '';
        return `${height + this.rect.top}px`;
    }
    
    getLeft() {
        const left = this.rect.left + window.pageXOffset;
        return `${left}px`
    }

    updateHeaderRow() {
        this.headerrow.style.width = getComputedStyle(this.itemrow).width
    }

    get topLine() {
        return isMobile() ? 64 : 0;
    }

    get rect() {
        return this.table.getBoundingClientRect();
    }
}

const table = document.querySelector('table.issues.list');
let ticking = false;

if (table !== null) {

    const headerrow = table.querySelector('thead tr');
    const firstrow = table.querySelector('tbody tr');
    
    const fixedtable = new FixedTable(table, headerrow, firstrow);
    fixedtable.init();

    const rafFactory = (func) => () => {
        if (!ticking) {
            requestAnimationFrame(() => {
              ticking = false;
              func();
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', rafFactory(() => fixedtable.update()), { passive: true });
    window.addEventListener('resize', rafFactory(() => fixedtable.reset()), { passive: true });
}
