# 🕒 Countdown Timer - Shopify Theme App Extension

## 📖 Overview

This **Countdown Timer** is a fully customizable Shopify Theme App Extension that allows merchants to:

* Display a banner with a **countdown timer**
* Choose from multiple announcement types: `Simple`, `Marquee`, and `Carousel`
* Show buttons with customizable positions
* Set view limits using `localStorage`
* Control behavior via the Shopify **Theme Editor**

It’s responsive, accessible, and integrates seamlessly into any Shopify storefront.

---

## 📂 File Structure

```
├── assets
│   ├── countdown-timer.css
│   └── countdown-timer.js
├── sections
│   └── countdown-timer.liquid
```

---

## 🚀 Installation & Usage

### 1. Add Section to Theme

Place `countdown-timer.liquid` inside your app’s `/sections` folder.

### 2. Reference Assets

Ensure `countdown-timer.css` and `countdown-timer.js` are uploaded to the `/assets` folder and included:

```liquid
{{ 'countdown-timer.css' | asset_url | stylesheet_tag }}
<script src="{{ 'countdown-timer.js' | asset_url }}" defer></script>
```

### 3. Add Section via Theme Editor

Use the Shopify theme editor to add the **Countdown Timer** section where needed.

---

## ⚙️ Configuration Options

| Setting              | Type     | Description                                            |
| -------------------- | -------- | ------------------------------------------------------ |
| `announcement_type`  | Select   | Choose the banner type: Simple, Marquee, Carousel      |
| `title`              | Text     | Banner heading (Simple only)                           |
| `carousel_messages`  | TextArea | Enter multiple messages (newline separated)            |
| `marquee_speed`      | Range    | Control marquee scroll speed (in seconds)              |
| `show_timer`         | Checkbox | Toggle the countdown timer (Simple only)               |
| `end_date`           | Text     | Countdown target date/time (e.g., 2030-12-31 23:59:59) |
| `bg_color`           | Color    | Background color for the banner                        |
| `text_color`         | Color    | Text color                                             |
| `enable_button_link` | Checkbox | Toggle button visibility                               |
| `show_button`        | Checkbox | Choose between styled button or basic link             |
| `button_position`    | Select   | Position the button (top, bottom, left, right)         |
| `button_label`       | Text     | Label for the button/link                              |
| `button_url`         | URL      | Destination link for the button                        |
| `enable_view_limit`  | Checkbox | Limit banner views per visitor                         |
| `max_views`          | Number   | Max number of views before hiding the banner           |

---

##  Features & Logic

### ⏳ Countdown Timer

* Automatically updates every second
* Supports expiration message when time runs out
* Works only in `Simple` mode

###  View Limit

* Uses `localStorage` to store view count
* Resets if configuration changes
* Applies per-browser/session

### 🧾 Carousel & Marquee

* Carousel: auto-rotates slides every 3s
* Marquee: infinitely scrolling text (pauses on hover)

### 🔁 Auto Initialization

* Works with `DOMContentLoaded` and `shopify:section:load`

---

## 📱 Responsive Design

Optimized for all devices:

* Mobile-friendly styles
* Button positions adapt on small screens
* Large screen enhancements for better UX

---

## 🛑 Notes

* Timer **requires a valid `end_date`** (e.g., `YYYY-MM-DD HH:MM:SS`)
* Changing section settings resets view counts

---



## 🙋 Support

For issues or enhancements, contact the developer or open an issue in the app repo.

---

Happy Selling! 🚀
