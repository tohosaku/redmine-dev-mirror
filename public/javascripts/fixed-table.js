const table = document.querySelector('table.issues.list');

const headerrow = table.querySelector('thead tr');
const firstrow = table.querySelector('tbody tr');

function getColumnPair() {
    const headers = Array.from(headerrow.children);
    return Array.from(firstrow.children).map((item, i) => 
        ({
            head: {
                computedStyle: getComputedStyle(headers[i]),
                style: headers[i].style
            },
            item: {
                computedStyle: getComputedStyle(item),
                style: item.style
            },
            clientWidth: () => item.clientWidth
        }));
}

function getWidth(clientWidth, computedstyle) {
    const width = clientWidth - toNum(computedstyle.getPropertyValue('padding-left')) - toNum(computedstyle.getPropertyValue('padding-right'))
    return `${width}px`
}

function toNum(width) {
    return (width.replace(/px/g, '') * 1);
}

function setColumnWidth() {
    columns.forEach(c => {
        const clientwidth = c.clientWidth();
        c.item.style.width = getWidth(clientwidth , c.item.computedStyle);
        c.head.style.width = getWidth(clientwidth , c.head.computedStyle);
    });
}

function clear() {
    columns.forEach(c => {
        c.item.style.width = '';
        c.head.style.width = '';
    })
}

function getPosition() {
    const rect = table.getBoundingClientRect();

    if (rect.top < 0) {
        const hheight = getComputedStyle(headerrow).height;
        const tbodyTop = toNum(hheight) + rect.top;
        return { top: '0', position: 'fixed', left: `${getLeft()}px`, zIndex: 1, tbodyTop: `${tbodyTop}px`, tbodyPosition: 'relative' }
    } else {
        return { top: '', position: '', zIndex: '', tbodyTop: '', tbodyPosition: '' }
    }
}

function getLeft() {
    const rect = table.getBoundingClientRect();
    const scrollLeft = window.pageXOffset;
    return rect.left + scrollLeft;
}

const columns = getColumnPair();

function toggleFixed() {
    const pos = getPosition();
    const headerRowStyle = headerrow.style;

    if (typeof pos.left !== 'undefined' && headerRowStyle.left !== pos.left) {
        headerRowStyle.left = pos.left;
    }

    if (headerRowStyle.top !== pos.top) {
        headerRowStyle.top = pos.top;
        headerRowStyle.position = pos.position;
        headerRowStyle.zIndex = pos.zIndex;
    }

    const tbody = firstrow.parentElement;
    if (tbody.style.top !== pos.tbodyTop || toNum(pos.tbodyTop) > 0) {
        tbody.style.top = pos.tbodyTop;
        tbody.style.position = pos.tbodyPosition;
    }
}

function resetTable() {
    clear();
    setColumnWidth();
}

if (table !== null) {
    setColumnWidth();
    window.addEventListener('scroll', toggleFixed, { passive: true });
    window.addEventListener('resize', resetTable, { passive: true });
}
