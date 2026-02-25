function selectPart(partNumber) {
    const partCard = event.currentTarget;
    if (partCard.classList.contains('disabled')) {
        return;
    }
    window.location.href = `parts/part-detail.html?part=${partNumber}`;
}
