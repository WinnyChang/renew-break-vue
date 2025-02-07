# RenewBreak
A web-based timer application that helps computer users take regular eye-rest and stand-up breaks, promoting healthy work intervals.

**Live Demo:** Visit [RenewBreak](https://winnychang.github.io/renew-break-vue/)

## Features
- Stand Up Timer with customizable durations (25, 50, 75 minutes)
- Automatic Break Timer coordination (5, 10, 15 minutes respectively)
- Eye Rest Timer integration (Off, 20, 30 minutes)
  - Loops until Stand Up Timer completes
  - Automatically adjusts if longer than Stand Up Timer duration
- System notifications work across browser tabs and minimized windows
- Responsive layout that adapts to different window widths
- Clean interface with dark theme design

## Usage
1. Default Setting: 50-min Focus + 10-min Break with 20-min Eye Rest (follows 20-20-20 rule)
2. Customize Stand Up Timer and Eye Rest Timer settings as needed
3. Click 'Start' to begin your focus session
4. Use 'Pause' or 'Reset' to control timers
5. Receive notifications for:
   - Eye rest breaks
   - Stand up breaks
   - Break completion

## Technologies Used
- Vue.js 3 (Composition API)
- HTML5 and CSS3
- Web Workers for timer management
- Browser Notifications API
- Vite build tool
- GitHub Pages for deployment

## Version
Current version: 1.0.0 (Released: February 7, 2025)

## Feedback
Your feedback is valuable! Please share your thoughts via this [feedback form](https://forms.gle/thmp2eGWhjhP5kur7).

## License
MIT License

## Author
Winny Chang
