// PWA Installation
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI to notify the user they can install the PWA
    showInstallButton();
});

function showInstallButton() {
    const downloadBtn = document.getElementById('download-btn');
    if (downloadBtn) {
        downloadBtn.style.display = 'inline-block';
        downloadBtn.textContent = 'Install App';
        downloadBtn.addEventListener('click', installApp);
    }
}

function installApp() {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }
        deferredPrompt = null;
    });
}

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

const bookNames = [
    "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
    "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah",
    "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah",
    "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah",
    "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew",
    "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians",
    "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus",
    "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"
];

const versions = [
    { name: "English ESV", file: "./bibles/EnglishESVBible.xml" },
    { name: "Cebuano", file: "./bibles/CebuanoBible.xml" }
];

let currentXmlDoc = null;
let currentVersion = versions[0];
let currentVerseRef = null;

// Personalization Data
let userData = JSON.parse(localStorage.getItem('bibleUserData')) || {
    highlights: [],
    bookmarks: [],
    notes: {}
};

function saveUserData() {
    localStorage.setItem('bibleUserData', JSON.stringify(userData));
}

// DOM Elements
const versionSelect = document.getElementById('version-select');
const bookSelect = document.getElementById('book-select');
const chapterSelect = document.getElementById('chapter-select');
const fromVerseSelect = document.getElementById('from-verse');
const toVerseSelect = document.getElementById('to-verse');
const verseSearch = document.getElementById('verse-search');
const searchResults = document.getElementById('search-results');
const versesContainer = document.getElementById('verses-container');
const currentTitle = document.getElementById('current-title');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const themeSelect = document.getElementById('theme-select');
const fontSizeSlider = document.getElementById('font-size-slider');
const fontSizeValue = document.getElementById('font-size-value');
const searchIcon = document.getElementById('search-icon');

// Theme Management
const currentTheme = localStorage.getItem('theme') || 'dark';
const currentFontSize = localStorage.getItem('fontSize') || '16';

// Apply saved theme on page load
document.body.classList.add(`${currentTheme}-mode`);
themeSelect.value = currentTheme;
document.documentElement.style.setProperty('--base-font-size', `${currentFontSize}px`);
fontSizeSlider.value = currentFontSize;
fontSizeValue.textContent = `${currentFontSize}px`;

// Modal Elements
const verseModal = document.getElementById('verse-modal');
const modalVerseRef = document.getElementById('modal-verse-ref');
const modalHighlightBtn = document.getElementById('modal-highlight');
const modalBookmarkBtn = document.getElementById('modal-bookmark');
const modalNoteText = document.getElementById('modal-note-text');
const saveNoteBtn = document.getElementById('save-note');

// Tabs
const tabs = {
    'tab-bible': 'bible-display',
    'tab-bookmarks': 'bookmarks-display',
    'tab-notes': 'notes-display'
};

// Theme Functions
function changeTheme(theme) {
    // Update classes
    document.body.classList.remove('dark-mode', 'light-mode');
    document.body.classList.add(`${theme}-mode`);
    
    // Update localStorage
    localStorage.setItem('theme', theme);
    
    // Update theme-color meta tag
    const themeColorMeta = document.getElementById('theme-color-meta');
    if (themeColorMeta) {
        themeColorMeta.setAttribute('content', theme === 'dark' ? '#121212' : '#ffffff');
    }
}

function updateThemeIcon(theme) {
    const icon = theme === 'dark' ? '🌙' : '☀️';
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    // Update theme-color meta tag
    const themeColorMeta = document.getElementById('theme-color-meta');
    if (themeColorMeta) {
        themeColorMeta.setAttribute('content', theme === 'dark' ? '#121212' : '#ffffff');
    }
    
    if (themeToggleBtn) {
        themeToggleBtn.textContent = icon;
        themeToggleBtn.title = `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`;
    }
}

// Initialize
async function init() {
    populateVersions();
    await loadBible(versions[0].file);
    setupEventListeners();
    renderPersonalization();
}

function populateVersions() {
    versionSelect.innerHTML = '';
    versions.forEach((v, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = v.name;
        versionSelect.appendChild(option);
    });
}

async function loadBible(file) {
    try {
        const response = await fetch(file);
        if (!response.ok) {
            throw new Error(`Failed to load ${file}: ${response.status}`);
        }
        const str = await response.text();
        const parser = new DOMParser();
        currentXmlDoc = parser.parseFromString(str, "text/xml");
        populateBooks();
    } catch (error) {
        console.error("Error loading Bible:", error);
        versesContainer.innerHTML = `<div class="error">Error loading Bible file. Please check if ${file} exists.</div>`;
    }
}

function populateBooks() {
    bookSelect.innerHTML = '';
    if (!currentXmlDoc) return;
    
    const books = currentXmlDoc.querySelectorAll('book');
    books.forEach(book => {
        const num = book.getAttribute('number');
        const option = document.createElement('option');
        option.value = num;
        option.textContent = bookNames[parseInt(num) - 1] || `Book ${num}`;
        bookSelect.appendChild(option);
    });
    
    if (bookSelect.options.length > 0) {
        bookSelect.selectedIndex = 0;
        populateChapters(bookSelect.value);
    }
}

function populateChapters(bookNum) {
    chapterSelect.innerHTML = '';
    if (!currentXmlDoc) return;
    
    const book = currentXmlDoc.querySelector(`book[number="${bookNum}"]`);
    if (book) {
        const chapters = book.querySelectorAll('chapter');
        chapters.forEach(ch => {
            const num = ch.getAttribute('number');
            const option = document.createElement('option');
            option.value = num;
            option.textContent = `Chapter ${num}`;
            chapterSelect.appendChild(option);
        });
    }
    
    if (chapterSelect.options.length > 0) {
        chapterSelect.selectedIndex = 0;
        populateVerses(bookSelect.value, chapterSelect.value);
    }
}

function populateVerses(bookNum, chapterNum) {
    fromVerseSelect.innerHTML = '';
    toVerseSelect.innerHTML = '';
    
    if (!currentXmlDoc) return;
    
    const book = currentXmlDoc.querySelector(`book[number="${bookNum}"]`);
    if (book) {
        const chapter = book.querySelector(`chapter[number="${chapterNum}"]`);
        if (chapter) {
            const verses = chapter.querySelectorAll('verse');
            verses.forEach(v => {
                const num = v.getAttribute('number');
                const opt1 = document.createElement('option');
                opt1.value = num;
                opt1.textContent = num;
                fromVerseSelect.appendChild(opt1);

                const opt2 = document.createElement('option');
                opt2.value = num;
                opt2.textContent = num;
                toVerseSelect.appendChild(opt2);
            });
            if (verses.length > 0) {
                fromVerseSelect.value = "1";
                toVerseSelect.value = verses.length.toString();
            }
        }
    }
    displayChapter();
}

function displayChapter() {
    if (!currentXmlDoc) {
        versesContainer.innerHTML = '<div class="error">No Bible loaded.</div>';
        return;
    }

    const bookNum = bookSelect.value;
    const chapterNum = chapterSelect.value;
    const fromVerse = parseInt(fromVerseSelect.value) || 1;
    const toVerse = parseInt(toVerseSelect.value) || 999;

    const book = currentXmlDoc.querySelector(`book[number="${bookNum}"]`);
    if (!book) {
        versesContainer.innerHTML = '<div class="error">Book not found.</div>';
        return;
    }
    
    const chapter = book.querySelector(`chapter[number="${chapterNum}"]`);
    if (!chapter) {
        versesContainer.innerHTML = '<div class="error">Chapter not found.</div>';
        return;
    }

    const bookName = bookNames[parseInt(bookNum) - 1] || `Book ${bookNum}`;
    const verses = chapter.querySelectorAll('verse');
    const totalVerses = verses.length;
    
    let reference;
    if (fromVerse === 1 && toVerse === totalVerses) {
        reference = `${bookName} ${chapterNum}`;
    } else if (fromVerse === toVerse) {
        reference = `${bookName} ${chapterNum}:${fromVerse}`;
    } else {
        reference = `${bookName} ${chapterNum}:${fromVerse}-${toVerse}`;
    }
    
    currentTitle.textContent = reference;
    verseSearch.value = reference;
    
    versesContainer.innerHTML = '';
    verses.forEach(v => {
        const num = parseInt(v.getAttribute('number'));
        if (num >= fromVerse && num <= toVerse) {
            const text = v.textContent;
            const ref = `${bookName} ${chapterNum}:${num}`;
            const verseDiv = document.createElement('div');
            verseDiv.className = 'verse';
            if (userData.highlights.includes(ref)) {
                verseDiv.classList.add('highlighted');
            }
            
            let noteIndicator = userData.notes[ref] ? '<span class="note-indicator">📝</span>' : '';
            verseDiv.innerHTML = `<span class="verse-number">${num}</span> ${text}${noteIndicator}`;
            
            verseDiv.addEventListener('click', () => openVerseModal(ref));
            versesContainer.appendChild(verseDiv);
        }
    });
    
    // Scroll to top
    window.scrollTo(0, 0);
}

function setupEventListeners() {
    // Tabs
    Object.keys(tabs).forEach(tabId => {
        const tabBtn = document.getElementById(tabId);
        if (tabBtn) {
            tabBtn.addEventListener('click', (e) => {
                Object.keys(tabs).forEach(t => {
                    document.getElementById(t).classList.remove('active');
                    document.getElementById(tabs[t]).classList.add('hidden');
                });
                e.target.classList.add('active');
                document.getElementById(tabs[tabId]).classList.remove('hidden');
                if (tabId !== 'tab-bible') renderPersonalization();
            });
        }
    });

    // Search
    let searchTimeout;
    verseSearch.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim().toLowerCase();
        if (query.length < 1) { // Allow searching with single characters
            searchResults.classList.add('hidden');
            return;
        }

        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 500);
    });

    verseSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if (navigateToParsedRef(e.target.value)) {
                searchResults.classList.add('hidden');
                verseSearch.blur();
            }
        }
    });

    // Search icon click handler
    if (searchIcon) {
        searchIcon.addEventListener('click', () => {
            const query = verseSearch.value.trim();
            if (query) {
                // Clear any existing timeout
                if (searchTimeout) {
                    clearTimeout(searchTimeout);
                }
                
                // First check if it's a verse reference (e.g., "Matthew 21-27", "Luke 1:3-4")
                if (navigateToParsedRef(query)) {
                    searchResults.classList.add('hidden');
                    verseSearch.blur();
                    return;
                }
                
                // If not a verse reference, treat as keyword search
                performSearch(query);
            }
        });
    }
    
    document.addEventListener('click', (e) => {
        if (!verseSearch.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.add('hidden');
        }
    });

    // Modal
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            const modalId = closeBtn.getAttribute('data-modal');
            document.getElementById(modalId)?.classList.add('hidden');
        });
    });

    document.addEventListener('click', (e) => {
        if (e.target === verseModal) {
            verseModal.classList.add('hidden');
        }
        if (e.target === settingsModal) {
            settingsModal.classList.add('hidden');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            verseModal.classList.add('hidden');
            settingsModal.classList.add('hidden');
            searchResults.classList.add('hidden');
        }
    });

    if (modalHighlightBtn) {
        modalHighlightBtn.addEventListener('click', () => {
            if (!currentVerseRef) return;
            const index = userData.highlights.indexOf(currentVerseRef);
            if (index > -1) {
                userData.highlights.splice(index, 1);
            } else {
                userData.highlights.push(currentVerseRef);
            }
            saveUserData();
            displayChapter();
            updateModalButtons();
        });
    }

    if (modalBookmarkBtn) {
        modalBookmarkBtn.addEventListener('click', () => {
            if (!currentVerseRef) return;
            const index = userData.bookmarks.indexOf(currentVerseRef);
            if (index > -1) {
                userData.bookmarks.splice(index, 1);
            } else {
                userData.bookmarks.push(currentVerseRef);
            }
            saveUserData();
            updateModalButtons();
            renderPersonalization();
        });
    }

    if (saveNoteBtn) {
        saveNoteBtn.addEventListener('click', () => {
            if (!currentVerseRef) return;
            const note = modalNoteText.value.trim();
            if (note) {
                userData.notes[currentVerseRef] = note;
            } else {
                delete userData.notes[currentVerseRef];
            }
            saveUserData();
            displayChapter();
            verseModal.classList.add('hidden');
            renderPersonalization();
        });
    }

    versionSelect.addEventListener('change', async (e) => {
        const versionIndex = parseInt(e.target.value);
        if (versionIndex >= 0 && versionIndex < versions.length) {
            currentVersion = versions[versionIndex];
            await loadBible(currentVersion.file);
        }
    });

    bookSelect.addEventListener('change', (e) => {
        populateChapters(e.target.value);
    });

    chapterSelect.addEventListener('change', () => {
        populateVerses(bookSelect.value, chapterSelect.value);
    });

    fromVerseSelect.addEventListener('change', () => {
        if (parseInt(toVerseSelect.value) < parseInt(fromVerseSelect.value)) {
            toVerseSelect.value = fromVerseSelect.value;
        }
        displayChapter();
    });

    toVerseSelect.addEventListener('change', () => {
        if (parseInt(toVerseSelect.value) < parseInt(fromVerseSelect.value)) {
            fromVerseSelect.value = toVerseSelect.value;
        }
        displayChapter();
    });

    document.getElementById('prev-chapter')?.addEventListener('click', () => {
        if (chapterSelect.selectedIndex > 0) {
            chapterSelect.selectedIndex--;
        } else if (bookSelect.selectedIndex > 0) {
            bookSelect.selectedIndex--;
            populateChapters(bookSelect.value);
            chapterSelect.selectedIndex = chapterSelect.options.length - 1;
        }
        populateVerses(bookSelect.value, chapterSelect.value);
        displayChapter();
    });

    document.getElementById('next-chapter')?.addEventListener('click', () => {
        if (chapterSelect.selectedIndex < chapterSelect.options.length - 1) {
            chapterSelect.selectedIndex++;
        } else if (bookSelect.selectedIndex < bookSelect.options.length - 1) {
            bookSelect.selectedIndex++;
            populateChapters(bookSelect.value);
            chapterSelect.selectedIndex = 0;
        }
        populateVerses(bookSelect.value, chapterSelect.value);
        displayChapter();
    });

    // Download button is handled by the PWA install logic
    // See the installApp function above
    
    // Settings
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            settingsModal.classList.remove('hidden');
        });
    }
    
    // Theme selection
    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            const newTheme = e.target.value;
            changeTheme(newTheme);
        });
    }
    
    // Font size slider
    if (fontSizeSlider) {
        fontSizeSlider.addEventListener('input', (e) => {
            const newSize = e.target.value;
            document.documentElement.style.setProperty('--base-font-size', `${newSize}px`);
            fontSizeValue.textContent = `${newSize}px`;
            localStorage.setItem('fontSize', newSize);
        });
    }
    
    // Clear cache button
    const clearCacheBtn = document.getElementById('clear-cache-btn');
    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', clearAllCaches);
    }
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(reg => {
            console.log('Service Worker registered', reg);
        }).catch(err => {
            console.error('Service Worker registration failed', err);
        });
    });
}

function openVerseModal(ref) {
    currentVerseRef = ref;
    modalVerseRef.textContent = ref;
    modalNoteText.value = userData.notes[ref] || '';
    updateModalButtons();
    verseModal.classList.remove('hidden');
}

function updateModalButtons() {
    if (modalHighlightBtn) {
        modalHighlightBtn.textContent = userData.highlights.includes(currentVerseRef) 
            ? 'Remove Highlight' 
            : 'Highlight';
    }
    if (modalBookmarkBtn) {
        modalBookmarkBtn.textContent = userData.bookmarks.includes(currentVerseRef) 
            ? 'Remove Bookmark' 
            : 'Bookmark';
    }
}

function performSearch(query) {
    if (!currentXmlDoc) return;
    
    searchResults.innerHTML = '';
    const results = [];
    const books = currentXmlDoc.querySelectorAll('book');
    
    // Normalize query for more flexible matching
    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery.length < 1) return; // Allow single character searches
    
    for (let book of books) {
        const bookNum = book.getAttribute('number');
        const bookName = bookNames[parseInt(bookNum) - 1];
        const chapters = book.querySelectorAll('chapter');
        
        for (let chapter of chapters) {
            const chNum = chapter.getAttribute('number');
            const verses = chapter.querySelectorAll('verse');
            
            for (let verse of verses) {
                const vNum = verse.getAttribute('number');
                const text = verse.textContent.toLowerCase();
                
                // Check if the verse text contains the query
                if (text.includes(normalizedQuery)) {
                    results.push({
                        ref: `${bookName} ${chNum}:${vNum}`,
                        bookNum, chNum, vNum, text: verse.textContent
                    });
                }
                if (results.length >= 20) break;
            }
            if (results.length >= 20) break;
        }
        if (results.length >= 20) break;
    }

    if (results.length > 0) {
        results.forEach(res => {
            const div = document.createElement('div');
            div.className = 'search-item';
            div.innerHTML = `<span class="search-ref">${res.ref}</span> ${res.text.substring(0, 100)}...`;
            div.addEventListener('click', () => {
                bookSelect.value = res.bookNum;
                populateChapters(res.bookNum);
                chapterSelect.value = res.chNum;
                populateVerses(res.bookNum, res.chNum);
                fromVerseSelect.value = res.vNum;
                toVerseSelect.value = res.vNum;
                displayChapter();
                searchResults.classList.add('hidden');
                
                // Scroll to the searched verse
                setTimeout(() => {
                    const searchedVerse = Array.from(document.querySelectorAll('.verse')).find(v => 
                        v.querySelector('.verse-number').textContent === res.vNum
                    );
                    if (searchedVerse) {
                        searchedVerse.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        searchedVerse.classList.add('search-highlight');
                        setTimeout(() => searchedVerse.classList.remove('search-highlight'), 2000);
                    }
                }, 100);
            });
            searchResults.appendChild(div);
        });
        searchResults.classList.remove('hidden');
    } else {
        searchResults.innerHTML = '<div class="search-item">No results found</div>';
        searchResults.classList.remove('hidden');
    }
}

function renderPersonalization() {
    const bookmarksContainer = document.getElementById('bookmarks-container');
    const notesContainer = document.getElementById('notes-container');
    
    if (bookmarksContainer) {
        bookmarksContainer.innerHTML = userData.bookmarks.length ? '' : '<p>No bookmarks yet.</p>';
        userData.bookmarks.forEach(ref => {
            const div = document.createElement('div');
            div.className = 'personalization-item';
            div.innerHTML = `<strong>${ref}</strong>`;
            div.style.cursor = 'pointer';
            div.onclick = () => navigateToRef(ref);
            bookmarksContainer.appendChild(div);
        });
    }

    if (notesContainer) {
        const noteEntries = Object.entries(userData.notes);
        notesContainer.innerHTML = noteEntries.length ? '' : '<p>No notes yet.</p>';
        noteEntries.forEach(([ref, note]) => {
            const div = document.createElement('div');
            div.className = 'personalization-item';
            div.innerHTML = `<strong>${ref}</strong><p>${note}</p>`;
            div.style.cursor = 'pointer';
            div.onclick = () => navigateToRef(ref);
            notesContainer.appendChild(div);
        });
    }
}

function navigateToRef(ref) {
    navigateToParsedRef(ref);
}

function navigateToParsedRef(query) {
    if (!query) return false;
    
    // Support formats: "John 3:16", "Genesis 1:1-5", "Romans 8", "1 John 1"
    const match = query.trim().match(/^(.+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/);
    if (!match) return false;

    const bookNameInput = match[1].toLowerCase();
    const chNum = match[2];
    const vStart = match[3];
    const vEnd = match[4];

    // Handle "1 John", "2 Samuel", etc.
    let bookIndex = bookNames.findIndex(b => b.toLowerCase() === bookNameInput);
    if (bookIndex === -1) {
        // Try matching without the number prefix for books like "John"
        const bookWithoutNumber = bookNameInput.replace(/^\d+\s+/, '');
        bookIndex = bookNames.findIndex(b => b.toLowerCase().endsWith(bookWithoutNumber));
    }
    
    if (bookIndex === -1) return false;

    const bookNum = (bookIndex + 1).toString();
    
    // Check if book exists in current XML
    if (!currentXmlDoc?.querySelector(`book[number="${bookNum}"]`)) {
        return false;
    }

    bookSelect.value = bookNum;
    populateChapters(bookNum);
    
    // Check if chapter exists
    const chapterExists = Array.from(chapterSelect.options).some(opt => opt.value === chNum);
    if (!chapterExists) return false;
    
    chapterSelect.value = chNum;
    populateVerses(bookNum, chNum);
    
    const maxVerses = fromVerseSelect.options.length;
    let start = 1;
    let end = maxVerses;

    if (vStart) {
        start = Math.min(Math.max(1, parseInt(vStart)), maxVerses);
        end = vEnd ? Math.min(Math.max(start, parseInt(vEnd)), maxVerses) : start;
    }

    fromVerseSelect.value = start.toString();
    toVerseSelect.value = end.toString();
    displayChapter();
    
    document.getElementById('tab-bible').click();
    return true;
}

// Cache clearing function
async function clearAllCaches() {
    try {
        // Show confirmation dialog
        const confirmed = confirm('This will clear all offline data and reload the app. Continue?');
        if (!confirmed) return;
        
        // Clear service worker caches
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(cacheName => {
                    console.log('Deleting cache:', cacheName);
                    return caches.delete(cacheName);
                })
            );
            console.log('All caches cleared!');
        }
        
        // Unregister service workers
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(
                registrations.map(registration => {
                    console.log('Unregistering service worker:', registration.scope);
                    return registration.unregister();
                })
            );
            console.log('All service workers unregistered!');
        }
        
        // Clear localStorage
        localStorage.clear();
        console.log('localStorage cleared!');
        
        // Reload the page
        window.location.reload();
        
    } catch (error) {
        console.error('Error clearing caches:', error);
        alert('Failed to clear cache. Please try again.');
    }
}

// Initialize the app
init();
