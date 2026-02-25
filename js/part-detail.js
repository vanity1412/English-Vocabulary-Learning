let currentPartData = null;

// Get part number from URL
const urlParams = new URLSearchParams(window.location.search);
const partNumber = urlParams.get('part');

// Load part data
async function loadPartData() {
    try {
        const response = await fetch(`../parts/part${partNumber}/overview.json`);
        currentPartData = await response.json();
        
        // Update page title and description
        document.getElementById('partTitle').textContent = currentPartData.title;
        document.getElementById('partDescription').textContent = currentPartData.description;
        
        // Render topics list
        renderTopics();
    } catch (error) {
        console.error('Error loading part data:', error);
        document.getElementById('partDescription').textContent = 'Không thể tải dữ liệu. Vui lòng thử lại sau.';
    }
}

function renderTopics() {
    const topicsList = document.getElementById('topicsList');
    topicsList.innerHTML = '';
    
    currentPartData.topics.forEach(topic => {
        if (topic.type === 'category') {
            // Render category with subtopics
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'topic-category';
            
            const categoryTitle = document.createElement('h3');
            categoryTitle.className = 'category-title';
            categoryTitle.textContent = topic.title;
            categoryDiv.appendChild(categoryTitle);
            
            topic.subtopics.forEach(subtopic => {
                const topicItem = document.createElement('div');
                topicItem.className = 'topic-item subtopic-item';
                topicItem.onclick = () => navigateToTopic(subtopic);
                
                topicItem.innerHTML = `
                    <div class="topic-info">
                        <h3>${subtopic.title}</h3>
                        <span class="topic-type">Lý thuyết</span>
                    </div>
                    <div class="topic-arrow">→</div>
                `;
                
                categoryDiv.appendChild(topicItem);
            });
            
            topicsList.appendChild(categoryDiv);
        } else {
            // Render regular topic
            const topicItem = document.createElement('div');
            topicItem.className = 'topic-item';
            topicItem.onclick = () => navigateToTopic(topic);
            
            topicItem.innerHTML = `
                <div class="topic-info">
                    <h3>${topic.title}</h3>
                    <span class="topic-type">Lý thuyết</span>
                </div>
                <div class="topic-arrow">→</div>
            `;
            
            topicsList.appendChild(topicItem);
        }
    });
}

function navigateToTopic(topic) {
    window.location.href = `topic-view.html?part=${partNumber}&topic=${topic.file}&title=${encodeURIComponent(topic.title)}`;
}

function closeModal() {
    const modal = document.getElementById('topicModal');
    modal.classList.remove('active');
}

// Close modal when clicking outside
document.getElementById('topicModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// Load data when page loads
loadPartData();
