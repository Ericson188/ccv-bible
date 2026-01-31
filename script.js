// PWA Installation
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI to notify the user they can install the PWA
    showInstallButton();
    
    // Show notification about install availability
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'App Install Available!',
            text: 'You can install this app for offline use!',
            icon: 'info',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    }
});

// Check if app is already installed
window.addEventListener('appinstalled', (e) => {
    console.log('App was installed successfully!');
    
    // Hide install button after successful installation
    const downloadBtn = document.getElementById('download-btn');
    if (downloadBtn) {
        downloadBtn.style.display = 'none';
    }
    
    // Show success notification
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'App Installed!',
            text: 'App has been installed successfully!',
            icon: 'success',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
    }
});

function showInstallButton() {
    const downloadBtn = document.getElementById('download-btn');
    if (downloadBtn) {
        downloadBtn.style.display = 'inline-block';
        downloadBtn.textContent = 'Install App';
        downloadBtn.title = 'Install this app for offline use';
        downloadBtn.addEventListener('click', installApp);
        
        // Add animation effect to make it more noticeable
        downloadBtn.style.animation = 'pulse 2s infinite';
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
            
            // Show success notification
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Installing...',
                    text: 'App installation in progress',
                    icon: 'info',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true
                });
            }
        } else {
            console.log('User dismissed the install prompt');
            
            // Show info notification
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Install Cancelled',
                    text: 'You can install later from browser menu',
                    icon: 'info',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true
                });
            }
        }
        deferredPrompt = null;
    });
}

// Check if app is already installed
function checkInstallStatus() {
    // Check if app is running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
        // App is installed, hide install button
        const downloadBtn = document.getElementById('download-btn');
        if (downloadBtn) {
            downloadBtn.style.display = 'none';
        }
    }
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
    { name: "Cebuano", file: "./bibles/CebuanoBible.xml" },
    { name: "Cebuano APSD", file: "./bibles/CebuanoAPSDBible.xml" },
    { name: "Cebuano RCPV", file: "./bibles/CebuanoRCPVBible.xml" }
];

let currentXmlDoc = null;
let currentVersion = versions[0];
let currentVerseRef = null;

// Personalization Data
let userData = JSON.parse(localStorage.getItem('bibleUserData')) || {
    highlights: {}, // Changed from array to object: { "reference": "color" }
    bookmarks: [],
    notes: {}
};

// Migrate old data format if needed
if (Array.isArray(userData.highlights)) {
    const oldHighlights = userData.highlights;
    userData.highlights = {};
    oldHighlights.forEach(ref => {
        userData.highlights[ref] = 'yellow'; // Default color for migrated highlights
    });
    localStorage.setItem('bibleUserData', JSON.stringify(userData));
}

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

// Notes Elements
const notesSearch = document.getElementById('notes-search');
const notesSearchIcon = document.getElementById('notes-search-icon');
const prevNotesPageBtn = document.getElementById('prev-notes-page');
const nextNotesPageBtn = document.getElementById('next-notes-page');
const notesPageInfo = document.getElementById('notes-page-info');

// Bookmarks Elements
const bookmarksSearch = document.getElementById('bookmarks-search');
const bookmarksSearchIcon = document.getElementById('bookmarks-search-icon');
const prevBookmarksPageBtn = document.getElementById('prev-bookmarks-page');
const nextBookmarksPageBtn = document.getElementById('next-bookmarks-page');
const bookmarksPageInfo = document.getElementById('bookmarks-page-info');

// Notes Pagination State
let notesPage = 1;
const notesPerPage = 5;
let notesSearchQuery = '';

// Bookmarks Pagination State
let bookmarksPage = 1;
const bookmarksPerPage = 5;
let bookmarksSearchQuery = '';

// Theme Management
const currentTheme = localStorage.getItem('theme') || 'dark';
const currentFontSize = localStorage.getItem('fontSize') || '16';

// Navigation State
const savedNavigation = JSON.parse(localStorage.getItem('bibleNavigation')) || {
    versionIndex: 0,
    bookNum: '1',
    chapterNum: '1',
    fromVerse: '1',
    toVerse: '1'
};

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
    
    // Load saved version if available
    const versionIndex = savedNavigation.versionIndex;
    if (versionIndex >= 0 && versionIndex < versions.length) {
        versionSelect.value = versionIndex;
        currentVersion = versions[versionIndex];
        await loadBible(currentVersion.file);
    } else {
        await loadBible(versions[0].file);
    }
    
    setupEventListeners();
    renderPersonalization();
    
    // Restore navigation state after DOM is ready
    restoreNavigationState();
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
        // Don't set default selection here - let restoreNavigationState handle it
        populateChapters(bookSelect.value || savedNavigation.bookNum);
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
        // Don't set default selection here - let restoreNavigationState handle it
        populateVerses(bookSelect.value || savedNavigation.bookNum, chapterSelect.value || savedNavigation.chapterNum);
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
                // Don't set default values here - let restoreNavigationState handle it
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
    
    versesContainer.innerHTML = '';
    verses.forEach(v => {
        const num = parseInt(v.getAttribute('number'));
        if (num >= fromVerse && num <= toVerse) {
            const text = v.textContent;
            const ref = `${bookName} ${chapterNum}:${num}`;
            const verseDiv = document.createElement('div');
            verseDiv.className = 'verse';
            // Check if verse is highlighted and apply color class
            if (userData.highlights[ref]) {
                verseDiv.classList.add('highlighted');
                verseDiv.classList.add(`highlight-${userData.highlights[ref]}`);
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

    // Color picker functionality
    const colorOptions = document.querySelectorAll('.color-option');
    let selectedColor = 'yellow';
    
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove active class from all options
            colorOptions.forEach(opt => opt.classList.remove('active'));
            // Add active class to clicked option
            option.classList.add('active');
            // Update selected color
            selectedColor = option.dataset.color;
        });
    });

    if (modalHighlightBtn) {
        modalHighlightBtn.addEventListener('click', () => {
            if (!currentVerseRef) return;
            
            // Check if verse is already highlighted
            if (userData.highlights[currentVerseRef]) {
                // Remove highlight
                delete userData.highlights[currentVerseRef];
            } else {
                // Add highlight with selected color
                userData.highlights[currentVerseRef] = selectedColor;
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
                const isNewNote = !userData.notes[currentVerseRef];
                userData.notes[currentVerseRef] = note;
                
                Swal.fire({
                    title: isNewNote ? 'Note Saved!' : 'Note Updated!',
                    text: isNewNote ? 'Your note has been saved successfully.' : 'Your note has been updated.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
            } else {
                // If note is empty, remove it
                delete userData.notes[currentVerseRef];
                Swal.fire({
                    title: 'Note Removed!',
                    text: 'Your note has been deleted.',
                    icon: 'info',
                    timer: 1500,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
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
            saveNavigationState(); // Save before loading new version
            await loadBible(currentVersion.file);
            restoreNavigationState(); // Restore after loading
        }
    });

    bookSelect.addEventListener('change', (e) => {
        populateChapters(e.target.value);
        saveNavigationState();
    });

    chapterSelect.addEventListener('change', () => {
        populateVerses(bookSelect.value, chapterSelect.value);
        saveNavigationState();
    });

    fromVerseSelect.addEventListener('change', () => {
        if (parseInt(toVerseSelect.value) < parseInt(fromVerseSelect.value)) {
            toVerseSelect.value = fromVerseSelect.value;
        }
        displayChapter();
        saveNavigationState();
    });

    toVerseSelect.addEventListener('change', () => {
        if (parseInt(toVerseSelect.value) < parseInt(fromVerseSelect.value)) {
            fromVerseSelect.value = toVerseSelect.value;
        }
        displayChapter();
        saveNavigationState();
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
        saveNavigationState();
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
        saveNavigationState();
    });

    // Download button is handled by the PWA install logic
    // See the installApp function above
    
    // Settings
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            settingsModal.classList.remove('hidden');
        });
    }
    
    // Notes Search
    if (notesSearch) {
        let notesSearchTimeout;
        notesSearch.addEventListener('input', (e) => {
            clearTimeout(notesSearchTimeout);
            notesSearchQuery = e.target.value.trim().toLowerCase();
            notesPage = 1; // Reset to first page on search
            renderNotes();
        });
        
        notesSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                notesSearchQuery = e.target.value.trim().toLowerCase();
                notesPage = 1;
                renderNotes();
                notesSearch.blur();
            }
        });
    }
    
    // Notes Search Icon
    if (notesSearchIcon) {
        notesSearchIcon.addEventListener('click', () => {
            notesSearchQuery = notesSearch.value.trim().toLowerCase();
            notesPage = 1;
            renderNotes();
        });
    }
    
    // Notes Pagination
    if (prevNotesPageBtn) {
        prevNotesPageBtn.addEventListener('click', () => {
            if (notesPage > 1) {
                notesPage--;
                renderNotes();
            }
        });
    }
    
    if (nextNotesPageBtn) {
        nextNotesPageBtn.addEventListener('click', () => {
            notesPage++;
            renderNotes();
        });
    }
    
    // Bookmarks Search
    if (bookmarksSearch) {
        let bookmarksSearchTimeout;
        bookmarksSearch.addEventListener('input', (e) => {
            clearTimeout(bookmarksSearchTimeout);
            bookmarksSearchQuery = e.target.value.trim().toLowerCase();
            bookmarksPage = 1; // Reset to first page on search
            renderBookmarks();
        });
        
        bookmarksSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                bookmarksSearchQuery = e.target.value.trim().toLowerCase();
                bookmarksPage = 1;
                renderBookmarks();
                bookmarksSearch.blur();
            }
        });
    }
    
    // Bookmarks Search Icon
    if (bookmarksSearchIcon) {
        bookmarksSearchIcon.addEventListener('click', () => {
            bookmarksSearchQuery = bookmarksSearch.value.trim().toLowerCase();
            bookmarksPage = 1;
            renderBookmarks();
        });
    }
    
    // Bookmarks Pagination
    if (prevBookmarksPageBtn) {
        prevBookmarksPageBtn.addEventListener('click', () => {
            if (bookmarksPage > 1) {
                bookmarksPage--;
                renderBookmarks();
            }
        });
    }
    
    if (nextBookmarksPageBtn) {
        nextBookmarksPageBtn.addEventListener('click', () => {
            bookmarksPage++;
            renderBookmarks();
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
        const isHighlighted = userData.highlights[currentVerseRef];
        modalHighlightBtn.textContent = isHighlighted 
            ? 'Remove Highlight' 
            : 'Highlight';
        
        // Update color picker selection
        const colorPicker = document.getElementById('highlight-color-picker');
        if (colorPicker) {
            const colorOptions = colorPicker.querySelectorAll('.color-option');
            colorOptions.forEach(option => {
                option.classList.remove('active');
                if (option.dataset.color === (isHighlighted || 'yellow')) {
                    option.classList.add('active');
                }
            });
        }
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
    // Render bookmarks with pagination and search
    renderBookmarks();
    
    // Render notes with pagination and search
    renderNotes();
}

function renderNotes() {
    const notesContainer = document.getElementById('notes-container');
    if (!notesContainer) return;
    
    // Get all notes and filter by search query
    const allNotes = Object.entries(userData.notes);
    const filteredNotes = notesSearchQuery 
        ? allNotes.filter(([ref, note]) => 
            ref.toLowerCase().includes(notesSearchQuery) || 
            note.toLowerCase().includes(notesSearchQuery)
        )
        : allNotes;
    
    // Calculate pagination
    const totalNotes = filteredNotes.length;
    const totalPages = Math.ceil(totalNotes / notesPerPage);
    
    // Handle edge cases
    if (totalPages === 0) {
        notesPage = 1;
        notesContainer.innerHTML = '<p>No notes found.</p>';
        updateNotesPagination(0, 0);
        return;
    }
    
    if (notesPage > totalPages) {
        notesPage = totalPages;
    }
    
    // Get notes for current page
    const startIndex = (notesPage - 1) * notesPerPage;
    const endIndex = startIndex + notesPerPage;
    const pageNotes = filteredNotes.slice(startIndex, endIndex);
    
    // Render notes
    notesContainer.innerHTML = '';
    pageNotes.forEach(([ref, note]) => {
        const div = document.createElement('div');
        div.className = 'personalization-item';
        div.innerHTML = `
            <div class="note-header">
                <strong>${ref}</strong>
                <div class="note-actions">
                    <span class="note-edit" title="Edit note">✏️</span>
                    <span class="note-delete" title="Delete note">🗑️</span>
                </div>
            </div>
            <p>${note}</p>
        `;
        div.style.cursor = 'pointer';
        div.onclick = (e) => {
            // Only navigate if clicking on the note content, not action buttons
            if (!e.target.classList.contains('note-edit') && !e.target.classList.contains('note-delete')) {
                navigateToRef(ref);
            }
        };
        
        // Add event listeners for action icons
        const editIcon = div.querySelector('.note-edit');
        const deleteIcon = div.querySelector('.note-delete');
        
        if (editIcon) {
            editIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                editNote(ref, note);
            });
        }
        
        if (deleteIcon) {
            deleteIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteNote(ref);
            });
        }
        
        notesContainer.appendChild(div);
    });
    
    // Update pagination controls
    updateNotesPagination(totalNotes, totalPages);
}

function updateNotesPagination(totalNotes, totalPages) {
    // Update page info
    if (notesPageInfo) {
        notesPageInfo.textContent = `Page ${notesPage} of ${totalPages}`;
    }
    
    // Update button states
    if (prevNotesPageBtn) {
        prevNotesPageBtn.disabled = notesPage <= 1;
    }
    
    if (nextNotesPageBtn) {
        nextNotesPageBtn.disabled = notesPage >= totalPages;
    }
    
    // Hide pagination if not needed
    const paginationControls = document.getElementById('notes-pagination');
    if (paginationControls) {
        paginationControls.style.display = totalPages > 1 ? 'flex' : 'none';
    }
}

function navigateToRef(ref) {
    navigateToParsedRef(ref);
}

function deleteBookmark(ref) {
    Swal.fire({
        title: 'Delete Bookmark?',
        text: `Are you sure you want to delete the bookmark for ${ref}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            const index = userData.bookmarks.indexOf(ref);
            if (index > -1) {
                userData.bookmarks.splice(index, 1);
                saveUserData();
                renderBookmarks();
                
                // Show success message
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Your bookmark has been deleted.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
            }
        }
    });
}

function renderBookmarks() {
    const bookmarksContainer = document.getElementById('bookmarks-container');
    if (!bookmarksContainer) return;
    
    // Filter bookmarks by search query
    const filteredBookmarks = bookmarksSearchQuery 
        ? userData.bookmarks.filter(ref => 
            ref.toLowerCase().includes(bookmarksSearchQuery)
        )
        : userData.bookmarks;
    
    // Calculate pagination
    const totalBookmarks = filteredBookmarks.length;
    const totalPages = Math.ceil(totalBookmarks / bookmarksPerPage);
    
    // Handle edge cases
    if (totalPages === 0) {
        bookmarksPage = 1;
        bookmarksContainer.innerHTML = '<p>No bookmarks found.</p>';
        updateBookmarksPagination(0, 0);
        return;
    }
    
    if (bookmarksPage > totalPages) {
        bookmarksPage = totalPages;
    }
    
    // Get bookmarks for current page
    const startIndex = (bookmarksPage - 1) * bookmarksPerPage;
    const endIndex = startIndex + bookmarksPerPage;
    const pageBookmarks = filteredBookmarks.slice(startIndex, endIndex);
    
    // Render bookmarks
    bookmarksContainer.innerHTML = '';
    pageBookmarks.forEach(ref => {
        const div = document.createElement('div');
        div.className = 'personalization-item';
        div.innerHTML = `
            <div class="bookmark-header">
                <strong>${ref}</strong>
                <div class="bookmark-actions">
                    <span class="bookmark-delete" title="Delete bookmark">🗑️</span>
                </div>
            </div>
        `;
        div.style.cursor = 'pointer';
        div.onclick = (e) => {
            // Only navigate if clicking on the bookmark content, not action buttons
            if (!e.target.classList.contains('bookmark-delete')) {
                navigateToRef(ref);
            }
        };
        
        // Add event listener for delete icon
        const deleteIcon = div.querySelector('.bookmark-delete');
        if (deleteIcon) {
            deleteIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteBookmark(ref);
            });
        }
        
        bookmarksContainer.appendChild(div);
    });
    
    // Update pagination controls
    updateBookmarksPagination(totalBookmarks, totalPages);
}

function updateBookmarksPagination(totalBookmarks, totalPages) {
    // Update page info
    if (bookmarksPageInfo) {
        bookmarksPageInfo.textContent = `Page ${bookmarksPage} of ${totalPages}`;
    }
    
    // Update button states
    if (prevBookmarksPageBtn) {
        prevBookmarksPageBtn.disabled = bookmarksPage <= 1;
    }
    
    if (nextBookmarksPageBtn) {
        nextBookmarksPageBtn.disabled = bookmarksPage >= totalPages;
    }
    
    // Hide pagination if not needed
    const paginationControls = document.getElementById('bookmarks-pagination');
    if (paginationControls) {
        paginationControls.style.display = totalPages > 1 ? 'flex' : 'none';
    }
}

function editNote(ref, currentNote) {
    // Open the verse modal with the note content
    currentVerseRef = ref;
    openVerseModal(ref);
    
    // Pre-fill the note text
    if (modalNoteText) {
        modalNoteText.value = currentNote;
    }
    
    // Show success message
    Swal.fire({
        title: 'Editing Note',
        text: `Editing note for ${ref}`,
        icon: 'info',
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
    });
    
    // Focus the note textarea
    setTimeout(() => {
        if (modalNoteText) {
            modalNoteText.focus();
            modalNoteText.select();
        }
    }, 100);
}

function deleteNote(ref) {
    Swal.fire({
        title: 'Delete Note?',
        text: `Are you sure you want to delete the note for ${ref}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            delete userData.notes[ref];
            saveUserData();
            renderNotes();
            
            // Show success message
            Swal.fire({
                title: 'Deleted!',
                text: 'Your note has been deleted.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
            
            // If we're on the last page and it becomes empty, go to previous page
            const allNotes = Object.entries(userData.notes);
            const filteredNotes = notesSearchQuery 
                ? allNotes.filter(([r, note]) => 
                    r.toLowerCase().includes(notesSearchQuery) || 
                    note.toLowerCase().includes(notesSearchQuery)
                )
                : allNotes;
            
            const totalPages = Math.ceil(filteredNotes.length / notesPerPage);
            if (notesPage > totalPages && totalPages > 0) {
                notesPage = totalPages;
                renderNotes();
            }
        }
    });
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

// Navigation State Management
function saveNavigationState() {
    const navigationState = {
        versionIndex: parseInt(versionSelect.value) || 0,
        bookNum: bookSelect.value || '1',
        chapterNum: chapterSelect.value || '1',
        fromVerse: fromVerseSelect.value || '1',
        toVerse: toVerseSelect.value || '1'
    };
    
    localStorage.setItem('bibleNavigation', JSON.stringify(navigationState));
    console.log('[Navigation] State saved:', navigationState);
}

function restoreNavigationState() {
    // Apply saved selections
    if (savedNavigation.bookNum && bookSelect.querySelector(`option[value="${savedNavigation.bookNum}"]`)) {
        bookSelect.value = savedNavigation.bookNum;
    }
    
    if (savedNavigation.chapterNum && chapterSelect.querySelector(`option[value="${savedNavigation.chapterNum}"]`)) {
        chapterSelect.value = savedNavigation.chapterNum;
    }
    
    // Populate verses for the selected chapter
    if (bookSelect.value && chapterSelect.value) {
        populateVerses(bookSelect.value, chapterSelect.value);
        
        // Set verse range selections
        if (savedNavigation.fromVerse && fromVerseSelect.querySelector(`option[value="${savedNavigation.fromVerse}"]`)) {
            fromVerseSelect.value = savedNavigation.fromVerse;
        }
        
        if (savedNavigation.toVerse && toVerseSelect.querySelector(`option[value="${savedNavigation.toVerse}"]`)) {
            toVerseSelect.value = savedNavigation.toVerse;
        }
        
        displayChapter();
    }
    
    console.log('[Navigation] State restored:', savedNavigation);
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
async function init() {
    populateVersions();
    
    // Load saved version if available
    const versionIndex = savedNavigation.versionIndex;
    if (versionIndex >= 0 && versionIndex < versions.length) {
        versionSelect.value = versionIndex;
        currentVersion = versions[versionIndex];
        await loadBible(currentVersion.file);
    } else {
        await loadBible(versions[0].file);
    }
    
    setupEventListeners();
    renderPersonalization();
    
    // Restore navigation state after DOM is ready
    restoreNavigationState();
    
    // Check if app is already installed
    checkInstallStatus();
}
