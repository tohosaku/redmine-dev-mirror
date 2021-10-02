function toNum(width) {
    return (width.replace(/px/g, '') * 1);
}

class ColumnWidth {

    constructor(element) {
        this.element = element;
    }

    get computedStyle() {
        return getComputedStyle(this.element);
    }

    get style() {
        return this.element.style;
    }

    setWidth(clientWidth) {
        const width = clientWidth - this.getPropertyValue('padding-left') - this.getPropertyValue('padding-right')
        this.style.width = `${width}px`;
    }

    clear() {
        this.style.width = '';
    }

    getPropertyValue(key) {
        return toNum(this.computedStyle.getPropertyValue(key));
    }
}

class ColumnCollection {

    constructor(headers, items) {
        this.columns = items.map((item, i) => 
        ({
            head: new ColumnWidth(headers[i]),
            item: new ColumnWidth(item)
        }));
    }
    
    update() {
        this.columns.forEach(c => {
            const clientwidth = c.item.element.clientWidth;
            c.item.setWidth(clientwidth);
            c.head.setWidth(clientwidth);
        });
    }
    
    clear() {
        this.columns.forEach(c => {
            c.item.clear();
            c.head.clear();
        })
    }

    reset() {
        this.clear();
        this.update();
    }
}

class PositionInfo {

    constructor(table, headerrow, itemrow) {
        this.table = table;
        this.headerrow = headerrow;
        this.itemrow = itemrow
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

    update() {
        const pos = this.getPosition();
        const headerRowStyle = headerrow.style;
    
        if (typeof pos.left !== 'undefined' && headerRowStyle.left !== pos.left) {
            headerRowStyle.left = pos.left;
        }
    
        if (headerRowStyle.top !== pos.top) {
            headerRowStyle.top = pos.top;
            headerRowStyle.position = pos.position;
            headerRowStyle.zIndex = pos.zIndex;
        }
    
        const tbody = this.itemrow.parentElement;
        if (tbody.style.top !== pos.tbodyTop || toNum(pos.tbodyTop) > 0) {
            tbody.style.top = pos.tbodyTop;
            tbody.style.position = pos.tbodyPosition;
        }
    }

    get scrollLeft() {
        return window.pageXOffset;
    }
    
    get rect() {
        return this.table.getBoundingClientRect();
    }
}

const table = document.querySelector('table.issues.list');

const headerrow = table.querySelector('thead tr');
const firstrow = table.querySelector('tbody tr');

if (table !== null) {

    const columns = new ColumnCollection(Array.from(headerrow.children), Array.from(firstrow.children));
    columns.update();

    const posInfo = new PositionInfo(table, headerrow, firstrow);

    window.addEventListener('scroll', () => posInfo.update(), { passive: true });
    window.addEventListener('resize', () => columns.reset(), { passive: true });
}
