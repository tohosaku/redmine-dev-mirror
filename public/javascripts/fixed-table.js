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

class ColumnCollection {

    constructor(headers, items) {
        this.cols = items.map((item, i) => 
        ({
            head: new ColumnWidth(headers[i]),
            item: new ColumnWidth(item)
        }));
    }
    
    update() {
        this.cols.forEach(c => {
            const itemwidth = c.item.element.clientWidth;
            c.item.setWidth(itemwidth);
            c.head.setWidth(itemwidth);
        });
        this.updateHeaderRow();
    }
    
    clear() {
        this.cols.forEach(c => {
            c.item.clear();
            c.head.clear();
        })
    }

    reset() {
        this.clear();
        this.update();
    }

    updateHeaderRow() {
        const col = this.cols[0];
        const hrow = col.head.element.parentElement;
        const irow = col.item.element.parentElement;
        hrow.style.width = getComputedStyle(irow).width
    }
}

class FixedTable {

    constructor(table, headerrow, itemrow) {
        this.table = table;
        this.headerrow = headerrow;
        this.itemrow = itemrow
    }

    init() {
        this.columns =  new ColumnCollection(Array.from(this.headerrow.children), Array.from(this.itemrow.children));
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
        }
    
        const tbodyStyle = this.itemrow.parentElement.style;
        if (tbodyStyle.top !== pos.tbodyTop || toNum(pos.tbodyTop) > 0) {
            tbodyStyle.top = pos.tbodyTop;
            tbodyStyle.position = pos.tbodyPosition;
        }
    }

    reset() {
        this.columns.reset();
    }

    getPosition() {
        if (this.rect.top < 0) {
            return { top: '0', position: 'fixed', left: `${this.getLeft()}px`, zIndex: 1, tbodyTop: `${this.getTbodyTop()}px`, tbodyPosition: 'relative' }
        } else {
            return { top: '', position: '', zIndex: '', tbodyTop: '', tbodyPosition: '' }
        }
    }

    getTbodyTop() {
        const hheight = getComputedStyle(this.headerrow).height;
        return toNum(hheight) + this.rect.top;
    }
    
    getLeft() {
        return this.rect.left + this.scrollLeft;
    }

    get scrollLeft() {
        return window.pageXOffset;
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
