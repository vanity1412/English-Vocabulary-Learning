// Get parameters from URL
const urlParams = new URLSearchParams(window.location.search);
const partNumber = urlParams.get('part');
const topicFile = urlParams.get('topic');
const topicTitle = urlParams.get('title');

// Set title
document.getElementById('topicTitle').textContent = decodeURIComponent(topicTitle || 'Lý thuyết');

// Back button
document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = `part-detail.html?part=${partNumber}`;
});

// Load topic content
async function loadTopicContent() {
    const topicContent = document.getElementById('topicContent');
    
    try {
        const response = await fetch(`part${partNumber}/topics/${topicFile}`);
        const topicData = await response.json();
        
        if (topicData.content && topicData.content.trim() !== '') {
            topicContent.innerHTML = topicData.content;
        } else {
            topicContent.innerHTML = '<p style="color: #95a5a6; text-align: center; padding: 40px;">Nội dung lý thuyết sẽ được cập nhật sau...</p>';
        }
    } catch (error) {
        console.error('Error loading topic content:', error);
        topicContent.innerHTML = '<p style="color: #e74c3c; text-align: center; padding: 40px;">Không thể tải nội dung. Vui lòng thử lại sau.</p>';
    }
}

loadTopicContent();
