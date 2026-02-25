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
        const response = await fetch(`../parts/part${partNumber}/topics/${topicFile}`);
        const topicData = await response.json();
        
        // Render content based on structure
        if (topicData.sections && Array.isArray(topicData.sections)) {
            topicContent.innerHTML = renderSections(topicData.sections);
        } else if (topicData.content && topicData.content.trim() !== '') {
            topicContent.innerHTML = topicData.content;
        } else {
            topicContent.innerHTML = '<p style="color: #95a5a6; text-align: center; padding: 40px;">Nội dung lý thuyết sẽ được cập nhật sau...</p>';
        }
    } catch (error) {
        console.error('Error loading topic content:', error);
        topicContent.innerHTML = '<p style="color: #e74c3c; text-align: center; padding: 40px;">Không thể tải nội dung. Vui lòng thử lại sau.</p>';
    }
}

// Render sections
function renderSections(sections) {
    let html = '';
    
    sections.forEach(section => {
        html += `<div class="theory-section">`;
        
        if (section.heading) {
            html += `<h2 class="section-heading">${section.heading}</h2>`;
        }
        
        if (section.content && Array.isArray(section.content)) {
            section.content.forEach(item => {
                html += renderContentItem(item);
            });
        }
        
        html += `</div>`;
    });
    
    return html;
}

// Render individual content items
function renderContentItem(item) {
    let html = '';
    
    switch (item.type) {
        case 'text':
            html += `<p class="theory-text">${item.content}</p>`;
            break;
            
        case 'info-box':
            html += `<div class="info-box">`;
            if (item.items && Array.isArray(item.items)) {
                item.items.forEach(info => {
                    html += `
                        <div class="info-item">
                            <strong>${info.label}:</strong> ${info.value}
                        </div>
                    `;
                });
            }
            html += `</div>`;
            break;
            
        case 'note':
            html += `<div class="note-box">
                <strong>📌 Lưu ý:</strong> ${item.content}
            </div>`;
            break;
            
        case 'list':
            html += `<div class="list-section">`;
            if (item.title) {
                html += `<p class="list-title"><strong>${item.title}</strong></p>`;
            }
            html += `<ul class="theory-list">`;
            if (item.items && Array.isArray(item.items)) {
                item.items.forEach(listItem => {
                    html += `<li>${listItem}</li>`;
                });
            }
            html += `</ul></div>`;
            break;
            
        case 'question-patterns':
            html += `<div class="question-patterns">`;
            if (item.title) {
                html += `<p class="patterns-title"><strong>${item.title}</strong></p>`;
            }
            html += `<ul class="patterns-list">`;
            if (item.patterns && Array.isArray(item.patterns)) {
                item.patterns.forEach(pattern => {
                    html += `<li><code>${pattern}</code></li>`;
                });
            }
            html += `</ul>`;
            if (item.note) {
                html += `<p class="patterns-note"><em>${item.note}</em></p>`;
            }
            html += `</div>`;
            break;
            
        case 'tip':
            html += `<div class="tip-box">`;
            if (item.title) {
                html += `<h4 class="tip-title">💡 ${item.title}</h4>`;
            }
            if (item.problem) {
                html += `<p><strong>Vấn đề:</strong> ${item.problem}</p>`;
            }
            if (item.solution) {
                html += `<p><strong>Giải pháp:</strong> ${item.solution}</p>`;
            }
            if (item.content) {
                html += `<p>${item.content}</p>`;
            }
            if (item.breakdown && Array.isArray(item.breakdown)) {
                html += `<ul>`;
                item.breakdown.forEach(point => {
                    html += `<li>${point}</li>`;
                });
                html += `</ul>`;
            }
            if (item.definitions && Array.isArray(item.definitions)) {
                html += `<ul>`;
                item.definitions.forEach(def => {
                    html += `<li>${def}</li>`;
                });
                html += `</ul>`;
            }
            if (item.application) {
                html += `<p><em>${item.application}</em></p>`;
            }
            if (item.example) {
                html += `<p><strong>Ví dụ:</strong> ${item.example}</p>`;
            }
            if (item.note) {
                html += `<p class="tip-note"><em>${item.note}</em></p>`;
            }
            html += `</div>`;
            break;
            
        case 'subsection':
            html += `<div class="subsection">`;
            if (item.title) {
                html += `<h3 class="subsection-title">${item.title}</h3>`;
            }
            if (item.content && Array.isArray(item.content)) {
                item.content.forEach(subItem => {
                    html += renderContentItem(subItem);
                });
            }
            if (item.items && Array.isArray(item.items)) {
                item.items.forEach(subItem => {
                    html += renderContentItem(subItem);
                });
            }
            if (item.examples && Array.isArray(item.examples)) {
                item.examples.forEach(example => {
                    html += renderExample(example);
                });
            }
            html += `</div>`;
            break;
            
        case 'structure':
            html += `<div class="structure-box">`;
            if (item.title) {
                html += `<h4 class="structure-title">${item.title}</h4>`;
            }
            if (item.parts && Array.isArray(item.parts)) {
                item.parts.forEach(part => {
                    html += `<div class="structure-part">`;
                    if (part.section) {
                        html += `<p class="part-section"><strong>${part.section}:</strong></p>`;
                    }
                    if (part.description) {
                        html += `<p class="part-description">${part.description}</p>`;
                    }
                    if (part.items && Array.isArray(part.items)) {
                        html += `<ul class="part-items">`;
                        part.items.forEach(i => {
                            html += `<li>${i}</li>`;
                        });
                        html += `</ul>`;
                    }
                    if (part.examples && Array.isArray(part.examples)) {
                        part.examples.forEach(ex => {
                            html += `<div class="part-example">`;
                            if (ex.type) {
                                html += `<p><strong>${ex.type}:</strong></p>`;
                            }
                            if (ex.details && Array.isArray(ex.details)) {
                                html += `<ul>`;
                                ex.details.forEach(d => {
                                    html += `<li>${d}</li>`;
                                });
                                html += `</ul>`;
                            }
                            html += `</div>`;
                        });
                    }
                    html += `</div>`;
                });
            }
            html += `</div>`;
            break;
            
        case 'tips':
        case 'common-words':
            html += `<div class="tips-box">`;
            if (item.title) {
                html += `<p class="tips-title"><strong>${item.title}</strong></p>`;
            }
            if (item.items && Array.isArray(item.items)) {
                html += `<ul class="tips-list">`;
                item.items.forEach(tip => {
                    html += `<li>${tip}</li>`;
                });
                html += `</ul>`;
            }
            if (item.words && Array.isArray(item.words)) {
                html += `<ul class="words-list">`;
                item.words.forEach(w => {
                    html += `<li><strong>${w.word}:</strong> ${w.meaning}</li>`;
                });
                html += `</ul>`;
            }
            html += `</div>`;
            break;
            
        case 'vocabulary-list':
            html += `<div class="vocabulary-section">`;
            if (item.categories && Array.isArray(item.categories)) {
                item.categories.forEach(cat => {
                    html += `<div class="vocab-category">`;
                    if (cat.title) {
                        html += `<h4 class="vocab-category-title">${cat.title}</h4>`;
                    }
                    if (cat.words && Array.isArray(cat.words)) {
                        html += `<ul class="vocab-list">`;
                        cat.words.forEach(w => {
                            html += `<li><strong>${w.word}:</strong> ${w.meaning}</li>`;
                        });
                        html += `</ul>`;
                    }
                    html += `</div>`;
                });
            }
            html += `</div>`;
            break;
            
        case 'common-content':
        case 'common-structures':
            html += `<div class="common-content-box">`;
            if (item.title) {
                html += `<p class="common-title"><strong>${item.title}</strong></p>`;
            }
            if (item.categories && Array.isArray(item.categories)) {
                item.categories.forEach(cat => {
                    html += `<div class="content-category">`;
                    if (cat.topic) {
                        html += `<p class="category-topic"><strong>${cat.topic}:</strong></p>`;
                    }
                    if (cat.phrases && Array.isArray(cat.phrases)) {
                        html += `<ul class="phrases-list">`;
                        cat.phrases.forEach(p => {
                            html += `<li>${p}</li>`;
                        });
                        html += `</ul>`;
                    }
                    html += `</div>`;
                });
            }
            if (item.structures && Array.isArray(item.structures)) {
                html += `<ul class="structures-list">`;
                item.structures.forEach(s => {
                    html += `<li><code>${s}</code></li>`;
                });
                html += `</ul>`;
            }
            html += `</div>`;
            break;
            
        case 'steps':
        case 'cases':
            html += `<div class="steps-box">`;
            if (item.items && Array.isArray(item.items)) {
                item.items.forEach(step => {
                    html += `<div class="step-item">`;
                    if (typeof step === 'string') {
                        html += `<p>${step}</p>`;
                    } else {
                        if (step.step || step.case) {
                            html += `<p class="step-label"><strong>${step.step || step.case}:</strong></p>`;
                        }
                        if (step.content || step.approach) {
                            html += `<p>${step.content || step.approach}</p>`;
                        }
                    }
                    html += `</div>`;
                });
            }
            html += `</div>`;
            break;
            
        case 'example':
            html += renderExample(item);
            break;
            
        case 'general-approach':
            html += `<div class="approach-box">`;
            if (item.title) {
                html += `<h4 class="approach-title">${item.title}</h4>`;
            }
            if (item.content) {
                html += `<p>${item.content}</p>`;
            }
            html += `</div>`;
            break;
    }
    
    return html;
}

// Render example
function renderExample(example) {
    let html = `<div class="example-box">`;
    
    if (example.title) {
        html += `<h4 class="example-title">${example.title}</h4>`;
    }
    
    if (example.passage) {
        html += `<div class="passage-box">`;
        if (example.passage.type) {
            html += `<p class="passage-type"><em>Hình thức: ${example.passage.type}</em></p>`;
        }
        if (example.passage.title) {
            html += `<p class="passage-title"><strong>${example.passage.title}</strong></p>`;
        }
        if (example.passage.content) {
            html += `<div class="passage-content">${example.passage.content.replace(/\n/g, '<br>')}</div>`;
        }
        html += `</div>`;
    }
    
    if (example.question) {
        html += `<div class="question-box">`;
        html += `<p class="question-text"><strong>Q: ${example.question.text}</strong></p>`;
        if (example.question.translation) {
            html += `<p class="question-translation"><em>${example.question.translation}</em></p>`;
        }
        if (example.question.note) {
            html += `<p class="question-note">📌 ${example.question.note}</p>`;
        }
        if (example.question.options && Array.isArray(example.question.options)) {
            html += `<div class="options-list">`;
            example.question.options.forEach(option => {
                const correctClass = option.correct ? ' correct-option' : '';
                html += `
                    <div class="option-item${correctClass}">
                        <strong>${option.key}.</strong> ${option.text}
                        ${option.translation ? `<br><em class="option-translation">${option.translation}</em>` : ''}
                        ${option.correct ? ' <span class="correct-mark">✓</span>' : ''}
                    </div>
                `;
            });
            html += `</div>`;
        }
        html += `</div>`;
    }
    
    if (example.solution) {
        html += `<div class="solution-box">`;
        html += `<h5 class="solution-title">Giải thích:</h5>`;
        
        if (example.solution.steps && Array.isArray(example.solution.steps)) {
            example.solution.steps.forEach(step => {
                html += `<div class="solution-step">`;
                if (step.step) {
                    html += `<p class="step-title"><strong>${step.step}:</strong></p>`;
                }
                if (step.content) {
                    html += `<p>${step.content}</p>`;
                }
                if (step.analysis && Array.isArray(step.analysis)) {
                    html += `<ul class="analysis-list">`;
                    step.analysis.forEach(point => {
                        html += `<li>${point}</li>`;
                    });
                    html += `</ul>`;
                }
                html += `</div>`;
            });
        }
        
        if (example.solution.notes && Array.isArray(example.solution.notes)) {
            example.solution.notes.forEach(note => {
                html += `<div class="solution-note">`;
                if (note.title) {
                    html += `<p class="note-title"><strong>${note.title}:</strong></p>`;
                }
                if (note.content) {
                    html += `<p>${note.content}</p>`;
                }
                if (note.questions && Array.isArray(note.questions)) {
                    html += `<ul>`;
                    note.questions.forEach(q => {
                        html += `<li>${q}</li>`;
                    });
                    html += `</ul>`;
                }
                if (note.recommendation) {
                    html += `<p><em>${note.recommendation}</em></p>`;
                }
                html += `</div>`;
            });
        }
        
        html += `</div>`;
    }
    
    html += `</div>`;
    return html;
}

loadTopicContent();
