document.addEventListener('DOMContentLoaded', () => {
    const btnScan = document.getElementById('btn-scan-children');
    const childCountSpan = document.getElementById('child-count');
    const traversalContainer = document.getElementById('traversal-container');

    btnScan.addEventListener('click', () => {
        const count = traversalContainer.childNodes.length;
        childCountSpan.textContent = count;
    });
});
