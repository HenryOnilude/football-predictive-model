# UI & Mobile Responsiveness Checklist

> Production verification checklist for FPL Axiom Dashboard mobile compatibility.

---

## 📱 375px Sticky Columns Test

Test on iPhone SE / Galaxy S8 (375px viewport width)

### Teams Page (`/teams`)

- [ ] **Sticky First Column**: Team Name column remains fixed while scrolling horizontally
- [ ] **Column Header Alignment**: Headers align correctly with data cells during scroll
- [ ] **Touch Scroll**: Horizontal swipe gesture works smoothly on the data table
- [ ] **No Horizontal Overflow**: Page body doesn't scroll horizontally (only the table does)
- [ ] **Readable Text**: Team names are not truncated below 10 characters

### Delta Deck Page (`/luck`)

- [ ] **Card Grid**: Player cards stack vertically (1 column) on mobile
- [ ] **Filter Bar**: Position filters wrap correctly without overlapping
- [ ] **Card Readability**: Player name, team, and fixtures are all visible without scrolling within card

### Matrix Page (`/matrix`)

- [ ] **Chart Scaling**: Quadrant chart scales down proportionally
- [ ] **Touch Zoom**: Pinch-to-zoom works if chart supports it
- [ ] **Legend Visibility**: Chart legend is readable or collapsed into a menu

---

## 👆 Touch Targets (Accessibility)

Minimum touch target: **44×44px** (WCAG 2.1 Level AAA)

### Interactive Elements

| Element | Location | Min Size | Status |
|---------|----------|----------|--------|
| Sort Buttons (table headers) | `/teams`, `/` | 44×44px | [ ] |
| Position Filter Buttons | `/luck` | 44×44px | [ ] |
| Team Row Links | `/teams` | 44px height | [ ] |
| Player Card Tap Area | `/luck` | Full card | [ ] |
| Navigation Links | Header | 44×44px | [ ] |
| Close/Back Buttons | Modals/Panels | 44×44px | [ ] |

### Verification Method

```javascript
// Run in browser console on mobile viewport
document.querySelectorAll('button, a, [role="button"]').forEach(el => {
  const rect = el.getBoundingClientRect();
  if (rect.width < 44 || rect.height < 44) {
    console.warn('Small touch target:', el, `${rect.width}x${rect.height}`);
  }
});
```

---

## 📊 Data Density (Tablet 768px-1024px)

### Column Visibility Strategy

| Column | Desktop | Tablet | Mobile |
|--------|---------|--------|--------|
| Team Name | ✅ Visible | ✅ Visible | ✅ Sticky |
| Position | ✅ Visible | ✅ Visible | ✅ Visible |
| Points | ✅ Visible | ✅ Visible | ✅ Visible |
| xPTS | ✅ Visible | ✅ Visible | 📜 Scroll |
| Variance | ✅ Visible | ✅ Visible | 📜 Scroll |
| Risk Score | ✅ Visible | ✅ Visible | 📜 Scroll |
| Goals For | ✅ Visible | 📜 Scroll | ❌ Hidden |
| Goals Against | ✅ Visible | 📜 Scroll | ❌ Hidden |
| xG For | ✅ Visible | 📜 Scroll | ❌ Hidden |
| xG Against | ✅ Visible | ❌ Hidden | ❌ Hidden |

### Verification Checklist

- [ ] **No Layout Break**: Table doesn't cause horizontal page scroll
- [ ] **Scroll Indicator**: Visual hint that more columns exist (shadow/fade)
- [ ] **Essential Data First**: Most important columns are visible without scroll
- [ ] **Consistent Row Height**: All rows maintain same height across viewport sizes

---

## 🧪 Testing Commands

### Playwright Mobile Test

```bash
npm run test:ui -- --project=mobile
```

### Chrome DevTools

1. Open DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Select device: iPhone 12 Pro, iPad, Galaxy S8
4. Test each route: `/`, `/teams`, `/luck`, `/matrix`

### Lighthouse Mobile Audit

```bash
npx lighthouse http://localhost:3000 --view --preset=mobile
```

Target Scores:
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90

---

## ✅ Sign-Off

| Tester | Device | Date | Pass/Fail |
|--------|--------|------|-----------|
| | iPhone 12 | | |
| | iPad Air | | |
| | Galaxy S21 | | |
| | Desktop Chrome | | |

**Approved for Production:** [ ] Yes / [ ] No

**Notes:**
```
_________________________________
_________________________________
_________________________________
```
