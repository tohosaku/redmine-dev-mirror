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

function getHeight(element) {
    return getComputedStyle(element).height;
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
    })
}

function clear() {
    columns.forEach(c => {
        c.itemStyle.width = '';
        c.headStyle.width = '';
    })
}

function getPosition() {
    const rect = table.getBoundingClientRect();

    if (rect.top < 0) {
        const hheight = getComputedStyle(headerrow).height;
        const top = toNum(hheight) + rect.top;
        return { top: '0', position: 'fixed', left: `${getLeft()}px`, zIndex: 1, tableTop: `${top}px`, tablePosition: 'relative' }
    } else {
        return { top: '', position: '', zIndex: '', tableTop: '', tablePosition: '' }
    }
}

function getLeft() {
    const rect = table.getBoundingClientRect();
    const scrollLeft = window.pageXOffset;
    return rect.left + scrollLeft;
}

const columns = getColumnPair();

function toggleFixed() {
    const pos = getPosition()
    const headerRowStyle = headerrow.style;

    if (typeof pos.left !== 'undefined') {
        headerRowStyle.left = pos.left;
    }

    headerRowStyle.top = pos.top;
    headerRowStyle.position = pos.position;
    headerRowStyle.zIndex = pos.zIndex;

    const tbody = firstrow.parentElement;
    tbody.style.top = pos.tableTop;
    tbody.style.position = pos.tablePosition;
}

function resetTable() {
    clear();
    setColumnWidth();
}

if (table !== null) {
    setColumnWidth();
    document.addEventListener('scroll', toggleFixed, { passive: true });
    document.addEventListener('resize', resetTable, { passive: true });
}
