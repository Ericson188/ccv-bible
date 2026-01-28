# Holy Bible Web App

A modern, feature-rich Bible reading application built with HTML, CSS, and JavaScript.

## Features

### 📖 Core Bible Features
- **Book & Chapter Navigation** - Easy browsing through all 66 books
- **Multiple Translations** - Supports Cebuano and English ESV versions
- **Search Functionality** - Search across entire Bible with filters
- **Responsive Design** - Works on desktop, tablet, and mobile devices

### 📝 Personalization
- **Bookmarks** - Save favorite verses for quick access
- **Highlighting** - Highlight important passages
- **Reading Plans** - Track your Bible reading progress
- **Custom Themes** - Light, Dark, and Sepia themes
- **Adjustable Text** - Font size and line spacing controls

### ⚙️ Settings
- Theme selection (Light/Dark/Sepia)
- Font size adjustment (12px-24px)
- Line spacing control
- Verse number visibility toggle
- Auto-scroll preference

## Installation

### Using XAMPP (Recommended)
1. Place all files in your XAMPP htdocs folder
2. Start Apache in XAMPP Control Panel
3. Visit: `http://localhost/ccv-bible/`

### Using Python Server
```bash
cd c:\xampp111\htdocs\ccv-bible
python -m http.server 8000
```
Then visit: `http://localhost:8000`

### Using PHP Built-in Server
```bash
cd c:\xampp111\htdocs\ccv-bible
php -S localhost:8000
```
Then visit: `http://localhost:8000`

## File Structure
```
ccv-bible/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
├── CebuanoBible.xml    # Cebuano translation
├── EnglishESVBible.xml # English ESV translation
├── server.php          # PHP server file
└── README.md           # This file
```

## How to Use

### Navigation
1. Select a book from the left sidebar
2. Use chapter navigation arrows or click chapter numbers
3. Search for specific terms using the search icon

### Personal Features
- **Bookmark a verse**: Click the bookmark icon on any verse
- **Highlight a verse**: Click the highlighter icon on any verse
- **View bookmarks/highlights**: Use the right panel tabs
- **Access settings**: Click the gear icon in the header

### Search Options
- Case sensitive search
- Whole word matching
- Results show book, chapter, and verse references

## Data Storage
All user data (bookmarks, highlights, settings) is stored locally in your browser's localStorage. This data persists between sessions but is tied to your browser.

## Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Troubleshooting

### Bible text not loading
- Ensure XML files are in the same directory
- Check browser console for errors
- Verify file permissions

### Features not working
- Enable JavaScript in your browser
- Clear browser cache and reload
- Check for browser compatibility

## Customization

### Adding New Translations
1. Add XML file with proper Bible structure
2. Update translation selector in HTML
3. Modify script.js to handle new translation

### Changing Default Settings
Edit the `settings` object in script.js:
```javascript
this.settings = {
    theme: 'light',      // light, dark, sepia
    fontSize: 16,        // 12-24
    lineSpacing: 1.5,    // 1-3
    autoScroll: true,
    verseNumbers: true
};
```

## License
This project is open source and available under the MIT License.

## Author
Created for Bible study and personal devotion.
