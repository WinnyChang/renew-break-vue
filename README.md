# RenewBreak

A web-based timer application that helps users maintain healthy work intervals by managing focus sessions and break times, including eye rest reminders.

## Features

- Stand Up Timer with customizable durations (25, 50, 75 minutes)
- Automatic Break Timer coordination (5, 10, 15 minutes respectively)
- Eye Rest Timer integration (Off, , 20, 30 minutes)
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

- Vue.js 3
- Web Workers for timer management
- Browser Notifications API
- HTML5/CSS3

## Live Demo

Visit [your-github-pages-url]

## Version

Current version: 1.0.0

## Feedback

Your feedback is valuable! Feel free to fill out the [feedback form](https://forms.gle/thmp2eGWhjhP5kur7) to help improve RenewBreak.

## License

MIT License